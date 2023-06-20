import { Test } from '@nestjs/testing';
import PublisherService from '../publisher.service';
import { PrismaService } from 'src/prisma.service';
import { PublisherSeeder } from './seed';
import { Seeder } from 'src/types/types';
import { ActionType } from '@prisma/client';
import { ConfigModule, ConfigService } from '@nestjs/config';

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

    await publisherSeeder.clear();
    await publisherSeeder.seed();
  });

  afterAll(async () => {
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
    it.todo('should return correct stats based on years');
  });
});
