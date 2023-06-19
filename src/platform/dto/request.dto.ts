import { IsNotEmpty, IsUrl } from 'class-validator';

export class CreatePlatformRequestDto {
  @IsNotEmpty()
  @IsUrl()
  baseUrl: string;
  @IsNotEmpty()
  name: string;
}
