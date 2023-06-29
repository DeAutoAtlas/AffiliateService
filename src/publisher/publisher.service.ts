import { Injectable } from '@nestjs/common';
import { ActionType } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { CampaignService } from 'src/campaign/campaign.service';
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
  constructor(
    private prisma: PrismaService,
    private campaignService: CampaignService,
  ) {}

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
      const clicksAmount = this.campaignService.getAllStatsFromCampaigns(
        'CLICK',
        publisher.campaigns,
      );
      const leadsAmount = this.campaignService.getAllStatsFromCampaigns(
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

    const clicksAmount = this.campaignService.getAllStatsFromCampaigns(
      'CLICK',
      fullPublisher.campaigns,
      {
        year: opts.year,
      },
    );
    const leadsAmount = this.campaignService.getAllStatsFromCampaigns(
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
          dataset: this.campaignService.getMonthlyStats(
            'CLICK',
            fullPublisher.campaigns,
            opts.year,
          ),
        },
        {
          type: 'LEAD',
          dataset: this.campaignService.getMonthlyStats(
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
