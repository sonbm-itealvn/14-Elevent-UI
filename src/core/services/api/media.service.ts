import HttpService from "./http.service";
import type { 
  Media, 
  MediaPageResponse,
  UploadImageResponse 
} from "@/domain/models/media.model";
class MediaService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getMedia(params?: {
    keyword?: string;
    type?: string;
    folder?: string;
    page?: number;
    size?: number;
    sortBy?: string;
    sortDir?: string;
  }): Promise<MediaPageResponse> {
    // Note: API might not have /api/admin/media endpoint
    // Using placeholder for now
    const response = await this.httpService.getPaginated<Media>(
      "/api/admin/media",
      params
    );
    return response;
  }

  async getMediaById(mediaId: number): Promise<Media> {
    const response = await this.httpService.get<Media>(
      `/api/admin/media/${mediaId}`
    );
    return response.data!;
  }

  async uploadImage(file: File, folder?: string): Promise<UploadImageResponse> {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) {
      formData.append('folder', folder);
    }
    const response = await this.httpService.upload<UploadImageResponse>(
      "/api/uploads/image",
      formData
    );
    return response.data!;
  }

  async deleteMedia(mediaId: number): Promise<void> {
    await this.httpService.delete(`/api/admin/media/${mediaId}`);
  }
}

export default new MediaService();

