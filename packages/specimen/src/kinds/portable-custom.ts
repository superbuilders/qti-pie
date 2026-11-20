/**
 * Portable Custom (`qti-portable-custom-interaction`): the specimen's own Portable Custom
 * Interaction, a press counter, whose response is the count of presses.
 *
 * The item names the module by a package path, as a package holds one; the host facts route it to
 * the module's source as a `data:` URL, which the frame page's `'strict-dynamic'` script policy
 * lets the frame's boot load, so no host serves a file for it. The facts' `loader` is qti-app's
 * frame page, `/pci/frame.html`, the one host that runs these cases.
 *
 * @module
 */
import { Option } from "effect";
import { Base64 } from "effect/encoding";
import type { Answered } from "#specimen/answer.ts";
import { credited, matchesCorrect } from "#specimen/credit.ts";
import { dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { correctResponse, declaration } from "#specimen/response.ts";
import { element } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * The counter's type identifier, which its module registers.
 */
const typeIdentifier = "urn:qti-pie:specimen:counter";

/**
 * The counter's AMD module id, and its location in the package, as the item names it.
 */
const module = { id: "specimen-counter", path: "modules/specimen-counter" } as const;

/**
 * The counter: an AMD module that defines against `qtiCustomInteractionContext` and registers a
 * factory for {@link typeIdentifier}. It counts from the interaction's `data-start` up to its
 * `data-max-count`, shows the markup's `template` face when the markup holds one and a count of its
 * own when not, and reports the count as a single integer in the Appendix C JSON binding.
 */
const moduleText = `define(["qtiCustomInteractionContext"], function (context) {
  "use strict";
  function Counter(dom, configuration) {
    var properties = configuration.properties || {};
    var face = dom.querySelector("template");
    var self = this;
    this.dom = dom;
    this.configuration = configuration;
    this.count = Number(properties.start || 0);
    this.most = Number(properties.maxCount || 5);
    this.status = configuration.status || "interacting";
    dom.appendChild(face ? face.content.cloneNode(true) : dom.ownerDocument.createElement("output"));
    this.value = dom.querySelector(".counter-value") || dom.querySelector("output");
    this.button = dom.ownerDocument.createElement("button");
    this.button.type = "button";
    this.button.textContent = "Press";
    this.button.addEventListener("click", function () { self.press(); });
    dom.appendChild(this.button);
    this.show();
    if (typeof configuration.onready === "function") { configuration.onready(this, this.getState()); }
  }
  Counter.prototype.show = function () {
    this.value.textContent = String(this.count);
    this.button.disabled = this.status !== "interacting" || this.count >= this.most;
  };
  Counter.prototype.press = function () {
    if (this.status !== "interacting" || this.count >= this.most) { return; }
    this.count += 1;
    this.show();
    this.dom.dispatchEvent(new CustomEvent("qti-interaction-changed", { bubbles: true, detail: { interaction: this, responseIdentifier: this.configuration.responseIdentifier } }));
  };
  Counter.prototype.getResponse = function () { return { base: { integer: this.count } }; };
  Counter.prototype.getState = function () { return { count: this.count }; };
  Counter.prototype.setState = function (state) { if (state && typeof state.count === "number") { this.count = state.count; this.show(); } };
  Counter.prototype.checkValidity = function () { return true; };
  Counter.prototype.getCustomValidity = function () { return ""; };
  Counter.prototype.setStatus = function (status) { this.status = status; this.show(); };
  Counter.prototype.oncompleted = function () {
    this.button.disabled = true;
    if (typeof this.configuration.ondone === "function") { this.configuration.ondone(this, this.getResponse(), this.getState(), "closed"); }
  };
  context.register({
    typeIdentifier: "${typeIdentifier}",
    getInstance: function (dom, configuration, state) {
      var counter = new Counter(dom, configuration);
      if (state) { counter.setState(typeof state === "string" ? JSON.parse(state) : state); }
      return counter;
    }
  });
});
`;

/**
 * The host facts every case gives: qti-app's frame page as the loader, and the counter's route,
 * its source as a `data:` URL, with the wait plate's resolution gives a module whose
 * configuration names none.
 */
const host = {
  pci: {
    loader: "/pci/frame.html",
    modules: new Map([
      [
        response,
        [
          {
            fallback: Option.none(),
            id: module.id,
            primary: Option.some(
              `data:text/javascript;base64,${Base64.encode(new TextEncoder().encode(moduleText))}`,
            ),
            waitSeconds: { fallback: 30, primary: 30 },
          },
        ],
      ],
    ]),
  },
};

/**
 * A Portable Custom's settings.
 */
interface PortableCustomSettings {
  /**
   * Whether the markup holds a `template` face the counter shows, or leaves it to show its own.
   */
  readonly face: "own" | "template";
  /**
   * The count it starts at, `data-start`, and the most it reaches, `data-max-count`.
   */
  readonly range: (typeof ranges.values)[number]["value"];
}

/**
 * The counts it starts at and reaches.
 */
const ranges = dimension("Counts", [
  ["zero-to-five", "From 0 to 5", { most: 5, start: 0 }],
  ["one-to-three", "From 1 to 3", { most: 3, start: 1 }],
]);

/**
 * The count the child is asked for: two presses from the start.
 *
 * @param settings The settings.
 * @returns The count.
 */
const rightCount = (settings: PortableCustomSettings): number => settings.range.start + 2;

/**
 * The response a count posts.
 *
 * @param count The count.
 * @returns Its one entry.
 */
const posted = (count: number): Answered["posted"] => [[response, String(count)]];

export const portableCustom = kind("portable-custom", {
  answers: (settings: PortableCustomSettings) => [
    { answer: "right", posted: posted(rightCount(settings)), score: 1 },
    { answer: "wrong", posted: posted(rightCount(settings) - 1), score: 0 },
    { answer: "empty", posted: [], score: 0 },
  ],
  dimensions: {
    face: dimension("Face", [
      ["template", "A template in the markup", "template"],
      ["own", "The counter's own", "own"],
    ]),
    range: ranges,
  },
  label: "Portable Custom",
  settings:
    (pick) =>
    (source): PortableCustomSettings => ({
      face: source.draw(pick("face")),
      range: source.draw(pick("range")),
    }),
  write: (settings: PortableCustomSettings, context) => ({
    assets: [],
    body: element(
      "qti-portable-custom-interaction",
      {
        "custom-interaction-type-identifier": typeIdentifier,
        "data-max-count": settings.range.most,
        "data-start": settings.range.start,
        module: module.id,
        "response-identifier": response,
      },
      ...Option.match(context.prompt, {
        onNone: () => [],
        onSome: (prompt) => [element("qti-prompt", {}, prompt)],
      }),
      element(
        "qti-interaction-modules",
        {},
        element("qti-interaction-module", { id: module.id, "primary-path": module.path }),
      ),
      element(
        "qti-interaction-markup",
        {},
        element("p", {}, `Press the button until the count says ${String(rightCount(settings))}.`),
        ...(settings.face === "template"
          ? [
              element(
                "template",
                {},
                element(
                  "div",
                  { class: "counter-face" },
                  element("span", { class: "counter-value" }, "0"),
                ),
              ),
            ]
          : []),
      ),
    ),
    declarations: [
      declaration(response, "single", "integer", correctResponse([String(rightCount(settings))])),
    ],
    host: Option.some(host),
    scoring: { kind: "scored", most: 1, rules: [credited(matchesCorrect(response), 1)] },
  }),
});
