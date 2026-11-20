import classesLiveInStyles from "#tools/classes-live-in-styles.ts";
import noBareError from "#tools/no-bare-error.ts";
import noBuiltInTryCatch from "#tools/no-built-in-try-catch.ts";
import throwNewError from "#tools/throw-new-error.ts";

/**
 * Enforces explicit Effect error boundaries, tagged errors over bare ones, `new` for errors
 * outside Effect's class factories, and plate's look in its separate stylesheets alone.
 */
export default {
  meta: { name: "workspace" },
  rules: {
    "classes-live-in-styles": classesLiveInStyles,
    "no-bare-error": noBareError,
    "no-built-in-try-catch": noBuiltInTryCatch,
    "throw-new-error": throwNewError,
  },
};
