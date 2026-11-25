/**
 * The vocabulary of `declarations.oracle.test.ts`: the specification's own names, never cases a
 * person chose.
 *
 * @module
 */
import { dictionary } from "@bjornpagen/testing/dictionary";

/**
 * The built-in session variables, as QTI 3.0's information model names them in its tables 4.5.1,
 * 5.115.1 and 5.151.1: "They are completionStatus, numAttempts and duration".
 */
export const sessionVariableNames = dictionary(["completionStatus", "duration", "numAttempts"]);
