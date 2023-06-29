import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from 'src/prisma.service';
import { InvoiceService } from '../invoice.service';

const createPublishers = async (prismaService: PrismaService) => {
  return await prismaService.$transaction([
    prismaService.publisher.create({
      include: {
        invoices: true,
      },
      data: {
        email: 'publisherOne@mail.nl',
        firstName: 'publisher1',
        lastName: 'publisher1',
        phoneNumber: '0612345678',
        kvkNumber: '12345678',
        invoices: {
          createMany: {
            data: [
              {
                status: 'UPCOMING',
              },
              {
                status: 'PAID',
              },
              {
                status: 'PAID',
              },
              {
                status: 'OPEN',
              },
            ],
          },
        },
      },
    }),
    prismaService.publisher.create({
      include: {
        invoices: true,
      },
      data: {
        email: 'publisherTwo@mail.nl',
        firstName: 'publisher2',
        lastName: 'publisher2',
        phoneNumber: '0612345678',
        kvkNumber: '12345628',
        invoices: {
          createMany: {
            data: [
              {
                status: 'UPCOMING',
              },
              {
                status: 'OPEN',
              },
              {
                status: 'PAID',
              },
              {
                status: 'OPEN',
              },
              {
                status: 'PAID',
              },
            ],
          },
        },
      },
    }),
  ]);
};

const createPublisherWithPaiableInvoice = async (
  prismaService: PrismaService,
) => {
  return await prismaService.$transaction([
    prismaService.publisher.create({
      include: {
        invoices: {
          include: {
            invoiceLines: true,
          },
        },
        campaigns: true,
      },
      data: {
        email: 'publisherThree@mail.com',
        firstName: 'publisher3',
        lastName: 'publisher3',
        phoneNumber: '0612345678',
        kvkNumber: '51623125',
        campaigns: {
          createMany: {
            data: [
              {
                affiliateCode: 'affiliateCode3',
                id: 'campaign3id',
              },
              {
                affiliateCode: 'affiliateCode4',
                id: 'campaign4id',
              },
            ],
          },
        },
        invoices: {
          create: {
            status: 'UPCOMING',
            invoiceLines: {
              createMany: {
                data: [
                  {
                    amount: 18,
                    campaignId: 'campaign3id',
                  },
                  {
                    amount: 2,
                    campaignId: 'campaign4id',
                  },
                ],
              },
            },
          },
        },
      },
    }),
    prismaService.publisher.create({
      include: {
        invoices: {
          include: {
            invoiceLines: true,
          },
        },
        campaigns: true,
      },
      data: {
        email: 'publisherFour@mail.com',
        firstName: 'publisher4',
        lastName: 'publisher4',
        phoneNumber: '0612345678',
        kvkNumber: '51243125',
        campaigns: {
          createMany: {
            data: [
              {
                affiliateCode: 'affiliateCode5',
                id: 'campaign5id',
              },
              {
                affiliateCode: 'affiliateCode6',
                id: 'campaign6id',
              },
            ],
          },
        },
        invoices: {
          create: {
            status: 'UPCOMING',
            invoiceLines: {
              createMany: {
                data: [
                  {
                    amount: 1,
                    campaignId: 'campaign5id',
                  },
                  {
                    amount: 1,
                    campaignId: 'campaign6id',
                  },
                ],
              },
            },
          },
        },
      },
    }),
  ]);
};

const cleanup = async (prismaService: PrismaService) => {
  await prismaService.invoice.deleteMany();
  await prismaService.invoiceLine.deleteMany();
  await prismaService.campaign.deleteMany();
  await prismaService.publisher.deleteMany();
};

describe('InvoiceService', () => {
  let service: InvoiceService;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule],
      providers: [InvoiceService, PrismaService],
    }).compile();

    service = module.get<InvoiceService>(InvoiceService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await cleanup(prismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get all invoices', async () => {
    const [publisherOne, publisherTwo] = await createPublishers(prismaService);
    let invoices = await service.getInvoices();

    expect(invoices).toBeDefined();
    expect(invoices.length).toBe(9);

    invoices = await service.getInvoices({
      publisherId: publisherOne.id,
    });

    expect(invoices).toBeDefined();
    expect(invoices.length).toBe(4);

    invoices = await service.getInvoices({
      publisherId: publisherTwo.id,
      status: 'PAID',
    });

    expect(invoices).toBeDefined();
    expect(invoices.length).toBe(2);
  });
  it('should get upcoming invoice', async () => {
    const [publisherOne, _] = await createPublishers(prismaService);

    const invoice = await service.getUpcomingInvoice(publisherOne.id);
    expect(invoice).toBeDefined();
    expect(invoice.status).toBe('UPCOMING');
  });
  it('should be able to set invoice status to paid', async () => {
    const [publisherOne, _] = await createPublishers(prismaService);
    const invoice = await service.getUpcomingInvoice(publisherOne.id);

    await service.setPaid(invoice.id);

    const updatedInvoice = await service.getInvoiceById(invoice.id);

    expect(updatedInvoice).toBeDefined();
    expect(updatedInvoice.status).toBe('PAID');
  });
  it('should update upcoming invoices', async () => {
    const [paiablePublisher, nonPaiablePublisher] =
      await createPublisherWithPaiableInvoice(prismaService);

    await service.updateUpcomingInvoices();

    const paiablePublisherInvoices = await service.getInvoices({
      publisherId: paiablePublisher.id,
    });

    const nonPaiablePublisherInvoices = await service.getInvoices({
      publisherId: nonPaiablePublisher.id,
    });

    expect(paiablePublisherInvoices).toBeDefined();
    expect(paiablePublisherInvoices.length).toBe(2);
    expect(
      paiablePublisherInvoices.find((invoice) => invoice.status === 'OPEN'),
    ).toBeDefined();
    expect(
      paiablePublisherInvoices.find((invoice) => invoice.status === 'UPCOMING'),
    ).toBeDefined();

    expect(nonPaiablePublisherInvoices).toBeDefined();
    expect(nonPaiablePublisherInvoices.length).toBe(1);
    expect(
      nonPaiablePublisherInvoices.find(
        (invoice) => invoice.status === 'UPCOMING',
      ),
    ).toBeDefined();
  });
  it('should get invoice by id', async () => {
    const [publisherOne, _] = await createPublishers(prismaService);

    const foundInvoice = await service.getInvoiceById(
      publisherOne.invoices[0].id,
    );

    expect(foundInvoice).toBeDefined();
    expect(foundInvoice.id).toBe(foundInvoice.id);
  });
});
