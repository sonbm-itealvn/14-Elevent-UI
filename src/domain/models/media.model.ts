export interface Media {
  id: number;
  name: string;
  url: string;
  type: MediaType;
  size?: number;
  mimeType?: string;
  folder?: string;
  width?: number;
  height?: number;
  createdAt?: string;
  updatedAt?: string;
}

export enum MediaType {
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  DOCUMENT = 'DOCUMENT',
  OTHER = 'OTHER',
}

export interface MediaPageResponse {
  content: Media[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface UploadMediaRequest {
  file: File;
  folder?: string;
}

export interface UploadImageResponse {
  url: string;
  folder: string;
  originalFilename: string;
}

