import { IsEmail, IsJWT, IsNotEmpty } from 'class-validator';

export class LoginRequestDto {
  @IsEmail()
  email: string;
}

export class VerifyTokenRequestDto {
  @IsNotEmpty()
  token: string;
  @IsEmail()
  email: string;
}

export class RefreshRequestDto {
  @IsNotEmpty()
  @IsJWT()
  refreshToken: string;
}
