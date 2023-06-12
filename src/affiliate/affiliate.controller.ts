import { Controller, Param, Post, Req, Res } from '@nestjs/common';
import { AffiliateService } from './affiliate.service';
import { Request, Response } from 'express';

@Controller('affiliate')
export class AffiliateController {
  constructor(private affiliateService: AffiliateService) {}

  @Post('generate-cookie/:campaignId')
  genCookie(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response,
    @Param('campaignId') campaignId: string,
  ) {
    console.log('request', request.ip);

    response.cookie('affiliateId', campaignId, {
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 24 * 30,
      path: '/',
    });
    return;
  }
}
