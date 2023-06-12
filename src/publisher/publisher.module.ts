import { Module } from '@nestjs/common';
import PublisherController from './publisher.controller';
import PublisherService from './publisher.service';

@Module({
  controllers: [PublisherController],
  providers: [PublisherService],
  imports: [],
})
export class PublisherModule {}
