import {
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { AuthWithRole } from 'src/helpers/decorators';
import { InvoiceService } from './invoice.service';

@Controller('invoice')
export class InvoiceController {
  constructor(private invoiceService: InvoiceService) {}

  @Get()
  @AuthWithRole('admin', 'publisher')
  async getInvoices(@Query('status') status: InvoiceStatus, @Req() req) {
    if (req.user.role === 'publisher') {
      return await this.invoiceService.getInvoices({
        publisherId: req.user.sub,
        status,
      });
    }

    return await this.invoiceService.getInvoices({
      status,
    });
  }

  @Get('/upcoming')
  @AuthWithRole('publisher')
  async getUpcomingInvoice(@Req() req) {
    return await this.invoiceService.getUpcomingInvoice(req.user.sub);
  }

  @Post('/update')
  @AuthWithRole('admin')
  async test() {
    return await this.invoiceService.updateUpcomingInvoices();
  }

  @Patch('/:id/set-paid')
  @AuthWithRole('admin')
  async setPaid(@Param('id') id: string) {
    return await this.invoiceService.setPaid(id);
  }

  @Get('/:id')
  @AuthWithRole('publisher', 'admin')
  async getInvoiceById(@Param('id') id: string, @Req() req) {
    const invoice = await this.invoiceService.getInvoiceById(id);
    if (
      req.user.role === 'publisher' &&
      invoice?.publisherId !== req.user.sub
    ) {
      throw new ForbiddenException();
    }
    return invoice;
  }
}
