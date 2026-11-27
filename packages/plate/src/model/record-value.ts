/**
 * Whether a response's value is a record, the one test of a value's shape that the value model's
 * readers and every client island holding responses share. It imports nothing at run time, so
 * plate's responses context (`#plate/ui/responses.tsx`), and through it every island a host outside
 * qti-pie's workspace renders, loads none of the value model's lexical reading
 * (`#plate/model/values.ts`), which reads through crust's text primitives and with them
 * grizzle-text: such a host installs neither, nor qti-pie's grizzle submodule
 * (`#tools/module-graph.test.ts` holds the island's closure to it).
 *
 * @module
 */
import type { RecordValue, ResponseValue } from "#plate/model/values.ts";

/**
 * Report whether a response's value is a record.
 *
 * @param value The value to test.
 * @returns Whether `value` is a {@link RecordValue}.
 */
export const isRecordValue = (value: ResponseValue): value is RecordValue =>
  value.cardinality === "record";
