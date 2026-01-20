import HttpService from './http.service';

export interface ContactRequest {
  name: string;
  email: string;
  phone?: string;
  title: string;
  subject: string;
  content: string;
}

class ContactService {
  private httpService: HttpService;

  constructor() {
    this.httpService = new HttpService();
  }

  async sendContact(data: ContactRequest): Promise<void> {
    await this.httpService.post<void>('/api/contact', data);
  }
}

export default new ContactService();


