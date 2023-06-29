import { Injectable } from '@nestjs/common';
import { ActionType, Campaign, CampaignAction } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma.service';
import {
  CampaignStats,
  PaginationArgs,
  PublisherWithCampaignsAndActions,
  PublisherWithStats,
} from 'src/types/types';
import { InvitePublisherOpts } from './dto/request/InvitePublisher.dto';

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

  async getPublisher(
    id: string,
    statOptions: StatOptions = {
      year: null,
    },
  ): Promise<PublisherWithStats> {
    const publisher = await this.prisma.publisher.findUnique({
      where: {
        id,
      },
      include: {
        campaigns: {
          include: {
            campaignActions: true,
          },
        },
      },
    });

    const publisherStats = await this.getPublisherStats(publisher, statOptions);

    delete publisher.hashedRefreshToken;

    return { ...publisher, ...publisherStats };
  }

  /**
   *
   * @param publisherId
   * @param opts
   * @returns All stats for a publisher
   */
  async getPublisherStats(
    publisher: string | PublisherWithCampaignsAndActions,
    opts?: StatOptions,
  ): Promise<CampaignStats> {
    let fullPublisher: PublisherWithCampaignsAndActions;
    if (typeof publisher === 'string') {
      fullPublisher = await this.prisma.publisher.findUnique({
        where: {
          id: publisher,
        },
        include: {
          campaigns: {
            include: {
              campaignActions: true,
            },
          },
        },
      });
    } else {
      fullPublisher = publisher;
    }

    const clicksAmount = this.getAllStatsFromCampaigns(
      'CLICK',
      fullPublisher.campaigns,
      {
        year: opts.year,
      },
    );
    const leadsAmount = this.getAllStatsFromCampaigns(
      'LEAD',
      fullPublisher.campaigns,
      {
        year: opts.year,
      },
    );

    /**
     * Get statistics for opts.year based on each month. We need to get an array of 12 elements where each element is the amount of clicks for that month.
     */
    return {
      clicksAmount,
      leadsAmount,
      stats: [
        {
          type: 'CLICK',
          dataset: this.getMonthlyStats(
            'CLICK',
            fullPublisher.campaigns,
            opts.year,
          ),
        },
        {
          type: 'LEAD',
          dataset: this.getMonthlyStats(
            'LEAD',
            fullPublisher.campaigns,
            opts.year,
          ),
        },
      ],
    };
  }

  async getById(userId: string) {
    return this.prisma.publisher.findUnique({
      where: {
        id: userId,
      },
    });
  }

  async getIfRefreshTokenMatches(userId: string, refreshToken: string) {
    const user = await this.getById(userId);
    const match = await bcrypt.compare(refreshToken, user.hashedRefreshToken);

    if (match) {
      return user;
    }

    return null;
  }

  async invitePublisher(opts: InvitePublisherOpts) {
    await this.prisma.publisher.create({
      include: {
        invoices: true,
      },
      data: {
        email: opts.email,
        firstName: opts.firstName,
        lastName: opts.lastName,
        phoneNumber: opts.phoneNumber,
        kvkNumber: opts.kvkNumber,
        invoices: {
          create: {
            status: 'UPCOMING',
          },
        },
      },
    });

    // TODO: Send email to publisher
    console.log(
      'Sending email to publisher',
      opts.email,
      ' that he is invited',
    );
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
      action.firedAt.getMonth() === date.month - 1;
    const yearCheck = (action: CampaignAction) =>
      action.firedAt.getFullYear() === date.year;

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
}

export type StatOptions = {
  year: number;
};

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
