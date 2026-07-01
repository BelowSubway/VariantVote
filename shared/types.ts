export type ImageItem = {
  id: string;
  category: string;
  groupId: string;
  filename: string;
  imageUrl: string;
  caption?: string;
};

export type ImageGroup = {
  id: string;
  images: ImageItem[];
};

export type ScanStats = {
  totalImages: number;
  ignoredFiles: number;
  skippedSingleImageGroups: number;
  categories: string[];
};

export type ScanResponse = {
  folderPath: string;
  groups: ImageGroup[];
  stats: ScanStats;
};

export type Vote = {
  groupId: string;
  imageId: string;
  category: string;
};
