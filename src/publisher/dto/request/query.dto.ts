import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GetPublisherByIdQuery {
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year: number;
}
