/**
 * The migration connection a consumer's scratch config hands `grizzle migrate`, where the
 * consumer's own config connects elsewhere (edullm's QTI database migrates over RDS's IAM
 * admission): the scratch installation's owner over verify-full TLS on localhost, every setting the
 * one the installation's runner sets (#plan-budget/install.ts).
 *
 * @module
 */
import { readFileSync } from "node:fs";
import net from "node:net";
import type { MigrationConnectionConfig } from "@bjornpagen/grizzle";
import { Effect, Redacted } from "effect";
import pg from "pg";

/**
 * A setting the installation's runner sets.
 *
 * @param name - The variable.
 * @returns Its value.
 */
const setting = (name: string): string => {
  const value = process.env[name];

  if (value === undefined || value === "") {
    throw new Error(
      `The scratch installation's config reads ${name}, which the planning budget's runner sets`,
    );
  }

  return value;
};

/**
 * The scratch installation's migration connection, built when grizzle asks for it.
 *
 * @returns The connection.
 */
export const scratchMigrationConnection = (): MigrationConnectionConfig => ({
  database: setting("PLAN_BUDGET_DATABASE"),
  driver: pg,
  password: Effect.succeed(Redacted.make(setting("PLAN_BUDGET_PASSWORD"))),
  role: setting("PLAN_BUDGET_OWNER"),
  rolePrefix: setting("PLAN_BUDGET_DATABASE"),
  transport: {
    ca: readFileSync(setting("PLAN_BUDGET_CA"), "utf-8"),
    host: "localhost",
    kind: "sslRequest",
    open: () => new net.Socket(),
    port: Number(setting("PLAN_BUDGET_PORT")),
    servername: "localhost",
  },
});
