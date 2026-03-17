export type FileType = 'INPUT_AUDIO' | 'OUTPUT_AUDIO';

export interface File {
  id: string;
  url: string;
  type: FileType;
  size: number | null;
  createdAt: string;
  updatedAt: string;
}
