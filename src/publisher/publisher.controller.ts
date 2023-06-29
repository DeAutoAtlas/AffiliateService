import { Body, Controller, Get, Param, Post, Query, Req } from '@nestjs/common';
import { AuthWithRole } from 'src/helpers/decorators';
import { InvitePublisherDto } from './dto/request/InvitePublisher.dto';
import { GetPublisherByIdQuery } from './dto/request/query.dto';
import PublisherService from './publisher.service';

@Controller('publisher')
export default class PublisherController {
  constructor(private publisherService: PublisherService) {}

  @Get()
  @AuthWithRole('admin', 'publisher')
  async getPublisher(
    @Req() req,
    @Query('page') page: number,
    @Query('perPage') perPage: number,
  ) {
    if (req.user.role === 'publisher') {
      return await this.publisherService.getPublisher(req.user.sub);
    }

    page = page || 1;
    perPage = perPage || 10;

    return {
      data: await this.publisherService.getPublishers({
        pagination: {
          page,
          perPage,
        },
      }),
      page,
      perPage,
    };
  }

  @Get('/self')
  @AuthWithRole('publisher')
  async getSelfPublisher(@Req() req) {
    return await this.publisherService.getPublisher(req.user.sub);
  }

  @Get('/:id')
  @AuthWithRole('admin')
  async getPublisherById(
    @Param('id') id: string,
    @Query() query: GetPublisherByIdQuery,
  ) {
    return await this.publisherService.getPublisher(id, {
      year: query.year,
    });
  }

  @Post()
  @AuthWithRole('admin')
  invitePublisher(@Body() body: InvitePublisherDto) {
    return this.publisherService.invitePublisher(body);
  }
}
