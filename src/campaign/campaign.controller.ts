import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ActionType } from '@prisma/client';
import { AuthWithRole } from 'src/helpers/decorators';
import { CampaignService } from './campaign.service';
import { CreateCampaignRequestDto } from './dto/request.dto';

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

  @Get('/:id')
  @AuthWithRole('admin', 'publisher')
  async getCampaignById(
    @Req() req,
    @Param('id') id: string,
    @Query('year') year: number,
  ) {
    const campaign = await this.campaignService.getCampaignById(id, year);
    if (
      req.user.role === 'publisher' &&
      campaign?.publisherId !== req.user.sub
    ) {
      throw new ForbiddenException();
    }

    return campaign;
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
