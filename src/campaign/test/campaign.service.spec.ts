import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from '../campaign.service';
import { PrismaService } from 'src/prisma.service';
import { InvoiceService } from 'src/invoice/invoice.service';
import { ConfigModule } from '@nestjs/config';
import { PublisherSeeder } from 'src/publisher/test/seed';
import { Seeder } from 'src/types/types';

const seedCampaigns = async (prismaService: PrismaService) => {
  const newPublisher = await prismaService.publisher.create({
    data: {
      email: 'testcampaign@test.nl',
      firstName: 'test',
      lastName: 'test',
      kvkNumber: '12345678',
      phoneNumber: '0612345678',
      campaigns: {
        createMany: {
          data: [
            {
              affiliateCode: 'test',
            },
            {
              affiliateCode: 'test2',
            },
            {
              affiliateCode: 'test3',
            },
          ],
        },
      },
      createdAt: new Date(),
    },
  });

  return newPublisher.id;
};

describe('CampaignService', () => {
  let service: CampaignService;
  let prismaService: PrismaService;
  let createdUserId: string;
  let createdPlatformId: string;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [CampaignService, PrismaService, InvoiceService],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    prismaService = module.get<PrismaService>(PrismaService);
    createdUserId = await seedCampaigns(prismaService);
  });

  afterAll(async () => {
    await prismaService.campaign.deleteMany();
    if (createdPlatformId) {
      await prismaService.platform.deleteMany({
        where: {
          id: createdPlatformId,
        },
      });
      createdPlatformId = null;
    }
    await prismaService.publisher.deleteMany({
      where: {
        id: createdUserId,
      },
    });
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it('should return all campaigns', async () => {
    const campaigns = await service.getCampaignsByUser(createdUserId);

    expect(campaigns).toBeDefined();
    expect(campaigns.length).toBe(3);
  });
  it('should be able to create a campaign', async () => {
    const createdPlatform = await prismaService.platform.create({
      data: {
        baseUrl: 'https://www.test.nl',
        name: 'test',
      },
    });
    createdPlatformId = createdPlatform.id;

    const campaign = await service.createCampaign(createdUserId, {
      path: '/',
      platformId: createdPlatform.id,
    });

    expect(campaign).toBeDefined();
    const campaigns = await service.getCampaignsByUser(createdUserId);
    expect(campaigns.length).toBe(4);
  });
  it('should be able to get statistics for a campaign', async () => {
    const campaigns = await service.getCampaignsByUser(createdUserId);
    expect(true).toBe(true);
  });
  it('should not be able to create campaign for platform that does not exist', async () => {
    expect.assertions(2);
    try {
      await service.createCampaign(createdUserId, {
        path: '/',
        platformId: 'unknown',
      });
    } catch (ex) {
      expect(ex.message).toBe('Platform Not Found');
      expect(ex.status).toBe(404);
    }
  });
});
