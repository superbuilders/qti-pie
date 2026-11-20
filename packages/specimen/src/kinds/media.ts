/**
 * Media (`qti-media-interaction`): a recording the child plays, audio or a video, its response
 * the count of plays, scored when the child has played it as often as it asks.
 *
 * @module
 */
import { Option } from "effect";
import { Base64 } from "effect/encoding";
import type { Answered } from "#specimen/answer.ts";
import { credited } from "#specimen/credit.ts";
import { dimension } from "#specimen/dimension.ts";
import { kind } from "#specimen/kind.ts";
import { aspect, placed, placeholder, scale, sizeOf, svgAddress } from "#specimen/picture.ts";
import type { Asset, Picture } from "#specimen/picture.ts";
import { declaration } from "#specimen/response.ts";
import { element } from "#specimen/xml.ts";

/**
 * The response's identifier.
 */
const response = "RESPONSE";

/**
 * How many plays it asks for: no limit and no least; exactly one (`min-plays` and `max-plays` 1);
 * or two of at most three.
 */
const plays = dimension("Plays", [
  ["free", "Unlimited", { least: 0, most: 0 }],
  ["once", "Exactly once", { least: 1, most: 1 }],
  ["twice", "Twice, at most three times", { least: 2, most: 3 }],
]);

/**
 * A Media's settings.
 */
interface MediaSettings {
  readonly autostart: boolean;
  /**
   * Whether a captions track goes with it.
   */
  readonly captions: boolean;
  /**
   * Whether the player shows its controls, or the author writes `controls="false"`.
   */
  readonly controls: boolean;
  readonly loop: boolean;
  readonly player:
    | { readonly kind: "audio" }
    | { readonly kind: "video"; readonly picture: Picture };
  readonly plays: (typeof plays.values)[number]["value"];
}

/**
 * Write a little-endian whole number into a file's bytes.
 *
 * @param bytes The file.
 * @param at Where it starts.
 * @param value The number.
 * @param width How many bytes it takes.
 */
const writeNumber = (bytes: Uint8Array, at: number, value: number, width: 2 | 4): void => {
  for (let place = 0; place < width; place += 1) {
    bytes[at + place] = Math.floor(value / 256 ** place) % 256;
  }
};

/**
 * The samples a second of the recording holds: 8 kHz, so the file stays small.
 */
const rate = 8000;

/**
 * The recording: a second of silence as a WAV file, PCM, one channel of 8-bit samples, each 128,
 * the unsigned midpoint. A player plays it to its end, so the plays it counts are real ones; a
 * video player plays its sound under the poster.
 *
 * @returns The file's bytes.
 */
const silence = (): Uint8Array => {
  const bytes = new Uint8Array(44 + rate).fill(128);
  const ascii = (at: number, text: string) => {
    bytes.set(new TextEncoder().encode(text), at);
  };
  ascii(0, "RIFF");
  writeNumber(bytes, 4, 36 + rate, 4);
  ascii(8, "WAVEfmt ");
  writeNumber(bytes, 16, 16, 4);
  writeNumber(bytes, 20, 1, 2);
  writeNumber(bytes, 22, 1, 2);
  writeNumber(bytes, 24, rate, 4);
  writeNumber(bytes, 28, rate, 4);
  writeNumber(bytes, 32, 1, 2);
  writeNumber(bytes, 34, 8, 2);
  ascii(36, "data");
  writeNumber(bytes, 40, rate, 4);

  return bytes;
};

/**
 * The recording's file, placed beside the item.
 */
const recording = placed("silence.wav", `data:audio/wav;base64,${Base64.encode(silence())}`);

/**
 * The captions' file: one cue over the second.
 */
const captions = placed(
  "captions.vtt",
  `data:text/vtt;base64,${Base64.encode(new TextEncoder().encode("WEBVTT\n\n00:00.000 --> 00:01.000\nA quiet second.\n"))}`,
);

/**
 * The plays a child who answers as it asks makes: its least, and one where it asks for none.
 *
 * @param settings The settings.
 * @returns The count.
 */
const enough = (settings: MediaSettings): number => Math.max(1, settings.plays.least);

/**
 * The response a count of plays posts.
 *
 * @param count The count.
 * @returns Its one entry.
 */
const posted = (count: number): Answered["posted"] => [[response, String(count)]];

/**
 * A Media's player: its markup, and the poster's file for a video.
 */
interface Player {
  readonly assets: readonly Asset[];
  readonly markup: string;
}

/**
 * Write the player: an `audio`, or a `video` of the picture's size with a placeholder poster,
 * either with its controls hidden when the settings hide them.
 *
 * @param settings The settings.
 * @param inside Its `source` and `track` children.
 * @returns Its markup, and the poster's file for a video.
 */
const playerOf = (settings: MediaSettings, inside: readonly string[]): Player => {
  const controls = { controls: settings.controls ? Option.none() : Option.some("false") };

  switch (settings.player.kind) {
    case "audio": {
      return { assets: [], markup: element("audio", controls, ...inside) };
    }
    case "video": {
      const size = sizeOf(settings.player.picture);
      const poster = placed(
        `poster-${settings.player.picture.aspect}-${settings.player.picture.scale}.svg`,
        svgAddress(placeholder(size, "A video", [])),
      );

      return {
        assets: [poster.asset],
        markup: element(
          "video",
          { ...controls, height: size.height, poster: poster.src, width: size.width },
          ...inside,
        ),
      };
    }
    default: {
      return settings.player satisfies never;
    }
  }
};

export const media = kind("media", {
  answers: (settings: MediaSettings) => {
    const fewer: readonly Answered[] =
      enough(settings) < 2
        ? []
        : [{ answer: "partial", posted: posted(enough(settings) - 1), score: 0 }];

    return [
      { answer: "right", posted: posted(enough(settings)), score: 1 },
      ...fewer,
      { answer: "empty", posted: [], score: 0 },
    ];
  },
  dimensions: {
    autostart: dimension("Starts by itself", [
      ["no", "No", false],
      ["yes", "Yes", true],
    ]),
    captions: dimension("Captions", [
      ["none", "None", false],
      ["track", "A captions track", true],
    ]),
    controls: dimension("Controls", [
      ["shown", "Shown", true],
      ["hidden", 'controls="false"', false],
    ]),
    loop: dimension("Loops", [
      ["no", "No", false],
      ["yes", "Yes", true],
    ]),
    player: dimension("Player", [
      ["audio", "Audio", "audio"],
      ["video", "Video", "video"],
    ]),
    plays,
    "video-aspect": aspect,
    "video-scale": scale,
  },
  label: "Media",
  settings:
    (pick) =>
    (source): MediaSettings => ({
      autostart: source.draw(pick("autostart")),
      captions: source.draw(pick("captions")),
      controls: source.draw(pick("controls")),
      loop: source.draw(pick("loop")),
      player:
        source.draw(pick("player")) === "audio"
          ? { kind: "audio" }
          : {
              kind: "video",
              picture: {
                aspect: source.draw(pick("video-aspect")),
                scale: source.draw(pick("video-scale")),
              },
            },
      plays: source.draw(pick("plays")),
    }),
  write: (settings: MediaSettings, context) => {
    const inside = [
      element("source", { src: recording.src, type: "audio/wav" }),
      ...(settings.captions
        ? [element("track", { kind: "captions", src: captions.src, srclang: "en" })]
        : []),
    ];
    const player = playerOf(settings, inside);

    return {
      assets: [recording.asset, ...(settings.captions ? [captions.asset] : []), ...player.assets],
      body: element(
        "qti-media-interaction",
        {
          autostart: String(settings.autostart),
          loop: settings.loop ? Option.some("true") : Option.none(),
          "max-plays": Option.liftPredicate(settings.plays.most, (most) => most > 0),
          "min-plays": Option.liftPredicate(settings.plays.least, (least) => least > 0),
          "response-identifier": response,
        },
        ...Option.match(context.prompt, {
          onNone: () => [],
          onSome: (prompt) => [element("qti-prompt", {}, prompt)],
        }),
        player.markup,
      ),
      declarations: [declaration(response, "single", "integer")],
      host: Option.none(),
      scoring: {
        kind: "scored",
        most: 1,
        rules: [
          credited(
            element(
              "qti-gte",
              {},
              element("qti-variable", { identifier: response }),
              element("qti-base-value", { "base-type": "integer" }, String(enough(settings))),
            ),
            1,
          ),
        ],
      },
    };
  },
});
