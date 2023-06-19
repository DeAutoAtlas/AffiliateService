import { PrismaService } from 'src/prisma.service';
import { faker } from '@faker-js/faker';
import { Campaign, CampaignAction, Publisher } from '@prisma/client';
import { Seeder } from 'src/types/types';

export class PublisherSeeder implements Seeder {
  constructor(private prismaService: PrismaService) {}

  async seedPublishers(amount: number) {
    const publishers: Publisher[] = [];
    for (let i = 0; i < amount; i++) {
      const createdAtDate = faker.date.between('2021-01-01', new Date());
      const updatedAtDate = faker.helpers.maybe(
        () => faker.date.between(createdAtDate, new Date()),
        {
          probability: 0.2,
        },
      );

      publishers.push({
        email: faker.internet.email(),
        id: faker.datatype.uuid(),
        createdAt: createdAtDate,
        updatedAt: updatedAtDate,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
        phoneNumber: faker.phone.number('+31 6 #### ####'),
        kvkNumber: faker.datatype
          .number({ min: 10000000, max: 99999999 })
          .toString(),
        hashedRefreshToken: null,
      });
    }

    await this.prismaService.publisher.createMany({
      data: publishers,
    });
  }

  async seedPlatforms() {
    await this.prismaService.platform.createMany({
      skipDuplicates: true,
      data: [
        {
          name: 'Auto Atlas',
          baseUrl: 'https://autoatlas.nl',
        },
        {
          name: 'Fiets Atlas',
          baseUrl: 'https://fietsatlas.nl',
        },
        {
          name: 'Boot Atlas',
          baseUrl: 'https://bootatlas.nl',
        },
      ],
    });
  }

  async seedCampaigns() {
    const publishers = await this.prismaService.publisher.findMany({
      select: {
        id: true,
      },
    });

    for (const publisher of publishers) {
      const campaigns: Campaign[] = [];
      for (let i = 0; i < faker.datatype.number({ min: 0, max: 10 }); i++) {
        campaigns.push({
          id: faker.datatype.uuid(),
          publisherId: publisher.id,
          affiliateCode: faker.datatype.uuid(),
        });
      }
      await this.prismaService.campaign.createMany({
        data: campaigns,
      });
    }
  }

  async seedCampaignActions() {
    const campaigns = await this.prismaService.campaign.findMany();

    for (const campaign of campaigns) {
      const actions: CampaignAction[] = [];
      for (let i = 0; i < faker.datatype.number({ max: 200 }); i++) {
        actions.push({
          id: faker.datatype.uuid(),
          campaignId: campaign.id,
          action: faker.helpers.arrayElement(['CLICK', 'LEAD']),
          firedAt: faker.date.between('2021-01-01', new Date()),
        });
      }
      await this.prismaService.campaignAction.createMany({
        data: actions,
      });
    }
  }

  async seed() {
    await this.seedPlatforms();
    await this.seedPublishers(100);
    await this.seedCampaigns();
    await this.seedCampaignActions();
  }

  async clear() {
    await this.prismaService.twoFactorTokens.deleteMany();
    await this.prismaService.campaignAction.deleteMany();
    await this.prismaService.campaign.deleteMany();
    await this.prismaService.platform.deleteMany();
    await this.prismaService.publisher.deleteMany();
  }
}
