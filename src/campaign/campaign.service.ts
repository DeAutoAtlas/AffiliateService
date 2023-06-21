import { HttpException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { CreateCampaignRequestDto } from './dto/request.dto';
import { ActionType } from '@prisma/client';
import { InvoiceService } from 'src/invoice/invoice.service';

@Injectable()
export class CampaignService {
  constructor(
    private prisma: PrismaService,
    private invoiceService: InvoiceService,
  ) {}

  /**
   * Creates a campaign for a publisher
   * @param userId Publisher Id
   * @param createCampaignDto Campaign data
   * @returns Created campaign id
   */
  async createCampaign(
    userId: string,
    createCampaignDto: CreateCampaignRequestDto,
  ): Promise<string> {
    const platform = await this.prisma.platform.findUnique({
      where: {
        id: createCampaignDto.platformId,
      },
    });

    if (!platform) {
      throw new HttpException('Platform Not Found', 404);
    }

    const campaign = await this.prisma.campaign.create({
      data: {
        affiliateCode: crypto.randomBytes(12).toString('hex'),
        publisherId: userId,
      },
    });

    return campaign.id;
  }

  async createCampaignAction(action: ActionType, affiliateId: string) {
    console.log('Finding campaign with affiliate code', affiliateId);
    const campaign = await this.prisma.campaign.findFirst({
      include: {
        publisher: true,
      },
      where: {
        affiliateCode: affiliateId,
      },
    });

    console.log('Found campaign:', campaign);

    if (!campaign) {
      throw new HttpException('Campaign Not Found', 404);
    }

    await this.prisma.campaignAction.create({
      data: {
        action,
        campaignId: campaign.id,
        firedAt: new Date(),
      },
    });

    if (action === ActionType.LEAD) {
      const upcomingInvoice = await this.invoiceService.getUpcomingInvoice(
        campaign.publisherId,
      );
      const campaignLine = upcomingInvoice.invoiceLines.find(
        (line) => line.campaignId === campaign.id,
      );

      if (campaignLine) {
        await this.invoiceService.increaseInvoiceLineAmount(campaignLine.id, 1);
      } else {
        await this.invoiceService.addLineItem(upcomingInvoice.id, {
          amount: 1,
          campaignId: campaign.id,
        });
      }
    }

    return;
  }

  async getCampaignsByUser(userId: string) {
    return this.prisma.campaign.findMany({
      where: {
        publisherId: userId,
      },
    });
  }
}
