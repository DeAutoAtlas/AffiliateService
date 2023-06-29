import { Module } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { PrismaModule } from 'src/prisma.module';
import { InvoiceController } from './invoice.controller';

@Module({
  imports: [PrismaModule],
  providers: [InvoiceService],
  exports: [InvoiceService],
  controllers: [InvoiceController],
})
export class InvoiceModule {}
