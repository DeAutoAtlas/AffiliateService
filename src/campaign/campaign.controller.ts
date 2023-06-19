import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignRequestDto } from './dto/request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthWithRole } from 'src/helpers/decorators';
import { ActionType } from '@prisma/client';

@Controller('campaign')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @AuthWithRole('publisher')
  @Post()
  async createCampaign(
    @Req() request,
    @Body() createCampaignDto: CreateCampaignRequestDto,
  ) {
    return this.campaignService.createCampaign(
      request.user.sub,
      createCampaignDto,
    );
  }

  @AuthWithRole('publisher')
  @Get()
  async getCampaigns(@Req() request) {
    return this.campaignService.getCampaignsByUser(request.user.sub);
  }

  @Post('/action')
  @AuthWithRole('admin')
  async createAction(
    @Query('action') action: ActionType,
    @Query('aid') affiliateId: string,
  ) {
    return this.campaignService.createCampaignAction(action, affiliateId);
  }
}
