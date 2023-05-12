import { Controller, Get } from '@nestjs/common';
import PublisherService from './publisher.service';

@Controller('publisher')
export default class PublisherController {
  constructor(private publisherService: PublisherService) {}

  @Get()
  async getPublisher() {
    return {
      data: await this.publisherService.getPublishers({
        pagination: {
          page: 1,
          perPage: 10,
        },
      }),
      page: 1,
      perPage: 10,
    };
  }
}
