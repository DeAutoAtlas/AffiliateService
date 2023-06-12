import {
  IsEmail,
  IsNotEmpty,
  IsNumberString,
  IsPhoneNumber,
} from 'class-validator';

export class InvitePublisherDto implements InvitePublisherOpts {
  @IsNotEmpty()
  firstName: string;
  @IsNotEmpty()
  lastName: string;
  @IsEmail()
  email: string;
  @IsPhoneNumber('NL')
  phoneNumber: string;
  @IsNumberString()
  kvkNumber: string;
}

export type InvitePublisherOpts = {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  kvkNumber: string;
};
