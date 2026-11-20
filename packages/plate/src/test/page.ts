/**
 * What a page of an item is given, for the tests that ask what an attempt shows: the redacted item
 * the server shell (`<Item>`, `#plate/ui/item/item.tsx`) renders and the view it renders each
 * interaction by, and the facts a test reads of them, the text the body holds and the order a
 * Choice or an Inline Choice presents its choices in.
 *
 * Test support only: nothing under `src/` outside `src/test/` and test files imports it.
 *
 * @module
 */
import { Effect, Option } from "effect";
import { configure } from "#plate/configuration.ts";
import type { Configuration } from "#plate/configuration.ts";
import { defaultView } from "#plate/content/contract.ts";
import { isInteraction, redactedInteractionsIn } from "#plate/model/interactions.ts";
import type { RedactedNode } from "#plate/model/item.ts";
import type { ResponseValue } from "#plate/model/values.ts";
import { interactionPayload } from "#plate/payload.ts";
import type { View } from "#plate/payload.ts";
import type { Redacted, RedactOptions } from "#plate/redact/walk.ts";
import { noSupports } from "#plate/supports.ts";

/**
 * The options `<Item>` redacts with for a host that sets no `supports` and no `view`: the
 * configuration `configure` gives for a seed alone, with its output budget, no support enabled,
 * and the candidate's view.
 */
export const shownToCandidate: RedactOptions = {
  configuration: Effect.runSync(configure({ seed: "", validateResponses: false })),
  supports: noSupports,
  view: defaultView,
};

/**
 * What a page is shown with: the configuration, the host's instance, and, as `<Item>` takes them,
 * the responses shown.
 */
export interface PageInputs {
  readonly configuration: Configuration;
  readonly instance: string;
  /**
   * The responses shown, by response identifier; none when absent.
   */
  readonly values?: Readonly<Record<string, ResponseValue>>;
}

/**
 * A page of an item: the redacted item the shell renders, and the view it gives each
 * interaction's payload node by.
 */
export interface Page {
  readonly redacted: Redacted;
  readonly view: View;
}

/**
 * Give the page of a redacted item, with the view `<Item>` builds: the configuration's seed.
 *
 * @param redacted The redacted item.
 * @param inputs What the page is shown with.
 * @returns The page.
 */
export const pageOf = (redacted: Redacted, inputs: PageInputs): Page => ({
  redacted,
  view: {
    host: {},
    instance: inputs.instance,
    seed: inputs.configuration.seed,
    values: new Map(Object.entries(inputs.values ?? {})),
  },
});

/**
 * Give the text body nodes hold, every text node at any depth in document order, a Choice's Prompt
 * and choices and an Inline Choice's choices included, each run of whitespace collapsed to one
 * space and the ends trimmed. Any other interaction, a container, a content node and a notice give
 * none.
 *
 * @param nodes The nodes, as a redacted body holds them.
 * @returns Their text.
 */
export const textOf = (nodes: readonly RedactedNode[]): string => {
  const below = (node: RedactedNode): readonly string[] => {
    if (isInteraction(node)) {
      if (node.kind === "choice") {
        return [
          ...Option.getOrElse(node.prompt, () => []).flatMap(below),
          ...node.choices.flatMap((choice) => choice.content.flatMap(below)),
        ];
      }

      return node.kind === "inline-choice"
        ? node.choices.flatMap((choice) => choice.content.flatMap(below))
        : [];
    }

    switch (node.kind) {
      case "text": {
        return [node.text];
      }
      case "element": {
        return node.children.flatMap(below);
      }
      case "container":
      case "content":
      case "unsupported": {
        return [];
      }
      default: {
        return node satisfies never;
      }
    }
  };

  return nodes.flatMap(below).join("").replaceAll(/\s+/gu, " ").trim();
};

/**
 * Give the choices the Choice or Inline Choice bound to a response presents on a page, as its
 * identifiers in the order the page presents them: the first such interaction in document order;
 * none when the page holds none, as when hidden content held it.
 *
 * @param page The page.
 * @param response The response the interaction binds.
 * @returns The choices' identifiers, in presented order.
 */
export const presentedChoices = (page: Page, response: string): readonly string[] => {
  const interaction = redactedInteractionsIn(page.redacted.body).find(
    (each) =>
      (each.kind === "choice" || each.kind === "inline-choice") && each.response === response,
  );
  if (interaction === undefined) {
    return [];
  }

  const node = interactionPayload(interaction, page.view);

  return node.kind === "choice" || node.kind === "inline-choice"
    ? node.payload.choices.map((choice) => choice.identifier)
    : [];
};
