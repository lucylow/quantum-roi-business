import { describe, expect, it } from "vitest";
import { orchestrateDemo, redactSecrets, routeIntent } from "../src/ai-orchestration";

describe("AI orchestration safety", () => {
  it("routes delivery language to the supported workflow", () => {
    expect(routeIntent("I have 8 drivers and 47 delivery stops")).toBe("delivery-optimization");
  });

  it("redacts common provider credential patterns", () => {
    expect(redactSecrets("token sk-abc123 and Bearer secret-token")).toContain("[REDACTED]");
  });

  it("returns a demo response without executing an action", () => {
    const response = orchestrateDemo("Optimize my warehouse schedule");
    expect(response.mode).toBe("DEMO");
    expect(response.warnings).toContain("No action has been executed.");
  });
});
