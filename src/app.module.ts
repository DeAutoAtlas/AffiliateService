import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PublisherModule } from './publisher/publisher.module';
import { ConfigModule } from '@nestjs/config';
import { CampaignModule } from './campaign/campaign.module';
import authConfig from 'config/auth.config';
import { PrismaService } from './prisma.service';
import { PlatformModule } from './platform/platform.module';
import { InvoiceModule } from './invoice/invoice.module';
import { ScheduleModule } from '@nestjs/schedule';
import { HealthModule } from './health/health.module';
import invoiceConfig from 'config/invoice.config';

@Module({
  imports: [
    AuthModule,
    PublisherModule,
    ConfigModule.forRoot({
      envFilePath: '.env',
      load: [authConfig, invoiceConfig],
      isGlobal: true,
    }),
    CampaignModule,
    PlatformModule,
    InvoiceModule,
    ScheduleModule.forRoot(),
    HealthModule,
  ],
  providers: [PrismaService],
  exports: [PrismaService],
})
export class AppModule {}
