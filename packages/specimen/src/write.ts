import type { HostFacts } from "@qti-pie/plate";
/**
 * The writer: a description as a QTI 3 item, its configuration's assets and session control, and
 * what the host must know to render it.
 *
 * @module
 */
import { Array as Arr, Option } from "effect";
import { float } from "#specimen/credit.ts";
import type { Content, Description, Layout, Prompt, Stimulus } from "#specimen/description.ts";
import type { Scoring } from "#specimen/kind.ts";
import { roster, written } from "#specimen/kinds/index.ts";
import { image, itemLocation, placed, placeholder, svgAddress } from "#specimen/picture.ts";
import type { Asset } from "#specimen/picture.ts";
import { run, word } from "#specimen/words.ts";
import { element, text } from "#specimen/xml.ts";

/**
 * The shuffle seed every case's configuration states, so a case presents one order wherever it is
 * opened; a host that shows the case under its own key passes it in its place.
 */
const caseSeed = "specimen";

/**
 * What plate's `configure` takes for a case: the address of each file the item names, and the
 * case's own shuffle seed, which a host may replace with its own. Whether the description's session
 * validates responses is the QTI database's to judge by, so it is no part of plate's configuration.
 */
export interface ConfigurationInput {
  readonly assets: readonly Asset[];
  readonly seed: string;
}

/**
 * A case's item: where it lives in its package, its XML, plate's configuration for it, and what
 * the host must know to render it, none when it needs nothing.
 */
export interface Item {
  readonly configuration: ConfigurationInput;
  readonly host: Option.Option<HostFacts>;
  readonly location: string;
  readonly xml: string;
}

/**
 * Markup and the files it names.
 */
interface Placed {
  readonly assets: readonly Asset[];
  readonly markup: string;
}

/**
 * The long text stimulus's paragraphs, each a run of the text.
 */
const paragraphs = 4;

/**
 * The size the stimulus's video is written at.
 */
const videoSize = { height: 360, width: 640 } as const;

/**
 * A WebM file's first four bytes, its EBML magic, base64: the stimulus video's placeholder file,
 * which a browser shows as a video it cannot play, under its poster.
 */
const videoAddress = "data:video/webm;base64,GkXfow==";

/**
 * Write what a stimulus shows.
 *
 * @param content What it shows.
 * @returns Its markup and files.
 */
const contentOf = (content: Content): Placed => {
  switch (content.kind) {
    case "text": {
      const count = content.length === "short" ? 1 : paragraphs;

      return {
        assets: [],
        markup: Arr.makeBy(count, (at) =>
          element("p", {}, text(`Once upon a time ${run(content.length, at)}.`)),
        ).join(""),
      };
    }
    case "picture": {
      const shown = image(content.picture, "Stimulus");

      return { assets: [shown.file.asset], markup: element("p", {}, shown.markup) };
    }
    case "figure": {
      const shown = image(content.picture, "Figure");

      return {
        assets: [shown.file.asset],
        markup: element(
          "figure",
          {},
          shown.markup,
          element("figcaption", {}, text("A figure, captioned under its picture.")),
        ),
      };
    }
    case "table": {
      const columns = Arr.makeBy(content.columns, (at) => at);

      return {
        assets: [],
        markup: element(
          "table",
          {},
          element(
            "thead",
            {},
            element(
              "tr",
              {},
              ...columns.map((column) =>
                element("th", { scope: "col" }, text(`Heading ${word(column)}`)),
              ),
            ),
          ),
          element(
            "tbody",
            {},
            ...Arr.makeBy(content.rows, (row) =>
              element(
                "tr",
                {},
                ...columns.map((column) =>
                  element("td", {}, text(String(row * content.columns + column + 1))),
                ),
              ),
            ),
          ),
        ),
      };
    }
    case "video": {
      const poster = placed(
        "video-poster.svg",
        svgAddress(placeholder(videoSize, "Video poster", [])),
      );
      const clip = placed("video.webm", videoAddress);

      return {
        assets: [poster.asset, clip.asset],
        markup: element(
          "video",
          {
            controls: "controls",
            height: videoSize.height,
            poster: poster.src,
            width: videoSize.width,
          },
          element("source", { src: clip.src, type: "video/webm" }),
        ),
      };
    }
  }
};

/**
 * Write a prompt's content: flow markup, as a kind writes it in its `qti-prompt` or before itself.
 *
 * @param prompt The prompt.
 * @returns Its markup and files, none when there is no prompt.
 */
const promptOf = (prompt: Prompt): Option.Option<Placed> => {
  const line = element("p", {}, text("Answer the question."));

  switch (prompt.kind) {
    case "none": {
      return Option.none();
    }
    case "text": {
      return Option.some({ assets: [], markup: line });
    }
    case "picture": {
      const shown = image(prompt.picture, "Prompt");

      return Option.some({
        assets: [shown.file.asset],
        markup: `${line}${element("p", {}, shown.markup)}`,
      });
    }
  }
};

/**
 * The column widths of a layout's row, the stimulus's first, in twelfths.
 */
const columns: Readonly<Record<Exclude<Layout, "stacked">, readonly [number, number]>> = {
  "4-8": [4, 8],
  "6-6": [6, 6],
  "8-4": [8, 4],
};

/**
 * Lay a stimulus out beside or above the interaction, as its author wrote it.
 *
 * @param stimulus The stimulus.
 * @param interaction The interaction's markup, its feedback blocks after it.
 * @returns The body's content, and the stimulus's files.
 */
const laidOut = (stimulus: Stimulus, interaction: string): Placed => {
  switch (stimulus.kind) {
    case "none": {
      return { assets: [], markup: interaction };
    }
    case "shown": {
      const content = contentOf(stimulus.content);
      const framed = stimulus.well
        ? element("div", { class: "qti-well" }, content.markup)
        : content.markup;

      if (stimulus.layout === "stacked") {
        return { assets: content.assets, markup: `${framed}${interaction}` };
      }

      const [left, right] = columns[stimulus.layout];

      return {
        assets: content.assets,
        markup: element(
          "div",
          { class: "qti-layout-row" },
          element("div", { class: `qti-layout-col${String(left)}` }, framed),
          element("div", { class: `qti-layout-col${String(right)}` }, interaction),
        ),
      };
    }
  }
};

/**
 * What the feedback says to a right response and to any other, by the `FEEDBACK` value that
 * shows it.
 */
const feedbackText = [
  ["correct", "Right! That is the answer."],
  ["incorrect", "Not yet. Look at the question again."],
] as const;

/**
 * Declare a float outcome with its default value.
 *
 * @param identifier The outcome's identifier.
 * @param value Its default value.
 * @returns The `qti-outcome-declaration`.
 */
const declared = (identifier: string, value: number): string =>
  element(
    "qti-outcome-declaration",
    { "base-type": "float", cardinality: "single", identifier },
    element("qti-default-value", {}, element("qti-value", {}, String(value))),
  );

/**
 * Set `FEEDBACK` to an identifier.
 *
 * @param value The identifier.
 * @returns The `qti-set-outcome-value`.
 */
const feedbackSet = (value: string): string =>
  element(
    "qti-set-outcome-value",
    { identifier: "FEEDBACK" },
    element("qti-base-value", { "base-type": "identifier" }, value),
  );

/**
 * Write the item's outcome declarations: `SCORE` always, `MAXSCORE` when the kind scores, and
 * `FEEDBACK` when the item shows feedback.
 *
 * @param scoring How the kind scores.
 * @param feedback Whether the item shows feedback.
 * @returns The declarations.
 */
const outcomes = (scoring: Scoring, feedback: boolean): readonly string[] => [
  declared("SCORE", 0),
  ...(scoring.kind === "scored" ? [declared("MAXSCORE", scoring.most)] : []),
  ...(feedback
    ? [
        element("qti-outcome-declaration", {
          "base-type": "identifier",
          cardinality: "single",
          identifier: "FEEDBACK",
        }),
      ]
    : []),
];

/**
 * Write the item's response processing: the kind's rules, then, when the item shows feedback,
 * `FEEDBACK` set to `correct` when `SCORE` reaches its most and to `incorrect` otherwise. None when
 * the kind does not score.
 *
 * @param scoring How the kind scores.
 * @param feedback Whether the item shows feedback.
 * @returns The `qti-response-processing`, none when it has no rule.
 */
const processing = (scoring: Scoring, feedback: boolean): readonly string[] => {
  switch (scoring.kind) {
    case "unscored": {
      return [];
    }
    case "scored": {
      return [
        element(
          "qti-response-processing",
          {},
          ...scoring.rules,
          ...(feedback
            ? [
                element(
                  "qti-response-condition",
                  {},
                  element(
                    "qti-response-if",
                    {},
                    element(
                      "qti-gte",
                      {},
                      element("qti-variable", { identifier: "SCORE" }),
                      float(scoring.most),
                    ),
                    feedbackSet("correct"),
                  ),
                  element("qti-response-else", {}, feedbackSet("incorrect")),
                ),
              ]
            : []),
        ),
      ];
    }
  }
};

/**
 * Write a case's item from its description.
 *
 * @param description The description.
 * @returns The item.
 */
export const itemOf = (description: Description): Item => {
  const prompt = promptOf(description.prompt);
  const kind = written(description.interaction, {
    prompt: prompt.pipe(Option.map((shown) => shown.markup)),
  });
  const shows = description.feedback !== "none";
  const blocks =
    description.feedback === "inline"
      ? feedbackText.map(([identifier, said]) =>
          element(
            "qti-feedback-block",
            { identifier, "outcome-identifier": "FEEDBACK", "show-hide": "show" },
            element("qti-content-body", {}, element("p", {}, text(said))),
          ),
        )
      : [];
  const modal =
    description.feedback === "modal"
      ? feedbackText.map(([identifier, said]) =>
          element(
            "qti-modal-feedback",
            { identifier, "outcome-identifier": "FEEDBACK", "show-hide": "show" },
            element("qti-content-body", {}, element("p", {}, text(said))),
          ),
        )
      : [];
  const body = laidOut(description.stimulus, [kind.body, ...blocks].join(""));

  return {
    configuration: {
      assets: [
        ...body.assets,
        ...Option.match(prompt, { onNone: () => [], onSome: (shown) => shown.assets }),
        ...kind.assets,
      ],
      seed: caseSeed,
    },
    host: kind.host,
    location: itemLocation,
    xml: element(
      "qti-assessment-item",
      {
        adaptive: "false",
        identifier: "specimen",
        "time-dependent": "false",
        title: `${roster[description.interaction.kind].label} specimen`,
        "xml:lang": "en",
        xmlns: "http://www.imsglobal.org/xsd/imsqtiasi_v3p0",
      },
      ...kind.declarations,
      ...outcomes(kind.scoring, shows),
      element("qti-item-body", {}, body.markup),
      ...processing(kind.scoring, shows),
      ...modal,
    ),
  };
};
