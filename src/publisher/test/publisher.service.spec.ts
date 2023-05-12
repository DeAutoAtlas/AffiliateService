import { Test } from '@nestjs/testing';
import PublisherService from '../publisher.service';
import { PrismaService } from 'src/prisma.service';
import { seed } from './seed';

describe('PublisherService', () => {
  let publisherService: PublisherService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PublisherService, PrismaService],
    }).compile();

    publisherService = moduleRef.get<PublisherService>(PublisherService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  afterAll(async () => {
    await prismaService.campaignAction.deleteMany();
    await prismaService.campaign.deleteMany();
    await prismaService.platform.deleteMany();
    await prismaService.publisher.deleteMany();
  });

  describe('findAll', () => {
    it('should return an array of publishers', async () => {
      await seed(prismaService);
      const publishers = await publisherService.getPublishers({
        pagination: {
          page: 1,
          perPage: 10,
        },
      });

      expect(publishers).toBeDefined();
      expect(publishers.length).toBe(10);
    });
    it('should return empty array if page is out of bounds', async () => {
      const publishers = await publisherService.getPublishers({
        pagination: {
          page: 11,
          perPage: 10,
        },
      });

      expect(publishers).toBeDefined();
      expect(publishers.length).toBe(0);
    });
    it('should return partial data if page is partially out of bounds', async () => {
      const publishers = await publisherService.getPublishers({
        pagination: {
          page: 13,
          perPage: 8,
        },
      });

      expect(publishers).toBeDefined();
      expect(publishers.length).toBe(4);
    });
    it('should return correct stats', async () => {
      // arrange
      const publishers = await publisherService.getPublishers({
        pagination: {
          page: 1,
          perPage: 1,
        },
      });
      const publisherFromService = publishers[0];
      const publisherFromDb = await prismaService.publisher.findUnique({
        where: {
          id: publisherFromService.id,
        },
        include: {
          campaigns: {
            include: {
              campaignActions: true,
            },
          },
        },
      });

      // act
      const expectedTotalClicks = publisherFromDb.campaigns.reduce(
        (acc, campaign) => {
          return (
            acc +
            campaign.campaignActions.reduce((acc, campaignAction) => {
              return acc + (campaignAction.action === 'CLICK' ? 1 : 0);
            }, 0)
          );
        },
        0,
      );
      const expectedTotalLeads = publisherFromDb.campaigns.reduce(
        (acc, campaign) => {
          return (
            acc +
            campaign.campaignActions.reduce((acc, campaignAction) => {
              return acc + (campaignAction.action === 'LEAD' ? 1 : 0);
            }, 0)
          );
        },
        0,
      );

      console.log(expectedTotalClicks, expectedTotalLeads);

      // assert
      expect(publishers).toBeDefined();
      expect(publisherFromService.clicksAmount).toBe(expectedTotalClicks);
      expect(publisherFromService.leadsAmount).toBe(expectedTotalLeads);
    });
  });
});
