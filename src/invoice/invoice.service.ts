import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class InvoiceService {
  constructor(
    private prismaService: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Cron Job that checks every month if any upcoming invoice status can be updated
   * If the upcoming invoice total price is bigger or equal to the minimum payout amount,
   * the status will be updated to OPEN and a new upcoming invoice will be created.
   */
  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON, {
    timeZone: 'Europe/Amsterdam',
  })
  async updateUpcomingInvoices() {
    const upcomingInvoices = await this.prismaService.invoice.findMany({
      include: {
        invoiceLines: true,
      },
      where: {
        status: InvoiceStatus.UPCOMING,
      },
    });

    const minimumPayoutAmount = await this.configService.get<number>(
      'invoice.minimumPayout',
    );
    const pricePerLead = await this.configService.get<number>(
      'invoice.pricePerLead',
    );

    for (let i = 0; i < upcomingInvoices.length; i++) {
      const upcomingInvoice = upcomingInvoices[i];

      const totalPrice = upcomingInvoice.invoiceLines.reduce((acc, line) => {
        return acc + line.amount * pricePerLead;
      }, 0);

      if (totalPrice < minimumPayoutAmount) {
        continue;
      }

      await this.prismaService.invoice.update({
        where: {
          id: upcomingInvoice.id,
        },
        data: {
          status: InvoiceStatus.OPEN,
        },
      });

      await this.createInvoice({
        publisherId: upcomingInvoice.publisherId,
        status: InvoiceStatus.UPCOMING,
      });
    }
  }

  async getInvoices(options: SearchInvoiceOpts) {
    options.status = options.status || InvoiceStatus.OPEN;
    if (options.publisherId) {
      return this.prismaService.invoice.findMany({
        where: {
          status: options.status || undefined,
          publisherId: options.publisherId,
        },
      });
    }

    return this.prismaService.invoice.findMany({
      where: {
        status: options.status || undefined,
      },
    });
  }

  async createInvoice(options: CreateInvoiceOpts) {
    await this.prismaService.invoice.create({
      data: {
        status: options.status,
        publisherId: options.publisherId,
      },
    });
  }

  async getUpcomingInvoice(publisherId: string) {
    return await this.prismaService.invoice.findFirst({
      include: {
        invoiceLines: true,
      },
      where: {
        publisherId: publisherId,
        status: InvoiceStatus.UPCOMING,
      },
    });
  }

  async increaseInvoiceLineAmount(invoiceLineId: string, amount: number) {
    const invoiceLine = await this.prismaService.invoiceLine.findUnique({
      where: {
        id: invoiceLineId,
      },
    });

    if (!invoiceLine) {
      throw new Error('Invoice line not found');
    }

    return await this.prismaService.invoiceLine.update({
      where: {
        id: invoiceLineId,
      },
      data: {
        amount: invoiceLine.amount + amount,
      },
    });
  }

  /**
   * Adds an invoice line item to an invoice.
   * Line items can only be added to upcoming invoices.
   * @param invoiceId
   * @param data
   * @returns created line item
   */
  async addLineItem(invoiceId: string, data: LineItemData) {
    const invoice = await this.prismaService.invoice.findUnique({
      where: {
        id: invoiceId,
      },
    });

    if (!invoice) {
      throw new Error('Invoice not found');
    }

    if (invoice.status !== InvoiceStatus.UPCOMING) {
      throw new Error('Line items can only be added to upcoming invoices');
    }

    return await this.prismaService.invoiceLine.create({
      data: {
        amount: data.amount,
        campaignId: data.campaignId,
        invoiceId: invoiceId,
      },
    });
  }
}

type CreateInvoiceOpts = {
  status: InvoiceStatus;
  publisherId: string;
};

type LineItemData = {
  campaignId: string;
  amount: number;
};

type SearchInvoiceOpts = {
  publisherId?: string;
  status?: InvoiceStatus;
};
