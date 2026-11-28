/**
 * The browser floor of qti-pie's hosts: the oldest release of each browser a learner may open a
 * host's page in. Everything qti-pie draws or runs uses only what each of them fully supports, with
 * no polyfill and no lowering: plate's stylesheets, the PCI frame's boot, the island that hosts it
 * and Alpha's PCI modules, held to it against MDN's browser compatibility data by
 * `#plate/test/browser-floor.test.ts`.
 *
 * It is data, the one table of the floor: a host gates its pages by it and builds for it, as
 * AlphaTest's player does (`@qti-pie/plate/browser-floor`), so the two cannot drift. This module
 * imports nothing, so a host imports it as TypeScript from its path with none of plate's
 * dependencies installed.
 *
 * @module
 * @source Bjorn's rulings of 2026-11-28 (edullm-bd): Chrome 131 and Safari 18.1, on macOS and on
 *   iOS and iPadOS, the player's own floor; and Firefox at the release the test derives.
 * @see https://github.com/mdn/browser-compat-data
 */

/**
 * The floor: each browser a learner may open a host's page in, by its key in MDN's browser
 * compatibility data, and its oldest release. A host's gate reads a user agent as one of these
 * keys and its release, and fails closed: a browser it reads as none of them, or older than its
 * entry, is refused, and the learner is asked to update.
 *
 * - `chrome`: every Chromium browser off iOS (Chrome, Edge, an app's Chromium WebView, Chrome on
 *   Android), by its Chromium release, the major of `Chrome/<major>` in its user agent.
 * - `firefox`: Firefox off iOS, by the major of `Firefox/<major>`; the oldest release that fully
 *   supports every feature qti-pie uses, which `#plate/test/browser-floor.test.ts` derives from the
 *   data and holds this entry equal to: today `zoom` (mark-objects) and `URL.parse` (the island)
 *   set it at 126.
 * - `safari`: Safari on macOS, by `Version/<release>` beside `Safari/`.
 * - `safari_ios`: every browser on iOS and iPadOS, which all run WebKit, by the system's release, `OS
 *   <major>_<minor>` in the user agent, which is its WebKit's Safari release.
 */
export const browserFloor = { chrome: 131, firefox: 126, safari: 18.1, safari_ios: 18.1 } as const;
