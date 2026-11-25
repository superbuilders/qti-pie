/**
 * Every script entry of plate's exports map but this table's own, by its subpath, and every
 * `"use client"` module under plate's `src/`, by its path there, each with its module's exports,
 * imported statically: the entries through the package's own name, as a host loads them, and the
 * client modules through `#plate/*`, as the server shell does. Written by
 * `src/test/emit-modules.ts` (`pnpm run generate`), which `pnpm run generate:check` holds it to.
 *
 * @module
 */
import * as entry0 from "@qti-pie/plate";
import * as entry1 from "@qti-pie/plate/admission-codes";
import * as entry2 from "@qti-pie/plate/alpha";
import * as entry3 from "@qti-pie/plate/alpha/math-entry";
import * as entry4 from "@qti-pie/plate/alpha/pci-modules";
import * as entry5 from "@qti-pie/plate/codec";
import * as entry6 from "@qti-pie/plate/rich-text";
import * as entry7 from "@qti-pie/plate/ui";
import * as entry8 from "@qti-pie/plate/ui/client";
import * as entry9 from "@qti-pie/plate/ui/props";
import * as entry10 from "@qti-pie/plate/ui/pci-frame";
import * as entry11 from "@qti-pie/plate/test/admitted";
import * as entry12 from "@qti-pie/plate/test/catalog-shown";
import * as entry13 from "@qti-pie/plate/test/corpus";
import * as entry14 from "@qti-pie/plate/test/golden";
import * as entry15 from "@qti-pie/plate/test/records";
import * as entry16 from "@qti-pie/plate/words";
import * as client0 from "#plate/alpha/math-entry/math-entry.tsx";
import * as client1 from "#plate/ui/associate/associate.tsx";
import * as client2 from "#plate/ui/choice/choice.tsx";
import * as client3 from "#plate/ui/end-attempt/end-attempt.tsx";
import * as client4 from "#plate/ui/extended-text/extended-text.tsx";
import * as client5 from "#plate/ui/extended-text/rich-text.tsx";
import * as client6 from "#plate/ui/gap-match/gap-match.tsx";
import * as client7 from "#plate/ui/graphic-associate/graphic-associate.tsx";
import * as client8 from "#plate/ui/graphic-gap-match/graphic-gap-match.tsx";
import * as client9 from "#plate/ui/graphic-order/graphic-order.tsx";
import * as client10 from "#plate/ui/graphic/stage.tsx";
import * as client11 from "#plate/ui/hotspot/hotspot.tsx";
import * as client12 from "#plate/ui/hottext/hottext.tsx";
import * as client13 from "#plate/ui/inline-choice/inline-choice.tsx";
import * as client14 from "#plate/ui/match/match.tsx";
import * as client15 from "#plate/ui/match/table.tsx";
import * as client16 from "#plate/ui/media/media.tsx";
import * as client17 from "#plate/ui/order/order.tsx";
import * as client18 from "#plate/ui/passages/passage-tabs.tsx";
import * as client19 from "#plate/ui/picks/eliminated.tsx";
import * as client20 from "#plate/ui/picks/picks-group.tsx";
import * as client21 from "#plate/ui/placement/boxes.tsx";
import * as client22 from "#plate/ui/placement/parts.tsx";
import * as client23 from "#plate/ui/portable-custom/failures.tsx";
import * as client24 from "#plate/ui/portable-custom/portable-custom.tsx";
import * as client25 from "#plate/ui/position-object/position-object.tsx";
import * as client26 from "#plate/ui/presence/beacon.ts";
import * as client27 from "#plate/ui/read-aloud/read-aloud.tsx";
import * as client28 from "#plate/ui/read-aloud/session.tsx";
import * as client29 from "#plate/ui/responses.tsx";
import * as client30 from "#plate/ui/select-point/select-point.tsx";
import * as client31 from "#plate/ui/slider/slider.tsx";
import * as client32 from "#plate/ui/text-entry/keys.tsx";
import * as client33 from "#plate/ui/text-entry/text-entry.tsx";

/**
 * The exports map's script entries, each subpath with its module's exports, in the map's order.
 */
export const entries = Object.freeze([
  [".", entry0],
  ["./admission-codes", entry1],
  ["./alpha", entry2],
  ["./alpha/math-entry", entry3],
  ["./alpha/pci-modules", entry4],
  ["./codec", entry5],
  ["./rich-text", entry6],
  ["./ui", entry7],
  ["./ui/client", entry8],
  ["./ui/props", entry9],
  ["./ui/pci-frame", entry10],
  ["./test/admitted", entry11],
  ["./test/catalog-shown", entry12],
  ["./test/corpus", entry13],
  ["./test/golden", entry14],
  ["./test/records", entry15],
  ["./words", entry16],
]);

/**
 * The `"use client"` modules, each path under `src/` with its module's exports, sorted.
 */
export const clients = Object.freeze([
  ["alpha/math-entry/math-entry.tsx", client0],
  ["ui/associate/associate.tsx", client1],
  ["ui/choice/choice.tsx", client2],
  ["ui/end-attempt/end-attempt.tsx", client3],
  ["ui/extended-text/extended-text.tsx", client4],
  ["ui/extended-text/rich-text.tsx", client5],
  ["ui/gap-match/gap-match.tsx", client6],
  ["ui/graphic-associate/graphic-associate.tsx", client7],
  ["ui/graphic-gap-match/graphic-gap-match.tsx", client8],
  ["ui/graphic-order/graphic-order.tsx", client9],
  ["ui/graphic/stage.tsx", client10],
  ["ui/hotspot/hotspot.tsx", client11],
  ["ui/hottext/hottext.tsx", client12],
  ["ui/inline-choice/inline-choice.tsx", client13],
  ["ui/match/match.tsx", client14],
  ["ui/match/table.tsx", client15],
  ["ui/media/media.tsx", client16],
  ["ui/order/order.tsx", client17],
  ["ui/passages/passage-tabs.tsx", client18],
  ["ui/picks/eliminated.tsx", client19],
  ["ui/picks/picks-group.tsx", client20],
  ["ui/placement/boxes.tsx", client21],
  ["ui/placement/parts.tsx", client22],
  ["ui/portable-custom/failures.tsx", client23],
  ["ui/portable-custom/portable-custom.tsx", client24],
  ["ui/position-object/position-object.tsx", client25],
  ["ui/presence/beacon.ts", client26],
  ["ui/read-aloud/read-aloud.tsx", client27],
  ["ui/read-aloud/session.tsx", client28],
  ["ui/responses.tsx", client29],
  ["ui/select-point/select-point.tsx", client30],
  ["ui/slider/slider.tsx", client31],
  ["ui/text-entry/keys.tsx", client32],
  ["ui/text-entry/text-entry.tsx", client33],
]);
