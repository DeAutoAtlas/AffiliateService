import { Module } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import PublisherController from './publisher.controller';
import PublisherService from './publisher.service';
import { PrismaModule } from 'src/prisma.module';

@Module({
  controllers: [PublisherController],
  providers: [PublisherService],
  imports: [PrismaModule],
  exports: [PublisherService],
})
export class PublisherModule {}
