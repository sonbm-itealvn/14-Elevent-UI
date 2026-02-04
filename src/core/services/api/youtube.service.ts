import HttpService from './http.service';

export interface YoutubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  publishedAt: string;
}

class YoutubeService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async getLatest(): Promise<YoutubeVideo[]> {
    // Endpoint này trả về mảng thuần, không bọc trong BaseResponse
    const response = await this.httpService.getThirdParty<YoutubeVideo[]>(
      '/api/youtube/latest'
    );
    return Array.isArray(response) ? response : [];
  }
}

export default new YoutubeService();


