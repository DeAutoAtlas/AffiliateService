import { Test, TestingModule } from '@nestjs/testing';
import { InvoiceService } from '../invoice.service';
import { PrismaService } from 'src/prisma.service';
import { ConfigModule } from '@nestjs/config';

describe('InvoiceService', () => {
  let service: InvoiceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [InvoiceService, PrismaService],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
