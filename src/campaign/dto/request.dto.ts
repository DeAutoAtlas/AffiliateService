import { IsNotEmpty } from 'class-validator';

export class CreateCampaignRequestDto {
  @IsNotEmpty()
  platformId: string;
  @IsNotEmpty()
  path: string;
}
