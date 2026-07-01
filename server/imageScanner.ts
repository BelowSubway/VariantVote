import fs from "node:fs/promises";
import path from "node:path";
import type { ImageGroup, ImageItem, ScanResponse } from "../shared/types";

const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp"]);

export type ImageRegistry = Map<string, string>;

type ParsedImage = {
  category: string;
  groupId: string;
  filename: string;
  absolutePath: string;
  captionPath?: string;
};

export function parseImageFilename(filename: string): Omit<ParsedImage, "absolutePath"> | null {
  const extension = path.extname(filename).toLowerCase();
  if (!SUPPORTED_EXTENSIONS.has(extension)) {
    return null;
  }

  const baseName = path.basename(filename, path.extname(filename)).replace(/_+$/, "");
  const separatorIndex = baseName.lastIndexOf("_");
  if (separatorIndex <= 0 || separatorIndex === baseName.length - 1) {
    return null;
  }

  const category = baseName.slice(0, separatorIndex).trim();
  const groupId = baseName.slice(separatorIndex + 1).trim();
  if (!category || !groupId) {
    return null;
  }

  return { category, groupId, filename };
}

export function compareGroupIds(left: string, right: string): number {
  const leftNumeric = /^-?\d+$/.test(left);
  const rightNumeric = /^-?\d+$/.test(right);

  if (leftNumeric && rightNumeric) {
    return Number(left) - Number(right);
  }

  if (leftNumeric !== rightNumeric) {
    return leftNumeric ? -1 : 1;
  }

  return left.localeCompare(right, undefined, { numeric: true, sensitivity: "base" });
}

async function readOptionalCaption(captionPath: string | undefined): Promise<string | undefined> {
  if (!captionPath) {
    return undefined;
  }

  try {
    const text = await fs.readFile(captionPath, "utf8");
    return text.trim() || undefined;
  } catch {
    return undefined;
  }
}

export async function scanImageFolder(folderPath: string, registry: ImageRegistry): Promise<ScanResponse> {
  const resolvedFolder = path.resolve(folderPath);
  const stat = await fs.stat(resolvedFolder);
  if (!stat.isDirectory()) {
    throw new Error("Der angegebene Pfad ist kein Ordner.");
  }

  registry.clear();
  const scanVersion = `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  const entries = await fs.readdir(resolvedFolder, { withFileTypes: true });
  const fileNamesByLowercase = new Map(
    entries.filter((entry) => entry.isFile()).map((entry) => [entry.name.toLowerCase(), entry.name])
  );
  const grouped = new Map<string, ParsedImage[]>();
  const categories = new Set<string>();
  let ignoredFiles = 0;
  let totalImages = 0;

  for (const entry of entries) {
    if (!entry.isFile()) {
      continue;
    }

    if (path.extname(entry.name).toLowerCase() === ".txt") {
      continue;
    }

    const parsed = parseImageFilename(entry.name);
    if (!parsed) {
      ignoredFiles += 1;
      continue;
    }

    totalImages += 1;
    categories.add(parsed.category);

    const absolutePath = path.join(resolvedFolder, entry.name);
    const captionFileName = `${path.basename(entry.name, path.extname(entry.name))}.txt`;
    const matchedCaptionFileName = fileNamesByLowercase.get(captionFileName.toLowerCase());
    const image: ParsedImage = {
      ...parsed,
      absolutePath,
      captionPath: matchedCaptionFileName ? path.join(resolvedFolder, matchedCaptionFileName) : undefined
    };
    const group = grouped.get(parsed.groupId) ?? [];
    group.push(image);
    grouped.set(parsed.groupId, group);
  }

  let skippedSingleImageGroups = 0;
  const groups: ImageGroup[] = [];

  for (const [groupId, images] of grouped) {
    if (images.length < 2) {
      skippedSingleImageGroups += 1;
      continue;
    }

    const mappedImages: ImageItem[] = await Promise.all(
      images.sort((left, right) => left.category.localeCompare(right.category)).map(async (image) => {
        const imageId = `${groupId}:${image.category}:${image.filename}`;
        registry.set(imageId, image.absolutePath);
        const caption = await readOptionalCaption(image.captionPath);

        return {
          id: imageId,
          category: image.category,
          groupId,
          filename: image.filename,
          imageUrl: `/api/images/${encodeURIComponent(imageId)}?v=${encodeURIComponent(scanVersion)}`,
          caption
        };
      })
    );

    groups.push({ id: groupId, images: mappedImages });
  }

  groups.sort((left, right) => compareGroupIds(left.id, right.id));

  return {
    folderPath: resolvedFolder,
    groups,
    stats: {
      totalImages,
      ignoredFiles,
      skippedSingleImageGroups,
      categories: Array.from(categories).sort((left, right) => left.localeCompare(right))
    }
  };
}
