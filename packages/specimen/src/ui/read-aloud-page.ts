/**
 * The page plate's read-aloud suite in Chrome drives (`#specimen/ui/read-aloud-browser.ts`):
 * plate's own read-aloud islands, `<ReadAloudItem>` and `<ReadAloud>`, and the Media interaction's
 * replay island, rendered as a host renders items, and an account of every recording the page
 * plays. It runs in the browser, bundled with the islands it is handed ({@link install}), and the
 * suite reads it through `window.readAloudPage`.
 *
 * - **The scene.** The items a host shows, each a `<ReadAloudItem>` keyed by its instance, as
 *   `<Item>` keys its own, holding its controls, each a `<ReadAloud>` with one recording; an item
 *   the host hides is held under a hidden `<Activity>`, as a router keeping a page it left hides
 *   it; a Gap Match, plate's island under its item's `<Responses>`, whose sentence's labels hold
 *   their controls after their words, as `heldIn` in `#plate/ui/item/content.tsx` places them; a
 *   picture graph whose label row's words hold their controls after them, as `heldIn` places them
 *   in a table's cells; and the Media interactions, each a replay island over its own `audio`. A
 *   new scene renders in place of the last, as a host moves from item to item.
 * - **The account.** Every media event of every recording from its entry into the page on, by the
 *   recording's name, its `play` for each play the page started, and every moment two recordings
 *   sounded at once, neither paused nor ended then: a recording sounds from its `playing` to its
 *   next `pause`, `ended`, `error`, `emptied` or `abort`, so one whose `play()` is still waiting
 *   for its data is no voice yet.
 *
 * @module
 */
import { Activity, StrictMode, createElement, useEffect, useState } from "react";
import type { ComponentType, ReactNode } from "react";
import { createRoot } from "react-dom/client";

/**
 * One read-aloud control of a scene: its name, which is the toggle's label, and its recording's
 * one file.
 */
export interface SceneControl {
  readonly label: string;
  readonly src: string;
}

/**
 * One item of a scene: its instance, its controls in document order, and whether the host hides
 * it.
 */
export interface SceneItem {
  readonly controls: readonly SceneControl[];
  readonly hidden: boolean;
  readonly instance: string;
}

/**
 * A Gap Match a scene shows, in an item of its own: its sentence's labels, each the words of a
 * label and the control the label holds after them, as the number line form draws its end labels,
 * with one gap after the first label and two numeral cards in its bank, silent.
 */
export interface SceneGapMatch {
  readonly instance: string;
  readonly labels: readonly SceneControl[];
}

/**
 * A picture graph a scene shows, in an item of its own, as the body's walk writes one: the stem's
 * control before its paragraph, and a table whose first row holds the pictures, silent, and whose
 * second holds each category's word in a `span` with its control after the word.
 */
export interface SceneGraph {
  readonly instance: string;
  readonly labels: readonly SceneControl[];
  readonly stem: SceneControl;
}

/**
 * One Media interaction a scene counts the plays of: its response's identifier, its media's file,
 * its `max-plays`, none for no limit, and its `loop`.
 */
export interface SceneMedia {
  readonly identifier: string;
  readonly loop: boolean;
  readonly maxPlays: number | undefined;
  readonly src: string;
}

/**
 * What the page shows: its items, then its Gap Match, where it has one, then the Media
 * interactions whose plays an item of the scene counts into its `<Responses>`, as a child's
 * attempt does, then the Media interactions a review replays, each by its media's file.
 */
export interface Scene {
  readonly counted?: readonly SceneMedia[];
  readonly gapMatch?: SceneGapMatch;
  readonly graph?: SceneGraph;
  readonly items: readonly SceneItem[];
  readonly media: readonly string[];
}

/**
 * One recording as the page holds it now: its name, whether it is paused, has ended, sounds and
 * is still in the document, the file it plays, its control's pressed state and notice.
 */
export interface Recording {
  readonly detached: boolean;
  readonly ended: boolean;
  readonly label: string;
  readonly notice: string;
  readonly paused: boolean;
  readonly pressed: string | undefined;
  readonly sounding: boolean;
  readonly src: string;
  readonly time: number;
}

/**
 * One thing the page saw: a media event of the recording named, at a time in milliseconds since
 * the page started.
 */
export interface Seen {
  readonly at: number;
  readonly event: string;
  readonly label: string;
}

/**
 * What the suite reads and does in the page.
 */
export interface ReadAloudPage {
  /**
   * Play a media element of the host's own, outside every island, as a host's media would: heard,
   * or muted and looping, as a decorative video plays.
   *
   * @param src Its file.
   * @param muted Whether it is muted.
   * @returns The promise its `play()` gives.
   */
  readonly foreign: (src: string, muted: boolean) => Promise<void>;
  /**
   * Give the count each counted Media interaction's response holds now, by its identifier: its
   * integer, or empty for NULL.
   *
   * @returns The counts.
   */
  readonly posted: () => Readonly<Record<string, string>>;
  /**
   * Render the first scene, under `<StrictMode>` or not.
   *
   * @param scene The scene.
   * @param strict Whether React renders it in strict mode.
   */
  readonly mount: (scene: Scene, strict: boolean) => void;
  /**
   * Press the controls named, one after another, in one task, as a script can and a child cannot.
   *
   * @param labels The controls' names.
   */
  readonly pressTogether: (labels: readonly string[]) => void;
  /**
   * Give every recording the page has played or holds now.
   *
   * @returns The recordings.
   */
  readonly recordings: () => readonly Recording[];
  /**
   * Render a new scene in place of the last.
   *
   * @param scene The scene.
   */
  readonly scene: (scene: Scene) => void;
  /**
   * Give every moment two recordings or more sounded at once, by their names.
   *
   * @returns The moments.
   */
  readonly overlaps: () => readonly string[];
  /**
   * Give every media event the page saw, in order.
   *
   * @returns What it saw.
   */
  readonly seen: () => readonly Seen[];
}

/**
 * The islands the page renders, as their modules export them: the suite's bundle hands plate's own.
 */
export interface Islands {
  readonly Gap: ComponentType<{ readonly identifier: string; readonly index: number }>;
  readonly GapMatch: ComponentType<{
    readonly caption: undefined;
    readonly children: ReactNode;
    readonly gaps: readonly {
      readonly identifier: string;
      readonly matchGroup: readonly string[];
    }[];
    readonly gapTexts: readonly {
      readonly content: ReactNode;
      readonly identifier: string;
      readonly label: undefined;
      readonly matchGroup: readonly string[];
      readonly matchMax: { readonly kind: "none" };
    }[];
    readonly labels: Readonly<Record<string, string>>;
    readonly maxAssociations: { readonly kind: "none" };
    readonly naming: Readonly<Record<string, never>>;
    readonly prompt: undefined;
    readonly response: {
      readonly baseType: "directedPair";
      readonly cardinality: "multiple";
      readonly identifier: string;
    };
    readonly root: { readonly className: undefined };
  }>;
  readonly Media: ComponentType<{
    readonly autostart: boolean;
    readonly captions: boolean;
    readonly children: ReactNode;
    readonly labels: Readonly<Record<string, string>>;
    readonly least: { readonly kind: "none" };
    readonly maxPlays: { readonly kind: "none" } | { readonly kind: "at-most"; readonly n: number };
    readonly naming: Readonly<Record<string, never>>;
    readonly prompt: undefined;
    readonly response: {
      readonly baseType: "integer";
      readonly cardinality: "single";
      readonly identifier: string;
    };
    readonly root: { readonly className: undefined };
  }>;
  readonly MediaReplay: ComponentType<{
    readonly captions: boolean;
    readonly children: ReactNode;
    readonly labels: Readonly<Record<string, string>>;
    readonly naming: Readonly<Record<string, never>>;
    readonly prompt: undefined;
    readonly recorded: ReactNode;
    readonly root: { readonly className: undefined };
  }>;
  readonly ReadAloud: ComponentType<{
    readonly label: string;
    readonly sources: readonly [{ readonly src: string; readonly type: string }];
  }>;
  readonly ReadAloudItem: ComponentType<{
    readonly children: ReactNode;
    readonly failed: { readonly description: string; readonly title: string };
  }>;
  readonly Responses: ComponentType<{
    readonly children: ReactNode;
    readonly onChange: (next: Held) => void;
    readonly value: Held;
  }>;
}

/**
 * A response as a `<Responses>` holds it, as far as the page writes it: the Gap Match's pairs,
 * each a gap text and a gap, or a Media's count.
 */
interface HeldValue {
  readonly baseType: "directedPair" | "integer";
  readonly cardinality: "multiple" | "single";
  readonly values: readonly (
    | { readonly baseType: "directedPair"; readonly value: readonly [string, string] }
    | { readonly baseType: "integer"; readonly value: bigint }
  )[];
}

/**
 * What a `<Responses>` holds, as far as the page writes it: the Gap Match's response, and what a
 * box was typed into, none here.
 */
interface Held {
  readonly responses: Readonly<Record<string, HeldValue>>;
  readonly typed: Readonly<
    Record<string, { readonly texts: readonly string[]; readonly unread: boolean }>
  >;
}

declare global {
  interface Window {
    /**
     * The page as the suite drives it, once {@link install} has run.
     */
    readAloudPage: ReadAloudPage;
  }
}

/**
 * The limit of a gap text no `match-max` bounds.
 */
const unlimited = { kind: "none" } as const;

/**
 * The media events the account records.
 */
const accounted = ["play", "playing", "pause", "ended", "error", "emptied", "abort"] as const;

/**
 * Install the page: its account, from now on, and `window.readAloudPage`, which renders the
 * islands given.
 *
 * @param islands The islands, plate's own.
 */
export const install = ({
  Gap,
  GapMatch,
  Media,
  MediaReplay,
  ReadAloud,
  ReadAloudItem,
  Responses,
}: Islands): void => {
  const started = performance.now();
  const labels = new Map<HTMLMediaElement, string>();
  const sounding = new Set<HTMLMediaElement>();
  const followed = new WeakSet<HTMLMediaElement>();
  const seen: Seen[] = [];
  const overlaps: string[] = [];

  /**
   * Name a recording: its control's label, the Media's own name, or the host's, read while it
   * stands in the page and kept once it leaves.
   *
   * @param element The recording.
   * @returns Its name.
   */
  const labelOf = (element: HTMLMediaElement): string => {
    const known = labels.get(element);
    if (known !== undefined) {
      return known;
    }

    const label =
      element.closest("[data-slot=plate-read-aloud]")?.querySelector("button")?.textContent ??
      (element.closest("[data-slot=plate-media]") === null
        ? (element.dataset["label"] ?? "unnamed")
        : `media ${element.getAttribute("src") ?? ""}`);

    labels.set(element, label);

    return label;
  };

  /**
   * Tell whether a recording sounds now: it has played since its last stop, it is not paused or
   * ended, though the event that says so may not have reached the page yet, as when a script
   * paused it a moment ago, and it is not muted, so it is heard.
   *
   * @param element The recording.
   * @returns Whether it sounds.
   */
  const audible = (element: HTMLMediaElement): boolean =>
    sounding.has(element) && !element.paused && !element.ended && !element.muted;

  /**
   * Write one thing seen into the account.
   *
   * @param event What was seen.
   * @param element Its recording.
   */
  const note = (event: string, element: HTMLMediaElement): void => {
    seen.push({ at: performance.now() - started, event, label: labelOf(element) });
  };

  /**
   * Account for a recording from its entry into the page on: every media event it fires, heard at
   * the element itself, since an element React has taken out of the document still fires its
   * events but no longer to the document.
   *
   * @param element The recording.
   */
  const follow = (element: HTMLMediaElement): void => {
    for (const event of accounted) {
      element.addEventListener(
        event,
        () => {
          note(event, element);

          if (event === "playing") {
            sounding.add(element);

            const voices = [...sounding].filter(audible);

            if (voices.length > 1) {
              overlaps.push(voices.map(labelOf).join(" + "));
            }
          } else if (event !== "play") {
            sounding.delete(element);
          }
        },
        { capture: true },
      );
    }
  };

  /**
   * Follow every media element that enters the page, alone or inside what enters it, from the
   * moment it enters, before anything can play it.
   *
   * @param nodes What entered the page.
   */
  const entered = (nodes: Iterable<Node>): void => {
    for (const node of nodes) {
      const inside =
        node instanceof Element ? [...node.querySelectorAll<HTMLMediaElement>("audio, video")] : [];
      const found = node instanceof HTMLMediaElement ? [node] : inside;

      for (const element of found.filter((each) => !followed.has(each))) {
        followed.add(element);
        labelOf(element);
        follow(element);
      }
    }
  };
  const watcher = new MutationObserver((records) => {
    for (const record of records) {
      entered(record.addedNodes);
    }
  });

  watcher.observe(document.body, { childList: true, subtree: true });

  let shown: ((scene: Scene) => void) | undefined;
  let counts: Held = { responses: {}, typed: {} };

  /**
   * Render a scene's Gap Match: its labels' controls in the sentence, its gap after the first
   * label, under a `<Responses>` the page holds, as a host holds the item's.
   *
   * @param props The Gap Match.
   * @param props.gapMatch Its instance and labels.
   * @returns The item.
   */
  const GapMatchItem = ({ gapMatch }: { readonly gapMatch: SceneGapMatch }) => {
    const [held, setHeld] = useState<Held>({
      responses: { RESPONSE: { baseType: "directedPair", cardinality: "multiple", values: [] } },
      typed: {},
    });
    const [first, ...rest] = gapMatch.labels.map((control) =>
      createElement(
        "span",
        { key: control.label },
        `${control.label} words`,
        createElement(ReadAloud, {
          label: control.label,
          sources: [{ src: control.src, type: "audio/wav" }],
        }),
      ),
    );

    return createElement(Responses, {
      children: createElement(ReadAloudItem, {
        children: createElement(GapMatch, {
          caption: undefined,
          children: createElement(
            "p",
            null,
            first,
            createElement(Gap, { identifier: "G1", index: 0, key: "G1" }),
            ...rest,
          ),
          gapTexts: ["3", "7"].map((numeral) => ({
            content: numeral,
            identifier: `T${numeral}`,
            label: undefined,
            matchGroup: [],
            matchMax: unlimited,
          })),
          gaps: [{ identifier: "G1", matchGroup: [] }],
          labels: new Proxy<Record<string, string>>({}, { get: (_, key) => String(key) }),
          maxAssociations: unlimited,
          naming: {},
          prompt: undefined,
          response: { baseType: "directedPair", cardinality: "multiple", identifier: "RESPONSE" },
          root: { className: undefined },
        }),
        failed: { description: "Please try again.", title: "Audio error" },
      }),
      onChange: setHeld,
      value: held,
    });
  };

  /**
   * Render a control of a scene.
   *
   * @param control The control's name and file.
   * @returns The island.
   */
  const controlOf = (control: SceneControl) =>
    createElement(ReadAloud, {
      key: control.label,
      label: control.label,
      sources: [{ src: control.src, type: "audio/wav" }],
    });

  /**
   * Render a scene's picture graph in an item of its own.
   *
   * @param props The graph.
   * @param props.graph Its instance, its stem and its categories' labels.
   * @returns The item.
   */
  const GraphItem = ({ graph }: { readonly graph: SceneGraph }) =>
    createElement(ReadAloudItem, {
      children: [
        controlOf(graph.stem),
        createElement("p", { key: "stem" }, "Which fruit do most children like?"),
        createElement(
          "table",
          { key: "graph" },
          createElement(
            "tbody",
            null,
            createElement(
              "tr",
              null,
              graph.labels.map((label) => createElement("td", { key: label.label }, "picture")),
            ),
            createElement(
              "tr",
              null,
              graph.labels.map((label) =>
                createElement(
                  "td",
                  { key: label.label },
                  createElement("span", null, `${label.label} words`, controlOf(label)),
                ),
              ),
            ),
          ),
        ),
      ],
      failed: { description: "Please try again.", title: "Audio error" },
      key: graph.instance,
    });

  /**
   * Render a scene's counted Media interactions in one item, under a `<Responses>` the page holds,
   * as a host holds an attempt's, each Media's plays counted into its own response.
   *
   * @param props The Media interactions.
   * @param props.media Each one's response, file, limit and loop.
   * @returns The item.
   */
  const CountedItem = ({ media }: { readonly media: readonly SceneMedia[] }) => {
    const [held, setHeld] = useState<Held>(() => ({
      responses: Object.fromEntries(
        media.map((each) => [
          each.identifier,
          { baseType: "integer", cardinality: "single", values: [] },
        ]),
      ),
      typed: {},
    }));

    useEffect(() => {
      counts = held;
    }, [held]);

    return createElement(Responses, {
      children: media.map((each) =>
        createElement(Media, {
          autostart: false,
          captions: false,
          children: createElement("audio", { loop: each.loop, preload: "none", src: each.src }),
          key: each.identifier,
          labels: {
            captions: "Captions",
            loading: "Loading",
            noPlaysLeft: "No plays left",
            pause: `Pause ${each.identifier}`,
            play: `Play ${each.identifier}`,
            playsLeft: "{n} plays left",
          },
          least: { kind: "none" },
          maxPlays: each.maxPlays === undefined ? unlimited : { kind: "at-most", n: each.maxPlays },
          naming: {},
          prompt: undefined,
          response: { baseType: "integer", cardinality: "single", identifier: each.identifier },
          root: { className: undefined },
        }),
      ),
      onChange: setHeld,
      value: held,
    });
  };

  /**
   * Render a scene's items and Media interactions, keeping the setter that renders the next one.
   *
   * @param props The first scene.
   * @param props.first The scene.
   * @returns The page.
   */
  const Page = ({ first }: { readonly first: Scene }) => {
    const [scene, setScene] = useState(first);

    useEffect(() => {
      shown = setScene;
    }, []);

    return createElement(
      "main",
      null,
      ...scene.items.map((item, index) =>
        createElement(
          "section",
          { key: `item ${String(index)}` },
          createElement(Activity, {
            children: createElement(ReadAloudItem, {
              children: item.controls.map((control) =>
                createElement(ReadAloud, {
                  key: control.label,
                  label: control.label,
                  sources: [{ src: control.src, type: "audio/wav" }],
                }),
              ),
              failed: { description: "Please try again.", title: "Audio error" },
              key: item.instance,
            }),
            mode: item.hidden ? "hidden" : "visible",
          }),
        ),
      ),
      ...(scene.gapMatch === undefined
        ? []
        : [
            createElement(GapMatchItem, {
              gapMatch: scene.gapMatch,
              key: `gap match ${scene.gapMatch.instance}`,
            }),
          ]),
      ...(scene.graph === undefined
        ? []
        : [createElement(GraphItem, { graph: scene.graph, key: `graph ${scene.graph.instance}` })]),
      ...(scene.counted === undefined
        ? []
        : [createElement(CountedItem, { key: "counted", media: scene.counted })]),
      ...scene.media.map((src) =>
        createElement(MediaReplay, {
          captions: false,
          children: createElement("audio", { preload: "none", src }),
          key: src,
          labels: {
            captions: "Captions",
            loading: "Loading",
            noPlaysLeft: "No plays left",
            pause: `Pause ${src}`,
            play: `Play ${src}`,
            playsLeft: "{n} plays left",
          },
          naming: {},
          prompt: undefined,
          recorded: null,
          root: { className: undefined },
        }),
      ),
    );
  };

  window.readAloudPage = {
    foreign: (src, muted) => {
      const element = document.createElement("audio");

      element.dataset["label"] = muted ? "muted" : "foreign";
      element.loop = muted;
      element.muted = muted;
      element.src = src;
      document.body.append(element);

      return element.play();
    },
    mount: (scene, strict) => {
      const root = document.createElement("div");

      document.body.append(root);

      const page = createElement(Page, { first: scene });

      createRoot(root).render(strict ? createElement(StrictMode, null, page) : page);
    },
    overlaps: () => [...overlaps],
    posted: () =>
      Object.fromEntries(
        Object.entries(counts.responses).map(([identifier, value]) => [
          identifier,
          value.values
            .map((single) =>
              single.baseType === "integer" ? String(single.value) : single.value.join(" "),
            )
            .join(", "),
        ]),
      ),
    pressTogether: (names) => {
      const buttons = [...document.querySelectorAll("button")];

      for (const name of names) {
        buttons.find((button) => button.textContent === name)?.click();
      }
    },
    recordings: () =>
      [...labels.keys(), ...document.querySelectorAll("audio")]
        .filter((element, index, all) => all.indexOf(element) === index)
        .map((element) => {
          const part = element.closest("[data-slot=plate-read-aloud]");

          return {
            detached: !element.isConnected,
            ended: element.ended,
            label: labelOf(element),
            notice: part?.querySelector("[data-slot=plate-read-aloud-notice]")?.textContent ?? "",
            paused: element.paused,
            pressed: part?.querySelector("button")?.getAttribute("aria-pressed") ?? undefined,
            sounding: audible(element),
            src: element.currentSrc,
            time: element.currentTime,
          };
        }),
    scene: (scene) => {
      shown?.(scene);
    },
    seen: () => [...seen],
  };
};
