import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { CampaignService } from './campaign.service';
import { CreateCampaignRequestDto } from './dto/request.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AuthWithRole } from 'src/helpers/decorators';

@Controller('campaign')
export class CampaignController {
  constructor(private campaignService: CampaignService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @AuthWithRole('publisher')
  @Post()
  async createCampaign(
    @Req() request,
    @Body() createCampaignDto: CreateCampaignRequestDto,
  ) {
    return await this.campaignService.createCampaign(createCampaignDto);
  }
}
