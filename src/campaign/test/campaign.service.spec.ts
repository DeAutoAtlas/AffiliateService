import { Test, TestingModule } from '@nestjs/testing';
import { CampaignService } from '../campaign.service';
import { PrismaService } from 'src/prisma.service';

describe('CampaignService', () => {
  let service: CampaignService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CampaignService, PrismaService],
    }).compile();

    service = module.get<CampaignService>(CampaignService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  // beforeAll(async () => {
  //   prismaService.campaign.createMany({
  //     data: [
  //       {
  //         j

  //       }

  //     ]
  //   })
  // })

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  it.todo('should return all campaigns');
  it.todo('should be able to create a campaign');
  it.todo('should be able to get statistics for a campaign');
  it.todo(
    'should not be able to create campaign for platform that does not exist',
  );
});
