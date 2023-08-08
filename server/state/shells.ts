import { ChildProcessWithoutNullStreams } from "child_process";

export let shells: Record<string, ChildProcessWithoutNullStreams> = {};
