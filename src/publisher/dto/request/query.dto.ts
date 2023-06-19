import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { UnionToArray, StatType } from 'src/types/types';

export class GetPublisherByIdQuery {
  @IsOptional()
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear())
  year: number;
  @IsOptional()
  @IsIn(['clicks', 'leads', 'ratio'] as UnionToArray<StatType>)
  statType: StatType;
}
