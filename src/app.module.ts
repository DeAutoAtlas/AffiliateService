import { Module } from '@nestjs/common';
import { AffiliateModule } from './affiliate/affiliate.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [AffiliateModule, AuthModule],
})
export class AppModule {}
