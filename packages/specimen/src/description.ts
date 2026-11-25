/**
 * The description of an item a specimen draws: its interaction and that interaction's own
 * settings, the stimulus before it and how the author laid it out, the prompt, the feedback, the
 * session control, and the child's response. Every fact is a dimension of {@link itemDimensions} or
 * of its kind, so the lab can fix any of them.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { element, map } from "@bjornpagen/testing/gen";
import type { Gen } from "@bjornpagen/testing/gen";
import { answer } from "#specimen/answer.ts";
import type { Answer, Answered, Answers } from "#specimen/answer.ts";
import { counted, dimension, picker } from "#specimen/dimension.ts";
import type { Query } from "#specimen/dimension.ts";
import { answersOf, kindDimension, roster } from "#specimen/kinds/index.ts";
import type { Interaction, KindName } from "#specimen/kinds/index.ts";
import { aspect, scale } from "#specimen/picture.ts";
import type { Picture } from "#specimen/picture.ts";
import { length } from "#specimen/words.ts";
import type { Length } from "#specimen/words.ts";

/**
 * A yes-or-no dimension, no first.
 *
 * @param label The dimension's label.
 * @returns The dimension.
 */
const yesNo = (label: string) =>
  dimension(label, [
    ["no", "No", false],
    ["yes", "Yes", true],
  ]);

/**
 * The item's own dimensions. A case draws its interaction first, then its stimulus, prompt,
 * feedback and session control, and the child's response last.
 */
export const itemDimensions = {
  answer,
  feedback: dimension("Feedback", [
    ["none", "None", "none"],
    ["inline", "Feedback blocks in the body", "inline"],
    ["modal", "Modal feedback", "modal"],
  ]),
  kind: kindDimension,
  prompt: dimension("Prompt", [
    ["none", "None", "none"],
    ["text", "Text", "text"],
    ["picture", "Text with a picture", "picture"],
  ]),
  "prompt.picture-aspect": aspect,
  "prompt.picture-scale": scale,
  stimulus: dimension("Stimulus", [
    ["none", "None", "none"],
    ["text", "Text", "text"],
    ["picture", "Picture", "picture"],
    ["table", "Table", "table"],
    ["figure", "Figure with a caption", "figure"],
    ["video", "Video", "video"],
  ]),
  "stimulus.columns": counted("Table columns", 1, 8),
  "stimulus.layout": dimension("Stimulus layout", [
    ["stacked", "Above the interaction", "stacked"],
    ["6-6", "qti-layout-row: col6 beside col6", "6-6"],
    ["4-8", "qti-layout-row: col4 beside col8", "4-8"],
    ["8-4", "qti-layout-row: col8 beside col4", "8-4"],
  ]),
  "stimulus.picture-aspect": aspect,
  "stimulus.picture-scale": scale,
  "stimulus.rows": counted("Table rows", 1, 8),
  "stimulus.text": length,
  "stimulus.well": yesNo("Stimulus in a qti-well"),
  "validate-responses": yesNo("Session validates responses"),
} as const;

/**
 * What a stimulus shows.
 */
export type Content =
  | { readonly kind: "figure"; readonly picture: Picture }
  | { readonly kind: "picture"; readonly picture: Picture }
  | { readonly kind: "table"; readonly columns: number; readonly rows: number }
  | { readonly kind: "text"; readonly length: Length }
  | { readonly kind: "video" };

/**
 * Where the author put a stimulus: above the interaction, or beside it in a `qti-layout-row` of
 * two columns, the stimulus's width and the interaction's in twelfths.
 */
export type Layout = (typeof itemDimensions)["stimulus.layout"]["values"][number]["value"];

/**
 * The stimulus before the interaction: none, or its content, laid out and framed as its author
 * wrote it.
 */
export type Stimulus =
  | { readonly kind: "none" }
  | {
      readonly content: Content;
      readonly kind: "shown";
      readonly layout: Layout;
      readonly well: boolean;
    };

/**
 * The prompt: none, a line of text, or a line of text with a picture under it.
 */
export type Prompt =
  | { readonly kind: "none" }
  | { readonly kind: "picture"; readonly picture: Picture }
  | { readonly kind: "text" };

/**
 * The item's feedback: none, a block for right and for wrong in the body, or modal feedback for
 * each.
 */
type Feedback = (typeof itemDimensions)["feedback"]["values"][number]["value"];

/**
 * The item session control a host renders the item under.
 */
interface Session {
  readonly validateResponses: boolean;
}

/**
 * A description of an item.
 */
export interface Description {
  readonly answer: Answer;
  readonly feedback: Feedback;
  readonly interaction: Interaction;
  readonly prompt: Prompt;
  readonly session: Session;
  readonly stimulus: Stimulus;
}

/**
 * A description, and the response it names as its kind answers it.
 */
export interface Described {
  readonly answered: Answered;
  readonly description: Description;
}

/**
 * The item's picker under a query.
 *
 * @param held The query.
 * @returns The picker.
 */
const itemPicker = (held: Query) => picker({ kind: "item" }, itemDimensions, held);

/**
 * Draw a picture's two dimensions.
 *
 * @param pick The item's picker.
 * @param prefix The picture's place: `stimulus` or `prompt`.
 * @returns The picture.
 */
const pictureOf =
  (pick: ReturnType<typeof itemPicker>, prefix: "prompt" | "stimulus"): Gen<Picture> =>
  (source) => ({
    aspect: source.draw(pick(`${prefix}.picture-aspect`)),
    scale: source.draw(pick(`${prefix}.picture-scale`)),
  });

/**
 * Draw a stimulus.
 *
 * @param pick The item's picker.
 * @returns The stimulus.
 */
const stimulusOf =
  (pick: ReturnType<typeof itemPicker>): Gen<Stimulus> =>
  (source) => {
    const shown = (content: Content): Stimulus => ({
      content,
      kind: "shown",
      layout: source.draw(pick("stimulus.layout")),
      well: source.draw(pick("stimulus.well")),
    });
    const drawn = source.draw(pick("stimulus"));

    switch (drawn) {
      case "none": {
        return { kind: "none" };
      }
      case "text": {
        return shown({ kind: "text", length: source.draw(pick("stimulus.text")) });
      }
      case "picture":
      case "figure": {
        return shown({ kind: drawn, picture: source.draw(pictureOf(pick, "stimulus")) });
      }
      case "table": {
        return shown({
          columns: source.draw(pick("stimulus.columns")),
          kind: "table",
          rows: source.draw(pick("stimulus.rows")),
        });
      }
      case "video": {
        return shown({ kind: "video" });
      }
    }
  };

/**
 * Draw a prompt.
 *
 * @param pick The item's picker.
 * @returns The prompt.
 */
const promptOf =
  (pick: ReturnType<typeof itemPicker>): Gen<Prompt> =>
  (source) => {
    const drawn = source.draw(pick("prompt"));

    switch (drawn) {
      case "none":
      case "text": {
        return { kind: drawn };
      }
      case "picture": {
        return { kind: "picture", picture: source.draw(pictureOf(pick, "prompt")) };
      }
    }
  };

/**
 * Draw an interaction of the kind a query allows.
 *
 * @param held The query.
 * @param name The kind.
 * @returns The interaction.
 */
const interactionOf = (held: Query, name: KindName): Gen<Interaction> => roster[name].arm(held);

/**
 * Draw a description but for its response, and the responses its interaction admits.
 *
 * @param held The query.
 * @returns The description's other parts, and the admitted responses.
 */
export const unanswered =
  (held: Query): Gen<Readonly<{ answers: Answers; rest: Omit<Description, "answer"> }>> =>
  (source) => {
    const pick = itemPicker(held);
    const interaction = source.draw(interactionOf(held, source.draw(pick("kind"))));
    const stimulus = source.draw(stimulusOf(pick));
    const prompt = source.draw(promptOf(pick));
    const feedback = source.draw(pick("feedback"));
    const session = {
      validateResponses: source.draw(pick("validate-responses")),
    };

    return {
      answers: answersOf(interaction),
      rest: { feedback, interaction, prompt, session, stimulus },
    };
  };

/**
 * Draw a description under a query: none when the query fixes a response its interaction does not
 * admit, such as `partial` of a single pick. The response is drawn last, from those its
 * interaction admits, in their order.
 *
 * @param held The query.
 * @returns The description and its response, or none.
 */
export const described =
  (held: Query): Gen<Option.Option<Described>> =>
  (source) => {
    const drawn = source.draw(unanswered(held));
    const fixed = Option.fromNullishOr(held.get("answer"));
    const allowed = drawn.answers.filter((answered) =>
      Option.match(fixed, { onNone: () => true, onSome: (name) => name === answered.answer }),
    );

    return Arr.isReadonlyArrayNonEmpty(allowed)
      ? Option.some(
          source.draw(
            map(element(allowed), (answered) => ({
              answered,
              description: { ...drawn.rest, answer: answered.answer },
            })),
          ),
        )
      : Option.none();
  };
