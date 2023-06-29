import { HttpException, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from 'src/prisma.service';
import { CreateCampaignRequestDto } from './dto/request.dto';
import { ActionType, Campaign, CampaignAction } from '@prisma/client';
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

  async getCampaignById(id: string, statYear?: number) {
    const campaign = await this.prisma.campaign.findFirst({
      where: {
        id,
      },
      include: {
        campaignActions: true,
      },
    });

    if (!campaign) {
      throw new HttpException('Campaign Not Found', 404);
    }

    const clickAmount = this._getCampaignStat(
      campaign,
      ActionType.CLICK,
      statYear,
    );
    const leadAmount = this._getCampaignStat(
      campaign,
      ActionType.LEAD,
      statYear,
    );

    const stats = [
      {
        type: 'CLICK',
        dataset: this.getMonthlyStats('CLICK', [campaign], statYear),
      },
      {
        type: 'LEAD',
        dataset: this.getMonthlyStats('LEAD', [campaign], statYear),
      },
    ];

    return {
      ...campaign,
      clickAmount,
      leadAmount,
      stats,
    };
  }

  private _getCampaignStat(
    campaign: Campaign & { campaignActions: CampaignAction[] },
    actionType: ActionType,
    statYear?: number,
  ) {
    return campaign.campaignActions.reduce((acc, action) => {
      if (
        action.action === actionType &&
        (!statYear || action.firedAt.getFullYear() == statYear)
      ) {
        return acc + 1;
      }
      return acc;
    }, 0);
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

  getMonthlyStats(
    actionType: ActionType,
    campaigns: (Campaign & {
      campaignActions: CampaignAction[];
    })[],
    year?: number,
  ) {
    const stats: number[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthClicks = this.getAllStatsFromCampaigns(actionType, campaigns, {
        year,
        month,
      });
      stats.push(monthClicks);
    }
    return stats;
  }

  getAllStatsFromCampaigns(
    actionType: ActionType,
    campaigns: (Campaign & { campaignActions: CampaignAction[] })[],
    date?: {
      year?: number;
      month?: number;
    },
  ) {
    let amount = 0;

    for (const campaign of campaigns) {
      amount += campaign.campaignActions.filter(
        this.actionFilter(actionType, date),
      ).length;
    }

    return amount;
  }

  actionFilter(
    actionType: ActionType,
    date?: {
      year?: number;
      month?: number;
    },
  ) {
    if (!date || (!date.month && !date.year))
      return (action: CampaignAction) => action.action === actionType;
    const monthCheck = (action: CampaignAction) =>
      action.firedAt.getMonth() == date.month - 1;
    const yearCheck = (action: CampaignAction) =>
      action.firedAt.getFullYear() == date.year;

    if (date.month && date.year) {
      return (action: CampaignAction) =>
        action.action === actionType && monthCheck(action) && yearCheck(action);
    } else if (date.year) {
      return (action: CampaignAction) =>
        action.action === actionType && yearCheck(action);
    }
    return (action: CampaignAction) =>
      action.action === actionType && monthCheck(action);
  }

  async getCampaignsByUser(userId: string) {
    return this.prisma.campaign.findMany({
      where: {
        publisherId: userId,
      },
    });
  }
}
