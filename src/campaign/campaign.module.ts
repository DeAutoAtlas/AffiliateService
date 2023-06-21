import { Module } from '@nestjs/common';
import { PrismaModule } from 'src/prisma.module';
import { CampaignController } from './campaign.controller';
import { CampaignService } from './campaign.service';
import { InvoiceModule } from 'src/invoice/invoice.module';

@Module({
  providers: [CampaignService],
  controllers: [CampaignController],
  imports: [PrismaModule, InvoiceModule],
})
export class CampaignModule {}
