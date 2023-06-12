import { Module } from '@nestjs/common';
import { AffiliateModule } from './affiliate/affiliate.module';
import { AuthModule } from './auth/auth.module';
import { PublisherModule } from './publisher/publisher.module';
import { ConfigModule } from '@nestjs/config';
import { CampaignModule } from './campaign/campaign.module';
import authConfig from 'config/auth.config';

@Module({
  imports: [
    AffiliateModule,
    AuthModule,
    PublisherModule,
    ConfigModule.forRoot({
      envFilePath: ['.env.development', '.env.production', '.env'],
      load: [authConfig],
    }),
    CampaignModule,
  ],
})
export class AppModule {}
