import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';

@Module({
  providers: [CampaignService],
  controllers: [CampaignController],
  imports: [PrismaModule],
})
export class CampaignModule {}
