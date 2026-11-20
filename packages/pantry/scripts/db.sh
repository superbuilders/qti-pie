#!/usr/bin/env bash
# The QTI package's local database on pantry's own cluster (pg.config.ts), which the testing library's cluster maker
# makes and starts the first time this script needs it (`pnpm exec toolchain-pg <command>` from this directory runs its
# life by hand).
#
#   scripts/db.sh create    create the database from the cluster's template, owned by the migration identity
#   scripts/db.sh migrate   grizzle migrate, then give each of this package's logins its local password
#   scripts/db.sh reset     grizzle uninstall where the database exists, then create and migrate
#   scripts/db.sh drop      grizzle uninstall where the database exists, then drop it and the password directory
#   scripts/db.sh check-clear  list the installation's roles and the database left on the cluster, read from the
#                              cluster's catalog without connecting to the database; exit 1 if any, 2 if it cannot
#                              list them, else 0
#
# The database's name is its installation's role prefix (src/db/connection.ts), so grizzle names every role here.
# QTI_PIE_PG_DATABASE must be a lowercase letter, then at most 62 lowercase letters, digits or underscores, with no __
# and not starting with pg_ (DatabaseName in src/db/connection.ts), or every command exits 2. grizzle refuses a role
# the prefix takes past 63 bytes where it names the role.
# QTI_PIE_PG_PASSWORD_COMMAND, when set and not empty, names an executable that prints a role's password: every
# connection runs it, without a shell, with the role's name as its one argument, and reads its output, trimmed, as
# src/db/connection.ts does. A run that exits otherwise than 0, whatever it printed, or prints nothing gives no
# password, and the command stops before psql or grizzle starts. It then replaces the migration identity's password
# file, and migrate gives no login a local password, since every login's comes from the command too. This script runs
# it before psql or grizzle starts, with no bound; grizzle runs it with QTI_PIE_PG_PASSWORD_COMMAND_TIMEOUT's.
# QTI_PIE_GRIZZLE_CONFIG names the grizzle config every grizzle command runs (grizzle.config.ts by default).
set -euo pipefail
cd "$(dirname "$0")/.."

# psql is grizzle's pinned build's, the server pg.config.ts runs the cluster on: <prefix>/bin of scripts/pg/pin.env in
# the vendor/grizzle submodule, which grizzle's pnpm pg:build makes. The pin assigns without checking, so a caller's
# GRIZZLE_PG_BIN is kept before it is read, and wins.
caller_bin="${GRIZZLE_PG_BIN:-}"
source ../../../../vendor/grizzle/scripts/pg/pin.env
GRIZZLE_PG_BIN="${caller_bin:-$GRIZZLE_PG_PREFIX/bin}"
: "${QTI_PIE_PG_HOST:=localhost}"
: "${QTI_PIE_PG_DATABASE:=qti_pie}"
: "${QTI_PIE_PG_SECRETS:=$HOME/.local/var/qti-pie/$QTI_PIE_PG_DATABASE}"
config="${QTI_PIE_GRIZZLE_CONFIG:-grizzle.config.ts}"

if [[ ! $QTI_PIE_PG_DATABASE =~ ^[a-z][a-z0-9_]{0,62}$ || $QTI_PIE_PG_DATABASE == *__* || $QTI_PIE_PG_DATABASE == pg_* ]]; then
	echo "QTI_PIE_PG_DATABASE is '$QTI_PIE_PG_DATABASE'; use a lowercase letter, then at most 62 lowercase letters, digits or underscores, with no __ and not starting with pg_ (create folds an unquoted name to lowercase, but migrate connects as written, and the name is the role prefix of every role grizzle installs here, which __ parts from each role's stem and PostgreSQL refuses to start with pg_)." >&2
	exit 2
fi

# The local cluster member's facts, as `toolchain-pg env` prints them, one TOOLCHAIN_PG_<fact>=<value> line each: read
# the first time a setting needs one, which brings the cluster up (made where it is missing, started where it is
# stopped), and never where the caller set every setting, so a caller that names another server brings nothing up.
member=""

# Usage: from_member <setting> <fact>. Leaves the variable <setting> as the caller set it, unless it is unset or empty,
# as `:=` reads it; then sets it to the member's TOOLCHAIN_PG_<fact>.
from_member() {
	[[ -z "${!1:-}" ]] || return 0
	[[ -n "$member" ]] || member="$(node_modules/.bin/toolchain-pg env)" || exit
	local name value
	while IFS="=" read -r name value; do
		if [[ $name == "TOOLCHAIN_PG_$2" ]]; then
			printf -v "$1" "%s" "$value"
			return
		fi
	done <<<"$member"
	echo "toolchain-pg env printed no TOOLCHAIN_PG_$2 for pantry's cluster (pg.config.ts): run \`pnpm exec toolchain-pg env\` in $PWD to see what it prints." >&2
	exit 2
}

# The server's port, its CA file and the migration identity, each the local cluster's where the caller leaves it unset:
# its port, its CA and its owner, which owns every database create makes and so every schema grizzle migrate installs.
# They are exported with the host, the database and the secrets folder, so the grizzle config connects where this
# script does (src/db/connection.ts reads the same variables, and its migration connection reads the CA from
# QTI_PIE_PG_CA alone). The owner's password file, QTI_PIE_PG_MIGRATION_PASSWORD_FILE, is the local cluster's where
# it is unset and no password command gives the password; the template create makes the database from,
# QTI_PIE_PG_TEMPLATE, is read by create alone.
from_member QTI_PIE_PG_PORT PORT
from_member QTI_PIE_PG_CA CA
from_member QTI_PIE_PG_MIGRATION_ROLE OWNER
[[ -n "${QTI_PIE_PG_PASSWORD_COMMAND:-}" ]] || from_member QTI_PIE_PG_MIGRATION_PASSWORD_FILE PASSWORD_FILE
export QTI_PIE_PG_HOST QTI_PIE_PG_PORT QTI_PIE_PG_CA QTI_PIE_PG_DATABASE QTI_PIE_PG_SECRETS QTI_PIE_PG_MIGRATION_ROLE

owner="$QTI_PIE_PG_MIGRATION_ROLE"

# Prints the migration identity's password for one connection: QTI_PIE_PG_PASSWORD_COMMAND's output for it, trimmed,
# where the command is set, else the password file QTI_PIE_PG_MIGRATION_PASSWORD_FILE names. Fails, printing nothing,
# where the command exits otherwise than 0 or prints no password. Its callers read it in a command substitution, where
# errexit does not reach, so each checks its status.
owner_password() {
	if [[ -z "${QTI_PIE_PG_PASSWORD_COMMAND:-}" ]]; then
		cat "$QTI_PIE_PG_MIGRATION_PASSWORD_FILE"
		return
	fi
	local password status=0
	password="$("$QTI_PIE_PG_PASSWORD_COMMAND" "$owner")" || status=$?
	if ((status != 0)); then
		echo "The password command $QTI_PIE_PG_PASSWORD_COMMAND exited with code $status for the role $owner, so the connection has no password. Run it by hand with $owner as its one argument to see why it fails, and sign in if it asks you to; or unset QTI_PIE_PG_PASSWORD_COMMAND to use the local cluster's passwords." >&2
		return 1
	fi
	password="${password#"${password%%[![:space:]]*}"}"
	password="${password%"${password##*[![:space:]]}"}"
	if [[ -z "$password" ]]; then
		echo "The password command $QTI_PIE_PG_PASSWORD_COMMAND exited with code 0 for the role $owner but printed no password on standard output. QTI_PIE_PG_PASSWORD_COMMAND must print the role's password; run it by hand with $owner as its one argument to check that it is signed in." >&2
		return 1
	fi
	printf '%s' "$password"
}

# Usage: as_owner <database> [psql args...]
as_owner() {
	local db=$1
	shift
	local password
	password="$(owner_password)" || return
	PGPASSWORD="$password" "$GRIZZLE_PG_BIN/psql" -X -q -v ON_ERROR_STOP=1 -At \
		"host=$QTI_PIE_PG_HOST port=$QTI_PIE_PG_PORT dbname=$db user=$owner sslmode=verify-full sslrootcert=$QTI_PIE_PG_CA" "$@"
}

# The installation's roles, comma-joined for an array literal: '{<roles>}'. grizzle roles connects as the migration
# identity, so it runs through as_migration.
installation_roles() {
	as_migration roles | paste -sd , -
}

# Exits 1 where the database is missing; stops the script where the cluster cannot be read.
exists() {
	local found
	found="$(as_owner postgres -c "SELECT 1 FROM pg_database WHERE datname = '$QTI_PIE_PG_DATABASE'")" || exit
	[[ -n "$found" ]]
}

# Usage: as_migration migrate|roles|uninstall. Only this is given the migration identity's password, unless
# QTI_PIE_PG_PASSWORD_COMMAND gives every role its own. It reads the password first either way, so a password command
# that gives none is refused here, by owner_password's message, before any grizzle command runs; grizzle then runs
# the command again for each connection it opens.
as_migration() {
	local password
	password="$(owner_password)" || return
	if [[ -n "${QTI_PIE_PG_PASSWORD_COMMAND:-}" ]]; then
		pnpm exec grizzle "$1" "$config"
	else
		QTI_PIE_PG_MIGRATION_PASSWORD="$password" pnpm exec grizzle "$1" "$config"
	fi
}

# The template is the local cluster's where QTI_PIE_PG_TEMPLATE is unset: the cluster maker's, which carries what the
# schema needs of it, no extension.
create() {
	if exists; then
		echo "$QTI_PIE_PG_DATABASE: exists"
		return
	fi
	from_member QTI_PIE_PG_TEMPLATE TEMPLATE
	as_owner postgres -c "CREATE DATABASE $QTI_PIE_PG_DATABASE OWNER $owner TEMPLATE $QTI_PIE_PG_TEMPLATE"
	echo "$QTI_PIE_PG_DATABASE: created"
}

# grizzle reads no environment variable for where to connect: the config's connection (src/db/connection.ts) reads
# the settings exported above, the CA among them. A password command gives every login its password, so no login gets
# a local one.
migrate() {
	as_migration migrate
	[[ -z "${QTI_PIE_PG_PASSWORD_COMMAND:-}" ]] || return 0
	mkdir -p "$QTI_PIE_PG_SECRETS"
	chmod 700 "$QTI_PIE_PG_SECRETS"
	local roles logins login file
	roles="$(installation_roles)"
	logins="$(as_owner postgres -c "SELECT rolname FROM pg_roles WHERE rolcanlogin AND rolname = ANY ('{$roles}')")"
	for login in $logins; do
		file="$QTI_PIE_PG_SECRETS/$login.password"
		[[ -f "$file" ]] || (umask 077 && openssl rand -hex 24 > "$file")
		as_owner postgres -c "ALTER ROLE $login PASSWORD '$(cat "$file")'"
		echo "$login: password in $file"
	done
}

drop() {
	! exists || as_migration uninstall
	as_owner postgres -c "DROP DATABASE IF EXISTS $QTI_PIE_PG_DATABASE WITH (FORCE)"
	rm -rf "$QTI_PIE_PG_SECRETS"
}

# Keeps the password files, which migrate sets on the new login roles.
reset() {
	! exists || as_migration uninstall
	create
	migrate
}

# Prints each leftover as "role: <name>" or "database: <name>"; exits 1 if any were found. It reads the cluster's
# catalog through the postgres database and never connects to the installation's own, which drop removes: grizzle
# names every cluster role of an installation <prefix>__<name>, its roles, its logins, its decoder login and a role set
# aside alike (roleInSpace in grizzle's packages/engine/src/core/identity.ts), and the prefix is the database's name
# (src/db/connection.ts), which holds no __, so the roles that start with <database>__ are exactly this installation's
# role space, whatever levels and logins its config lists today.
check_clear() {
	local found
	found="$(as_owner postgres -c "SELECT 'role: ' || rolname FROM pg_roles WHERE starts_with(rolname, '${QTI_PIE_PG_DATABASE}__')
		UNION ALL SELECT 'database: ' || datname FROM pg_database WHERE datname = '$QTI_PIE_PG_DATABASE' ORDER BY 1")" || return 2
	if [[ -n "$found" ]]; then
		echo "$found"
		return 1
	fi
}

case "${1:-}" in
	create) create ;;
	migrate) migrate ;;
	reset) reset ;;
	drop) drop ;;
	check-clear) check_clear ;;
	*)
		echo "usage: scripts/db.sh create|migrate|reset|drop|check-clear" >&2
		exit 2
		;;
esac
