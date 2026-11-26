#!/usr/bin/env bash
# The QTI package's database for one lane on the machine's shared PostgreSQL 19 (`systemctl --user start postgres`),
# which this script never starts or makes: a lane takes a database and an owner role of its own there, never a server.
#
#   scripts/db.sh create    create the database from QTI_PIE_PG_TEMPLATE, owned by the migration identity
#   scripts/db.sh migrate   grizzle migrate, then give each of this package's logins its local password
#   scripts/db.sh reset     grizzle uninstall where the database exists, then create and migrate
#   scripts/db.sh drop      grizzle uninstall where the database exists, then drop it and the password directory
#   scripts/db.sh check-clear  list the installation's roles and the database left on the server, read from the
#                              server's catalog without connecting to the database; exit 1 if any, 2 if it cannot
#                              list them, else 0
#
# Every setting is required, and a missing one stops every command with exit 2, naming it: QTI_PIE_PG_HOST,
# QTI_PIE_PG_PORT and QTI_PIE_PG_CA (the server, verified verify-full against its CA, PGSSLROOTCERT on this machine),
# QTI_PIE_PG_DATABASE (the lane's database), QTI_PIE_PG_MIGRATION_ROLE (the lane's owner role, which owns the database
# and every schema grizzle migrate installs), QTI_PIE_PG_MIGRATION_PASSWORD_FILE (the owner's password, a mode-600
# file) and QTI_PIE_PG_SECRETS (the folder of the logins' password files) unless QTI_PIE_PG_PASSWORD_COMMAND gives
# every password, and, for create, QTI_PIE_PG_TEMPLATE.
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

# psql is grizzle's pinned build's, the build the shared server runs: <prefix>/bin of scripts/pg/pin.env in the
# vendor/grizzle submodule. The pin assigns without checking, so a caller's GRIZZLE_PG_BIN is kept before it is read,
# and wins.
caller_bin="${GRIZZLE_PG_BIN:-}"
source ../../vendor/grizzle/scripts/pg/pin.env
GRIZZLE_PG_BIN="${caller_bin:-$GRIZZLE_PG_PREFIX/bin}"

# Usage: required <setting>. Stops the script with exit 2, naming the setting, where it is unset or empty.
required() {
	[[ -n "${!1:-}" ]] && return 0
	echo "$1 is unset: scripts/db.sh reaches the shared PostgreSQL server only through the QTI_PIE_PG_* settings, every one of them set (packages/qti-pie/AGENTS.md, \"Local database\")." >&2
	exit 2
}

required QTI_PIE_PG_HOST
required QTI_PIE_PG_PORT
required QTI_PIE_PG_CA
required QTI_PIE_PG_DATABASE
required QTI_PIE_PG_MIGRATION_ROLE
if [[ -z "${QTI_PIE_PG_PASSWORD_COMMAND:-}" ]]; then
	required QTI_PIE_PG_MIGRATION_PASSWORD_FILE
	required QTI_PIE_PG_SECRETS
fi
config="${QTI_PIE_GRIZZLE_CONFIG:-grizzle.config.ts}"

if [[ ! $QTI_PIE_PG_DATABASE =~ ^[a-z][a-z0-9_]{0,62}$ || $QTI_PIE_PG_DATABASE == *__* || $QTI_PIE_PG_DATABASE == pg_* ]]; then
	echo "QTI_PIE_PG_DATABASE is '$QTI_PIE_PG_DATABASE'; use a lowercase letter, then at most 62 lowercase letters, digits or underscores, with no __ and not starting with pg_ (create folds an unquoted name to lowercase, but migrate connects as written, and the name is the role prefix of every role grizzle installs here, which __ parts from each role's stem and PostgreSQL refuses to start with pg_)." >&2
	exit 2
fi

# The settings are exported, so the grizzle config connects where this script does (src/db/connection.ts reads the same
# variables).
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
		echo "The password command $QTI_PIE_PG_PASSWORD_COMMAND exited with code $status for the role $owner, so the connection has no password. Run it by hand with $owner as its one argument to see why it fails, and sign in if it asks you to; or unset QTI_PIE_PG_PASSWORD_COMMAND to read the owner's password file QTI_PIE_PG_MIGRATION_PASSWORD_FILE instead." >&2
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

# Exits 1 where the database is missing; stops the script where the server cannot be read.
exists() {
	local found
	found="$(as_owner postgres -c "SELECT 1 FROM pg_database WHERE datname = '$QTI_PIE_PG_DATABASE'")" || exit
	[[ -n "$found" ]]
}

# Usage: as_migration migrate|uninstall. Only this is given the migration identity's password, unless
# QTI_PIE_PG_PASSWORD_COMMAND gives every role its own. It reads the password first either way, so a password command
# that gives none is refused here, by owner_password's message, before any grizzle command runs; grizzle then runs
# the command again for each connection it opens. grizzle is the package's own bin, which starts node on grizzle's
# entry; `pnpm exec` would start a node of its own before it.
as_migration() {
	local password
	password="$(owner_password)" || return
	if [[ -n "${QTI_PIE_PG_PASSWORD_COMMAND:-}" ]]; then
		node_modules/.bin/grizzle "$1" "$config"
	else
		QTI_PIE_PG_MIGRATION_PASSWORD="$password" node_modules/.bin/grizzle "$1" "$config"
	fi
}

# The template is QTI_PIE_PG_TEMPLATE, read by create alone: one that carries what the schema needs of it, no extension
# (template0 does).
create() {
	required QTI_PIE_PG_TEMPLATE
	if exists; then
		echo "$QTI_PIE_PG_DATABASE: exists"
		return
	fi
	as_owner postgres -c "CREATE DATABASE $QTI_PIE_PG_DATABASE OWNER $owner TEMPLATE $QTI_PIE_PG_TEMPLATE"
	echo "$QTI_PIE_PG_DATABASE: created"
}

# grizzle reads no environment variable for where to connect: the config's connection (src/db/connection.ts) reads
# the settings exported above, the CA among them. A password command gives every login its password, so no login gets
# a local one. The logins are the catalog's, in the installation's role space <database>__ as check_clear reads it
# (below): `grizzle roles` would load the config, and with it the whole composition, again for the same list.
migrate() {
	as_migration migrate
	[[ -z "${QTI_PIE_PG_PASSWORD_COMMAND:-}" ]] || return 0
	mkdir -p "$QTI_PIE_PG_SECRETS"
	chmod 700 "$QTI_PIE_PG_SECRETS"
	local logins login file
	logins="$(as_owner postgres -c "SELECT rolname FROM pg_roles WHERE rolcanlogin AND starts_with(rolname, '${QTI_PIE_PG_DATABASE}__') ORDER BY 1")"
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
	[[ -n "${QTI_PIE_PG_PASSWORD_COMMAND:-}" ]] || rm -rf "$QTI_PIE_PG_SECRETS"
}

# Keeps the password files, which migrate sets on the new login roles.
reset() {
	! exists || as_migration uninstall
	create
	migrate
}

# Prints each leftover as "role: <name>" or "database: <name>"; exits 1 if any were found. It reads the server's
# catalog through the postgres database and never connects to the installation's own, which drop removes: grizzle
# names every cluster role of an installation <prefix>__<name>, its roles, its logins, its decoder login and a role set
# aside alike (roleInSpace in grizzle's packages/engine/src/core/identity.ts), and the prefix is the database's name
# (src/db/connection.ts), which holds no __, so the roles that start with <database>__ are exactly this installation's
# role space, whatever levels and logins its config lists today. Roles are the server's, not a database's, so the
# database's name, and so its prefix, is the lane's own: two lanes never share one.
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
