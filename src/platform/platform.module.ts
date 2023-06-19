import { Module } from '@nestjs/common';
import { PlatformController } from './platform.controller';
import { PlatformService } from './platform.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  controllers: [PlatformController],
  providers: [PlatformService],
  imports: [PrismaModule],
})
export class PlatformModule {}
