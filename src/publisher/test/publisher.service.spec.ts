import { Test } from '@nestjs/testing';
import { ActionType } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';
import { Seeder } from 'src/types/types';
import PublisherService from '../publisher.service';
import { PublisherSeeder } from './seed';

describe('PublisherService', () => {
  let publisherService: PublisherService;
  let prismaService: PrismaService;
  let publisherSeeder: Seeder;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PublisherService, PrismaService],
    }).compile();

    publisherService = moduleRef.get<PublisherService>(PublisherService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    publisherSeeder = new PublisherSeeder(prismaService);
  });

  beforeEach(async () => {
    await publisherSeeder.seed();
  });

  afterEach(async () => {
    await publisherSeeder.clear();
  });

  describe('findAll', () => {
    it('should return all publishers', async () => {
      const publishers = await publisherService.getPublishers({
        pagination: {
          page: 1,
          perPage: 1000,
        },
      });

      expect(publishers).toBeDefined();
      expect(publishers.length).toBe(100);
    });
    it('should return an array of publishers', async () => {
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
      const res = await prismaService.publisher.create({
        include: {
          campaigns: {
            include: {
              campaignActions: true,
            },
          },
        },
        data: {
          firstName: 'publisher1',
          lastName: 'publisher1',
          kvkNumber: '12345678',
          phoneNumber: '0612345678',
          email: 'publisher1@mail.com',
          campaigns: {
            create: {
              affiliateCode: 'affiliateCode1',
              campaignActions: {
                createMany: {
                  data: [
                    {
                      action: ActionType.CLICK,
                      firedAt: new Date(2020, 0, 1),
                    },
                    {
                      action: ActionType.LEAD,
                      firedAt: new Date(2020, 0, 2),
                    },
                    {
                      action: ActionType.LEAD,
                      firedAt: new Date(2020, 0, 2),
                    },
                    {
                      action: ActionType.LEAD,
                      firedAt: new Date(2020, 11, 2),
                    },
                    {
                      action: ActionType.CLICK,
                      firedAt: new Date(2020, 3, 25),
                    },
                  ],
                },
              },
            },
          },
        },
      });

      const publisherFromService = await publisherService.getPublisher(res.id);

      const clickStats = publisherFromService.stats.find(
        (stat) => stat.type === ActionType.CLICK,
      );
      const leadStats = publisherFromService.stats.find(
        (stat) => stat.type === ActionType.LEAD,
      );

      // act
      const expectedTotalClicks = 2;
      const expectedTotalLeads = 3;

      // assert
      expect(publisherFromService).toBeDefined();
      expect(publisherFromService.clicksAmount).toBe(expectedTotalClicks);
      expect(publisherFromService.leadsAmount).toBe(expectedTotalLeads);
      expect(publisherFromService.stats.length).toBe(2);
      expect(clickStats).toBeDefined();
      expect(leadStats).toBeDefined();
      expect(clickStats.dataset.length).toBe(12);
      expect(leadStats.dataset.length).toBe(12);
      expect(clickStats.dataset).toEqual([1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0]);
      expect(leadStats.dataset).toEqual([2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]);

      // cleanup
      await prismaService.publisher.delete({
        where: {
          id: res.id,
        },
      });
    });
    it.each([
      [
        undefined,
        {
          clickAmount: 2,
          leadAmount: 4,
          clickDataSet: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          leadDataSet: [3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        },
      ],
      [
        2020,
        {
          clickAmount: 1,
          leadAmount: 3,
          clickDataSet: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          leadDataSet: [2, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        },
      ],
      [
        2021,
        {
          clickAmount: 1,
          leadAmount: 1,
          clickDataSet: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
          leadDataSet: [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        },
      ],
    ])('should return correct stats based on years', async (year, amount) => {
      const res = await prismaService.publisher.create({
        include: {
          campaigns: {
            include: {
              campaignActions: true,
            },
          },
        },
        data: {
          firstName: 'publisher1',
          lastName: 'publisher1',
          kvkNumber: '12345678',
          phoneNumber: '0612345678',
          email: 'publisher1@publisher.nl',
          campaigns: {
            create: {
              affiliateCode: 'affiliateCode1',
              campaignActions: {
                createMany: {
                  data: [
                    {
                      action: ActionType.CLICK,
                      firedAt: new Date(2020, 0, 1),
                    },
                    {
                      action: ActionType.LEAD,
                      firedAt: new Date(2020, 0, 2),
                    },
                    {
                      action: ActionType.LEAD,
                      firedAt: new Date(2020, 0, 2),
                    },
                    {
                      action: ActionType.LEAD,
                      firedAt: new Date(2020, 11, 31),
                    },
                    {
                      action: ActionType.CLICK,
                      firedAt: new Date(2021, 0, 1),
                    },
                    {
                      action: ActionType.LEAD,
                      firedAt: new Date(2021, 0, 2),
                    },
                  ],
                },
              },
            },
          },
        },
      });

      const publisher = await publisherService.getPublisherStats(res.id, {
        year,
      });

      expect(publisher).toBeDefined();
      expect(publisher.stats.length).toBe(2);
      expect(publisher.clicksAmount).toBe(amount.clickAmount);
      expect(publisher.leadsAmount).toBe(amount.leadAmount);
      const clickStats = publisher.stats.find(
        (stat) => stat.type === ActionType.CLICK,
      );
      const leadStats = publisher.stats.find(
        (stat) => stat.type === ActionType.LEAD,
      );
      expect(clickStats).toBeDefined();
      expect(leadStats).toBeDefined();
      expect(clickStats.dataset).toEqual(amount.clickDataSet);
      expect(leadStats.dataset).toEqual(amount.leadDataSet);

      await prismaService.publisher.delete({
        where: {
          id: res.id,
        },
      });
    });
  });
});
