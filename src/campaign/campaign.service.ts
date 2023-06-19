import { HttpException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { CreateCampaignRequestDto } from './dto/request.dto';
import { ActionType } from '@prisma/client';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaService) {}

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
