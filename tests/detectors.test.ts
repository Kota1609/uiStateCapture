import { describe, it, expect } from "vitest";
import { ModalDetector, StatusNotificationDetector, FormDetector, DetectorRegistry } from "../packages/backend/src/core/detectors/index.js";

describe("Detectors", () => {
  describe("DetectorRegistry", () => {
    it("should register detectors", () => {
      const registry = new DetectorRegistry();
      expect(registry.get("modal_visible")).toBeDefined();
      expect(registry.get("status_notification")).toBeDefined();
      expect(registry.get("form_ready")).toBeDefined();
      expect(registry.get("quiet_window")).toBeDefined();
    });

    it("should get fired detectors", () => {
      const registry = new DetectorRegistry();
      const results = new Map([
        ["modal_visible", { fired: true, confidence: 1.0, reason: "test" }],
        ["status_notification", { fired: false, confidence: 0, reason: "test" }],
        ["form_ready", { fired: true, confidence: 0.95, reason: "test" }],
      ]);

      const fired = registry.getFiredDetectors(results);
      expect(fired).toEqual(["modal_visible", "form_ready"]);
    });
  });
});


