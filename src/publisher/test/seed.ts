import { PrismaService } from 'src/prisma.service';
import { faker } from '@faker-js/faker';
import { Campaign, CampaignAction, Publisher } from '@prisma/client';

export const seed = async (prismaService: PrismaService) => {
  await seedPlatforms(prismaService);
  await seedPublishers(prismaService, 100);
  await seedCampaigns(prismaService);
  await seedCampaignActions(prismaService);
};

const seedPublishers = async (prismaService: PrismaService, amount: number) => {
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
    });
  }

  await prismaService.publisher.createMany({
    data: publishers,
  });
};

const seedPlatforms = async (prismaService: PrismaService) => {
  await prismaService.platform.createMany({
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
};

const seedCampaigns = async (prismaService: PrismaService) => {
  const publishers = await prismaService.publisher.findMany({
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
    await prismaService.campaign.createMany({
      data: campaigns,
    });
  }
};

const seedCampaignActions = async (prismaService: PrismaService) => {
  const campaigns = await prismaService.campaign.findMany();

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
    await prismaService.campaignAction.createMany({
      data: actions,
    });
  }
};
