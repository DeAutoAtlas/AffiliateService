import {
  ActionType,
  Campaign,
  CampaignAction,
  Publisher,
} from '@prisma/client';
import { TokenPayload } from 'src/auth/auth.service';

export type PaginationArgs = {
  page: number;
  perPage: number;
};

export type Seeder = {
  seed: () => Promise<void>;
  clear: () => Promise<void>;
};

export type Data<T, D> = {
  type: T;
  dataset: D[];
};
export type CampaignStats = {
  clicksAmount: number;
  leadsAmount: number;
  stats: Data<ActionType, number>[];
};

export type ReturnablePublisher = Omit<Publisher, 'hashedRefreshToken'>;

export type PublisherWithStats = ReturnablePublisher & CampaignStats;

export type AffiliateCampaign = Campaign & {
  campaignActions: CampaignAction[];
};

export type PublisherWithCampaignsAndActions = ReturnablePublisher & {
  campaigns: AffiliateCampaign[];
};

export type UserRole = 'admin' | 'publisher';

export type StatType = 'clicks' | 'leads' | 'ratio';

// Helper Types

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

// Converts union to overloaded function
type UnionToOvlds<U> = UnionToIntersection<
  U extends any ? (f: U) => void : never
>;

type PopUnion<U> = UnionToOvlds<U> extends (a: infer A) => void ? A : never;

type IsUnion<T> = [T] extends [UnionToIntersection<T>] ? false : true;

export type UnionToArray<T, A extends unknown[] = []> = IsUnion<T> extends true
  ? UnionToArray<Exclude<T, PopUnion<T>>, [PopUnion<T>, ...A]>
  : [T, ...A];

export interface RequestWithUser extends Request {
  user: TokenPayload;
}
