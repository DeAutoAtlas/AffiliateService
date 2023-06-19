import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiKeyGuard } from 'src/auth/guards/api-key.guard';
import { CreatePlatformRequestDto } from './dto/request.dto';
import { PlatformService } from './platform.service';
import { AuthWithRole } from 'src/helpers/decorators';

@Controller('platform')
export class PlatformController {
  constructor(private platformService: PlatformService) {}

  @Get()
  @AuthWithRole('admin')
  async getPlatforms() {
    return this.platformService.getPlatforms();
  }

  @Post()
  @UseGuards(ApiKeyGuard)
  async createPlatform(@Body() body: CreatePlatformRequestDto) {
    return this.platformService.createPlatform(body);
  }
}
