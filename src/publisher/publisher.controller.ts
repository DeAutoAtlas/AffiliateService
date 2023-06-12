import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import PublisherService from './publisher.service';
import { InvitePublisherDto } from './dto/request/InvitePublisher.dto';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  Max,
  Min,
} from 'class-validator';
import { StatType, UnionToArray } from 'src/types/types';

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

  @Get('/:id')
  async getPublisherById(
    @Param('id') id: string,
    @Query() query: GetPublisherByIdQuery,
  ) {
    const { year = new Date().getFullYear(), statType = 'clicks' } = query;

    return await this.publisherService.getPublisher(id);
  }

  @Post()
  invitePublisher(@Body() body: InvitePublisherDto) {
    return this.publisherService.invitePublisher(body);
  }
}

class GetPublisherByIdQuery {
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year: number;
  @IsOptional()
  @IsIn(['clicks', 'leads', 'ratio'] as UnionToArray<StatType>)
  statType: StatType;
}
