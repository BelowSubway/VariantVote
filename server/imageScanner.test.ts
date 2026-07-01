import { describe, expect, it } from "vitest";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { compareGroupIds, parseImageFilename, scanImageFolder } from "./imageScanner";

describe("parseImageFilename", () => {
  it("parses category and id using the last underscore", () => {
    expect(parseImageFilename("Krea_Lora_A_15.png")).toMatchObject({
      category: "Krea_Lora_A",
      groupId: "15"
    });
  });

  it("accepts supported extensions case-insensitively", () => {
    expect(parseImageFilename("KreaNoLora_1.PNG")).toMatchObject({
      category: "KreaNoLora",
      groupId: "1"
    });
  });

  it("ignores trailing underscores after the id", () => {
    expect(parseImageFilename("both_00001_.png")).toMatchObject({
      category: "both",
      groupId: "00001"
    });
    expect(parseImageFilename("tenhance_00001_.png")).toMatchObject({
      category: "tenhance",
      groupId: "00001"
    });
    expect(parseImageFilename("Krea_Lora_A_15_.webp")).toMatchObject({
      category: "Krea_Lora_A",
      groupId: "15"
    });
  });

  it("rejects unsupported or malformed files", () => {
    expect(parseImageFilename("image.gif")).toBeNull();
    expect(parseImageFilename("image.png")).toBeNull();
    expect(parseImageFilename("_1.png")).toBeNull();
    expect(parseImageFilename("Krea_.png")).toBeNull();
  });
});

describe("compareGroupIds", () => {
  it("sorts numeric ids numerically", () => {
    expect(["11", "1", "10", "2"].sort(compareGroupIds)).toEqual(["1", "2", "10", "11"]);
  });

  it("keeps numeric ids before text ids and sorts text naturally", () => {
    expect(["b2", "1", "a10", "a2"].sort(compareGroupIds)).toEqual(["1", "a2", "a10", "b2"]);
  });
});

describe("scanImageFolder", () => {
  it("adds a cache buster to image urls for every scan", async () => {
    const folder = await fs.mkdtemp(path.join(os.tmpdir(), "image-version-comparer-"));
    try {
      await fs.writeFile(path.join(folder, "both_00001_.png"), "");
      await fs.writeFile(path.join(folder, "tenhance_00001_.png"), "");
      await fs.writeFile(path.join(folder, "both_00001_.txt"), "Prompt text");

      const firstScan = await scanImageFolder(folder, new Map());
      const secondScan = await scanImageFolder(folder, new Map());

      expect(firstScan.groups[0].images[0].imageUrl).toContain("?v=");
      expect(firstScan.groups[0].images[0].imageUrl).not.toEqual(secondScan.groups[0].images[0].imageUrl);
      expect(firstScan.groups[0].images.find((image) => image.category === "both")?.caption).toBe("Prompt text");
      expect(firstScan.stats.ignoredFiles).toBe(0);
    } finally {
      await fs.rm(folder, { recursive: true, force: true });
    }
  });
});
