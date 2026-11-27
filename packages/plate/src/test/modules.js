/**
 * Plate's table of core's modules, every one outside an `alpha/` folder but this table's own entry:
 * each script entry of the exports map, by its subpath, and each `"use client"` module under
 * `src/`, by its path there, with its exports as name and value pairs, imported statically: the
 * entries through the package's own name, as a host loads them, and the client modules through
 * `#plate/*`, as the server shell does, but a client module an entry names, imported once,
 * through its entry. `src/test/emit-modules.ts` writes it, and its check holds it to the sources.
 *
 * @module
 */
import * as entry0 from "@qti-pie/plate";
import * as entry1 from "@qti-pie/plate/admission-codes";
import * as entry2 from "@qti-pie/plate/codec";
import * as entry3 from "@qti-pie/plate/rich-text";
import * as entry4 from "@qti-pie/plate/ui";
import * as entry5 from "@qti-pie/plate/ui/client";
import * as entry6 from "@qti-pie/plate/ui/hotspot";
import * as entry7 from "@qti-pie/plate/ui/props";
import * as entry8 from "@qti-pie/plate/ui/pci-frame";
import * as entry9 from "@qti-pie/plate/ui/responses";
import * as entry10 from "@qti-pie/plate/test/admitted";
import * as entry11 from "@qti-pie/plate/test/catalog-shown";
import * as entry12 from "@qti-pie/plate/test/corpus";
import * as entry13 from "@qti-pie/plate/test/golden";
import * as entry14 from "@qti-pie/plate/test/records";
import * as entry15 from "@qti-pie/plate/words";
import * as client0 from "#plate/ui/associate/associate.tsx";
import * as client1 from "#plate/ui/choice/choice.tsx";
import * as client2 from "#plate/ui/end-attempt/end-attempt.tsx";
import * as client3 from "#plate/ui/extended-text/extended-text.tsx";
import * as client4 from "#plate/ui/extended-text/rich-text.tsx";
import * as client5 from "#plate/ui/gap-match/gap-match.tsx";
import * as client6 from "#plate/ui/graphic-associate/graphic-associate.tsx";
import * as client7 from "#plate/ui/graphic-gap-match/graphic-gap-match.tsx";
import * as client8 from "#plate/ui/graphic-order/graphic-order.tsx";
import * as client9 from "#plate/ui/graphic/stage.tsx";
import * as client11 from "#plate/ui/hottext/hottext.tsx";
import * as client12 from "#plate/ui/inline-choice/inline-choice.tsx";
import * as client13 from "#plate/ui/match/match.tsx";
import * as client14 from "#plate/ui/match/table.tsx";
import * as client15 from "#plate/ui/media/media.tsx";
import * as client16 from "#plate/ui/order/order.tsx";
import * as client17 from "#plate/ui/passages/passage-tabs.tsx";
import * as client18 from "#plate/ui/picks/eliminated.tsx";
import * as client19 from "#plate/ui/picks/picks-group.tsx";
import * as client20 from "#plate/ui/placement/boxes.tsx";
import * as client21 from "#plate/ui/placement/parts.tsx";
import * as client22 from "#plate/ui/portable-custom/failures.tsx";
import * as client23 from "#plate/ui/portable-custom/portable-custom.tsx";
import * as client24 from "#plate/ui/position-object/position-object.tsx";
import * as client25 from "#plate/ui/presence/beacon.ts";
import * as client26 from "#plate/ui/read-aloud/read-aloud.tsx";
import * as client27 from "#plate/ui/read-aloud/session.tsx";
import * as client29 from "#plate/ui/select-point/select-point.tsx";
import * as client30 from "#plate/ui/slider/slider.tsx";
import * as client31 from "#plate/ui/text-entry/keys.tsx";
import * as client32 from "#plate/ui/text-entry/text-entry.tsx";

/**
 * The table's script entries, each subpath with its module's exports, in the map's order.
 */
export const entries = Object.freeze([
  [".", Object.entries(entry0)],
  ["./admission-codes", Object.entries(entry1)],
  ["./codec", Object.entries(entry2)],
  ["./rich-text", Object.entries(entry3)],
  ["./ui", Object.entries(entry4)],
  ["./ui/client", Object.entries(entry5)],
  ["./ui/hotspot", Object.entries(entry6)],
  ["./ui/props", Object.entries(entry7)],
  ["./ui/pci-frame", Object.entries(entry8)],
  ["./ui/responses", Object.entries(entry9)],
  ["./test/admitted", Object.entries(entry10)],
  ["./test/catalog-shown", Object.entries(entry11)],
  ["./test/corpus", Object.entries(entry12)],
  ["./test/golden", Object.entries(entry13)],
  ["./test/records", Object.entries(entry14)],
  ["./words", Object.entries(entry15)],
]);

/**
 * The table's `"use client"` modules, each path under `src/` with its exports, sorted.
 */
export const clients = Object.freeze([
  ["ui/associate/associate.tsx", Object.entries(client0)],
  ["ui/choice/choice.tsx", Object.entries(client1)],
  ["ui/end-attempt/end-attempt.tsx", Object.entries(client2)],
  ["ui/extended-text/extended-text.tsx", Object.entries(client3)],
  ["ui/extended-text/rich-text.tsx", Object.entries(client4)],
  ["ui/gap-match/gap-match.tsx", Object.entries(client5)],
  ["ui/graphic-associate/graphic-associate.tsx", Object.entries(client6)],
  ["ui/graphic-gap-match/graphic-gap-match.tsx", Object.entries(client7)],
  ["ui/graphic-order/graphic-order.tsx", Object.entries(client8)],
  ["ui/graphic/stage.tsx", Object.entries(client9)],
  ["ui/hotspot/hotspot.tsx", Object.entries(entry6)],
  ["ui/hottext/hottext.tsx", Object.entries(client11)],
  ["ui/inline-choice/inline-choice.tsx", Object.entries(client12)],
  ["ui/match/match.tsx", Object.entries(client13)],
  ["ui/match/table.tsx", Object.entries(client14)],
  ["ui/media/media.tsx", Object.entries(client15)],
  ["ui/order/order.tsx", Object.entries(client16)],
  ["ui/passages/passage-tabs.tsx", Object.entries(client17)],
  ["ui/picks/eliminated.tsx", Object.entries(client18)],
  ["ui/picks/picks-group.tsx", Object.entries(client19)],
  ["ui/placement/boxes.tsx", Object.entries(client20)],
  ["ui/placement/parts.tsx", Object.entries(client21)],
  ["ui/portable-custom/failures.tsx", Object.entries(client22)],
  ["ui/portable-custom/portable-custom.tsx", Object.entries(client23)],
  ["ui/position-object/position-object.tsx", Object.entries(client24)],
  ["ui/presence/beacon.ts", Object.entries(client25)],
  ["ui/read-aloud/read-aloud.tsx", Object.entries(client26)],
  ["ui/read-aloud/session.tsx", Object.entries(client27)],
  ["ui/responses.tsx", Object.entries(entry9)],
  ["ui/select-point/select-point.tsx", Object.entries(client29)],
  ["ui/slider/slider.tsx", Object.entries(client30)],
  ["ui/text-entry/keys.tsx", Object.entries(client31)],
  ["ui/text-entry/text-entry.tsx", Object.entries(client32)],
]);
