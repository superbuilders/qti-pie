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
 * `pictureUnloaded` is the line a picture that fails to load shows under its words, as AlphaTest's
 * player wrote "[Image failed to load]", telling the child what to do. A pane of two or more
 * stimuli holds one tab per stimulus under `stimuliInstruction`, AlphaTest's player's words, each
 * named by the stimulus's `title`, or by `stimuliTab`, `{n}` its place, where its title is blank.
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
  pictureUnloaded: "This picture didn't load. Tell your teacher.",
  question: "Question",
  stimuli: "Passage",
  stimuliInstruction: "Read all passages below and use the tabs to alternate between them",
  stimuliTab: "Passage {n}",
} as const;
