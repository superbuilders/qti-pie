/**
 * What `<Item>` refuses, and the defects no item can cause.
 *
 * A server component returns no `Result`, so `<Item>` throws each refusal before it renders any of
 * the item: the host's nearest error boundary shows it, and no page holds part of an item. Each
 * is a tagged error whose message names the cause and the repair, and none names the item's
 * content beyond its identifier and location.
 *
 * @module
 */
import { Data } from "effect";
import type { InstanceBreach } from "#plate/form/encoding.ts";

/**
 * Say what a broken token holds, by the breach `checkInstance` found.
 *
 * @param breach The breach.
 * @returns The words, after "passed to <Item>".
 */
const breachText = (breach: InstanceBreach): string => {
  switch (breach.requirement) {
    case "characters": {
      return `holds ${JSON.stringify(breach.character)}, which is not an ASCII letter, a digit, "_", ".", ":" or "-"`;
    }
    case "id-boundary": {
      return breach.at === "end"
        ? `ends in "-", so its ids can equal another instance's`
        : `holds "--", so its ids can equal another instance's`;
    }
    case "non-empty": {
      return "is empty";
    }
    default: {
      return breach satisfies never;
    }
  }
};

/**
 * An `instance` that breaks a requirement `checkInstance` checks: a developer error. Every id and
 * entry name the item writes is scoped by the instance, so a token that breaks one could collide
 * with another instance's.
 */
export class InvalidInstance extends Data.TaggedError("InvalidInstance")<{
  /**
   * How the token breaks the first requirement it breaks.
   */
  readonly breach: InstanceBreach;
  readonly token: string;
}> {
  /**
   * The token, what it breaks, and what to pass instead.
   */
  override get message(): string {
    return `The instance ${JSON.stringify(this.token)} passed to <Item> ${breachText(this.breach)}. Pass a token of ASCII letters, digits, "_", ".", ":" and "-" that does not end in "-" and holds no "--", such as "sitting-42.1".`;
  }
}

/**
 * An item one of whose package URLs, in what the page shows, names a file the configuration's
 * `assets` gives no address: the map and the package disagree. The page is not the package, so
 * plate never writes a package path relative to it.
 */
export class AssetMissing extends Data.TaggedError("AssetMissing")<{
  /**
   * The item's location, its path from the package root as the host named it.
   */
  readonly document: string;
  /**
   * The item's identifier.
   */
  readonly item: string;
  /**
   * The file's path from the package root: the URL resolved against the item's location.
   */
  readonly path: string;
}> {
  /**
   * The item, the file it names, and the two repairs.
   */
  override get message(): string {
    return `Item ${JSON.stringify(this.item)} at ${JSON.stringify(this.document)} names the file ${JSON.stringify(this.path)}, which the configuration's assets give no address, so <Item> rendered none of the item. Add the file's address to assets under ${JSON.stringify(this.path)}, or correct the item's reference so that it names a file of its package.`;
  }
}

/**
 * An item a printed variable of which, or a `param-variable` parameter, on content the page
 * shows, printed nothing because its text passed a bound: the redacted item's `unprinted`. The
 * page would show the slot blank, so it shows none of the item.
 *
 * `limit` `"text"` is the most one text may hold, 1,000,000 characters; `"budget"` is the
 * configuration's `outputBudget`, which the redaction held the item's printed text to.
 */
export class OutputTooLarge extends Data.TaggedError("OutputTooLarge")<{
  readonly bound: number;
  /**
   * The variable, a parameter's template variable.
   */
  readonly identifier: string;
  /**
   * The item's identifier.
   */
  readonly item: string;
  readonly limit: "budget" | "text";
}> {
  /**
   * The item, the bound and the variable, and what to change.
   */
  override get message(): string {
    return this.limit === "text"
      ? `Item ${JSON.stringify(this.item)} would print more than ${String(this.bound)} characters for the variable ${JSON.stringify(this.identifier)}, so <Item> rendered none of it. Shorten that variable's value, or the width or precision in its printed variable's format, so its text fits.`
      : `Item ${JSON.stringify(this.item)} prints more than ${String(this.bound)} characters of variables, the configuration's outputBudget, by the variable ${JSON.stringify(this.identifier)}, so <Item> rendered none of it. Raise outputBudget, up to 536,870,888, if the host can hold that much text.`;
  }
}

/**
 * An interaction inside an interaction's own content (its prompt, a choice, gap match's sentence),
 * where QTI's schema admits none: a defect of plate, since the database refuses such an item.
 */
export class NestedInteraction extends Data.TaggedError("NestedInteraction")<{
  /**
   * The nested interaction's kind.
   */
  readonly kind: string;
}> {
  /**
   * Which kind was nested, and why no item can cause it.
   */
  override get message(): string {
    return `An interaction's own content holds a ${this.kind} interaction, which QTI's schema admits nowhere there and check refuses, so no accepted item reaches here: the content walk was handed nodes it should not have been.`;
  }
}

/**
 * The shell's walk met a module's container no part of the server shell renders: a defect of
 * plate, which no item can cause.
 *
 * A module's container (Position Object's stage) reaches a body only once its module lands, and
 * lands with its view, in `#plate/ui/item/interactions/position-object.tsx`; a walk of an
 * interaction's own content has no container view. The redacted body's type holds no printed
 * variable, template content or feedback content, so the walk has no case for them.
 */
export class UnrenderedNode extends Data.TaggedError("UnrenderedNode")<{
  /**
   * What the walk met, such as `a container of position-object`.
   */
  readonly detail: string;
}> {
  /**
   * What was met, and what to land for it.
   */
  override get message(): string {
    return `The server shell met ${this.detail}, which it cannot render: a module landed without the shell's view of its container, or a walk of an interaction's own content met one. Give the module its container view, as #plate/ui/item/interactions/position-object.tsx gives Position Object's, dispatched from renderContainer in #plate/ui/item/interactions/index.tsx.`;
  }
}
