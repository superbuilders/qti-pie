/**
 * The English texts of the content modules' views in the server shell: a catalog's glossary and
 * the companion materials. One area of the catalog (`#plate/messages.ts`).
 *
 * @module
 */

/**
 * The content views' texts, keyed by the role each plays: `glossarySummary` is the control of a
 * catalog's glossary disclosure, which its accessible name joins to the term it defines.
 * `materialsHeading` names the companion materials' list, a calculator reads its type's
 * `materialCalculator…` name, and a rule or a
 * protractor its scale's `materialMinimumLength`, `materialMinorIncrement` and
 * `materialMajorIncrement`, each with the value as written. `stimuli` names the region of the
 * stimuli an item references, which the candidate reads beside the item, and `question` the region
 * of the item itself beside it, so a screen reader moves between the two by its landmarks.
 */
export const contentMessages = {
  glossarySummary: "Definition",
  materialCalculatorBasic: "Basic calculator",
  materialCalculatorGraphing: "Graphing calculator",
  materialCalculatorScientific: "Scientific calculator",
  materialCalculatorStandard: "Standard calculator",
  materialMajorIncrement: "major increment {increment}",
  materialMinimumLength: "minimum length {length}",
  materialMinorIncrement: "minor increment {increment}",
  materialsHeading: "Materials you may use",
  question: "Question",
  stimuli: "Passage",
} as const;
