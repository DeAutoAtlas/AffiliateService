import { Test, TestingModule } from '@nestjs/testing';
import { PlatformService } from '../platform.service';
import { PrismaService } from 'src/prisma.service';
import { PrismaModule } from 'src/prisma.module';

describe('PlatformService', () => {
  let service: PlatformService;
  let prismaService: PrismaService;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule],
      providers: [PlatformService, PrismaService],
    }).compile();

    service = module.get<PlatformService>(PlatformService);
    prismaService = module.get<PrismaService>(PrismaService);

    await prismaService.platform.createMany({
      data: [
        {
          baseUrl: 'https://www.autoatlas.nl',
          name: 'Auto Atlas',
        },
        {
          baseUrl: 'https://www.fietsatlas.nl',
          name: 'Fiets Atlas',
        },
      ],
    });
  });

  afterAll(async () => {
    await prismaService.platform.deleteMany();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return all platforms', async () => {
    const platforms = await service.getPlatforms();

    expect(platforms).toBeDefined();
    expect(platforms.length).toBe(2);
    expect(platforms[0].name).toBe('Auto Atlas');
    expect(platforms[1].name).toBe('Fiets Atlas');
  });
  it('should be able to create a platform', async () => {
    const createdPlatform = await service.createPlatform({
      name: 'Test Atlas',
      baseUrl: 'https://www.testatlas.nl',
    });

    const allPlatforms = await service.getPlatforms();

    expect(createdPlatform).toBeDefined();
    expect(createdPlatform.name).toBe('Test Atlas');
    expect(createdPlatform.baseUrl).toBe('https://www.testatlas.nl');

    expect(allPlatforms).toBeDefined();
    expect(allPlatforms.length).toBe(3);
    expect(allPlatforms[2].name).toBe('Test Atlas');
    expect(allPlatforms[2].baseUrl).toBe('https://www.testatlas.nl');
  });
});
