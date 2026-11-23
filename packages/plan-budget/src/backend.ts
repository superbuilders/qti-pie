/**
 * A backend's own work, read from the machine: its on-CPU time from `/proc/<pid>/schedstat`, the
 * scheduler's count of nanoseconds it ran, which leaves out the time it waited on a run queue, so a
 * machine shared by many jobs moves it far less than the backend's wall time; and its process
 * status's resident memory. The database is a cluster on this machine, so its backends' processes
 * are readable here.
 *
 * @module
 */
import { readFileSync } from "node:fs";

/**
 * Nanoseconds in a millisecond.
 */
const nanosPerMilli = 1_000_000;

/**
 * A backend's scheduler counts: nanoseconds on a CPU and nanoseconds waiting on a run queue.
 */
export interface Scheduled {
  readonly cpuNs: number;
  readonly queuedNs: number;
}

/**
 * A backend's scheduler counts now.
 *
 * @param pid - The backend's process id.
 * @returns Its counts; a backend that has ended reads as never run.
 */
export const scheduledOf = (pid: number): Scheduled => {
  const [cpu = "0", queued = "0"] = readFileSync(`/proc/${String(pid)}/schedstat`, "utf-8")
    .trim()
    .split(" ");

  return { cpuNs: Number(cpu), queuedNs: Number(queued) };
};

/**
 * The on-CPU milliseconds between two readings of one backend.
 *
 * @param before - The earlier reading.
 * @param after - The later reading.
 * @returns The milliseconds it ran between them.
 */
export const cpuMsBetween = (before: Scheduled, after: Scheduled): number =>
  (after.cpuNs - before.cpuNs) / nanosPerMilli;

/**
 * The run-queue milliseconds between two readings of one backend: how long it was ready to run and
 * waited for a CPU.
 *
 * @param before - The earlier reading.
 * @param after - The later reading.
 * @returns The milliseconds it waited between them.
 */
export const queuedMsBetween = (before: Scheduled, after: Scheduled): number =>
  (after.queuedNs - before.queuedNs) / nanosPerMilli;

/**
 * The machine's one-minute load average, which each measurement records beside its times.
 *
 * @returns The load average.
 */
export const loadNow = (): number => Number(readFileSync("/proc/loadavg", "utf-8").split(" ")[0]);
