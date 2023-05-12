import { Injectable } from '@nestjs/common';
import { ActionType, Campaign, CampaignAction } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { PaginationArgs } from 'src/types/types';

@Injectable()
export default class PublisherService {
  constructor(private prisma: PrismaService) {}

  async getPublishers(opts: GetPublisherOpts): Promise<SmallPublisherDto[]> {
    const publishers = await this.prisma.publisher.findMany({
      take: opts.pagination.perPage,
      skip: (opts.pagination.page - 1) * opts.pagination.perPage,
      include: {
        campaigns: {
          include: {
            campaignActions: true,
          },
        },
      },
    });

    return publishers.map((publisher) => {
      const clicksAmount = this.getAllStatsFromCampaigns(
        'CLICK',
        publisher.campaigns,
      );
      const leadsAmount = this.getAllStatsFromCampaigns(
        'LEAD',
        publisher.campaigns,
      );

      return {
        id: publisher.id,
        email: publisher.email,
        clicksAmount,
        leadsAmount,
      };
    });
  }

  async getPublisher(id: string) {
    const publisher = await this.prisma.publisher.findUnique({
      where: {
        id,
      },
    });

    return publisher;
  }

  /**
   *
   * @param publisherId
   * @param opts
   * @returns All stats for a publisher
   */
  async getPublisherStats(
    publisherId: string,
    opts: GetPublisherStatsOpts,
  ): Promise<{
    clicksAmount: number;
    leadsAmount: number;
    stats: { type: string; dataset: number[] }[];
  }> {
    const publisher = await this.prisma.publisher.findUnique({
      where: {
        id: publisherId,
      },
      include: {
        campaigns: {
          include: {
            campaignActions: true,
          },
        },
      },
    });

    const clicksAmount = this.getAllStatsFromCampaigns(
      'CLICK',
      publisher.campaigns,
    );
    const leadsAmount = this.getAllStatsFromCampaigns(
      'LEAD',
      publisher.campaigns,
    );

    /**
     * Get statistics for opts.year based on each month. We need to get an array of 12 elements where each element is the amount of clicks for that month.
     */
    return {
      clicksAmount,
      leadsAmount,
      stats: [
        {
          type: 'clicks',
          dataset: this.getMonthlyStats('CLICK', publisher.campaigns),
        },
        {
          type: 'leads',
          dataset: this.getMonthlyStats('LEAD', publisher.campaigns),
        },
      ],
    };
  }

  getMonthlyStats(
    actionType: ActionType,
    campaigns: (Campaign & {
      campaignActions: CampaignAction[];
    })[],
  ) {
    const stats: number[] = [];
    for (let month = 1; month <= 12; month++) {
      const monthClicks = this.getAllStatsFromCampaigns(
        actionType,
        campaigns,
        month,
      );
      stats.push(monthClicks);
    }
    return stats;
  }

  getAllStatsFromCampaigns(
    actionType: ActionType,
    campaigns: (Campaign & { campaignActions: CampaignAction[] })[],
    month: number = undefined,
  ) {
    let amount = 0;

    for (const campaign of campaigns) {
      if (month) {
        amount += campaign.campaignActions.filter(
          (action) =>
            action.action === actionType &&
            action.firedAt.getMonth() === month - 1,
        ).length;
        continue;
      }

      amount += campaign.campaignActions.filter(
        (action) => action.action === actionType,
      ).length;
    }

    return amount;
  }
}

export type GetPublisherOpts = {
  pagination: PaginationArgs;
};

export type GetPublisherStatsOpts = {
  year: number;
  actionType: ActionType;
};

export type SmallPublisherDto = {
  id: string;
  email: string;
  clicksAmount: number;
  leadsAmount: number;
};
