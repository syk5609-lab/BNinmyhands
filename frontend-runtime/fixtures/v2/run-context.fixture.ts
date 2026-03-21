import { V2RunContext, V2Timeframe } from "@/components/v2/types";

const BASE_CONTEXT: Omit<V2RunContext, "timeframe"> = {
  updatedLabel: "08:50:22 PM",
  dataAgeLabel: "2m 14s",
  runId: "run_vptd5wa1",
  runStatus: "complete",
  ingestionHealth: "ok",
  symbolCount: 200,
};

export function getRunContextFixture(timeframe: V2Timeframe): V2RunContext {
  return { ...BASE_CONTEXT, timeframe };
}
