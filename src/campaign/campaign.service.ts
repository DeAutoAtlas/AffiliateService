import { HttpException, Injectable } from '@nestjs/common';
import { CreateCampaignRequestDto } from './dto/request.dto';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

@Injectable()
export class CampaignService {
  constructor(private prisma: PrismaClient) {}

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
}
