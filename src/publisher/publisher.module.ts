import { Module } from '@nestjs/common';
import { CampaignModule } from 'src/campaign/campaign.module';
import { PrismaModule } from 'src/prisma.module';
import PublisherController from './publisher.controller';
import PublisherService from './publisher.service';

@Module({
  controllers: [PublisherController],
  providers: [PublisherService],
  imports: [PrismaModule, CampaignModule],
  exports: [PublisherService],
})
export class PublisherModule {}
