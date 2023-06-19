import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';

@Injectable()
export class PlatformService {
  constructor(private prismaService: PrismaService) {}

  async createPlatform(opts: CreatePlatformData) {
    return this.prismaService.platform.create({
      data: {
        baseUrl: opts.baseUrl,
        name: opts.name,
      },
    });
  }

  async getPlatforms() {
    return this.prismaService.platform.findMany();
  }
}

export type CreatePlatformData = {
  name: string;
  baseUrl: string;
};
