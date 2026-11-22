/**
 * The category of an attempt's credit, the owner's rule's (proposal 2026-11-18-grading-in-sql,
 * Decision 3): `none` where SCORE is at or below 0, `full` where it is at or above its maximum,
 * `partial` between. Ordered, since readers compare categories, `full` above `partial` above
 * `none`. Its own module, which loads no schema, because the machine's declared function `credit`
 * (`#grading.ts`, generated from out/grading-sql/p3/credit.sql) returns it and the ledger
 * (`#ledger.ts`) lists it: the function's body writes each handle's code, which grizzle numbers
 * from 0 in this order and never renumbers, so the order here and the codes there are one fact.
 */
import { closed } from "@bjornpagen/grizzle";

export const CreditKind = closed.ordered("CreditKind", ["none", "partial", "full"]);
