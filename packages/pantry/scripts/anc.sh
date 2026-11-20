#!/bin/sh
# qti for the anc linter: the CLI with the database pointed at nothing, run from a scratch folder.
here=$(cd "$(dirname "$0")/.." && pwd) || exit 1
export QTI_PIE_PG_CA=/nonexistent/anc-probe/ca.crt
export QTI_PIE_PG_SECRETS=/nonexistent/anc-probe
export QTI_PIE_PG_PORT=1
mkdir -p "$here/work/anc/run" && cd "$here/work/anc/run" || exit 1
# The machine's Node: the workspace pins no binary of its own.
exec node "$here/src/cli.ts" "$@"
