import { HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/constants';
import { PrismaService } from 'src/prisma.service';
import { UserRole } from 'src/types/types';
import { InvalidTwoFactorTokenException } from './exceptions/invalid-token.exception';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { TwoFactorService } from './two-factor.service';

@Injectable()
export class AuthService {
  constructor(
    private twoFactorService: TwoFactorService,
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async setTwoFactorSecret(email: string) {
    console.log('Finding publisher with email', email);
    const user = await this.prisma.publisher.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UserNotFoundException(email);
    }

    const token = await this.twoFactorService.setTwoFactorSecret(user.id);

    //TODO: Mail token token to user
    console.log(`User ${user.id} has received an email with token ${token}`);

    return token;
  }

  async loginPublisher(email: string, token: string) {
    const user = await this.prisma.publisher.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new UserNotFoundException(email);
    }

    const isTokenValid = await this.twoFactorService.verifyTwoFactorToken(
      user.id,
      token,
    );

    if (!isTokenValid) {
      throw new InvalidTwoFactorTokenException();
    }

    return this._generateTokens(user.id, user.email, 'publisher');
  }

  private async _generateTokens(userId: string, email: string, role: UserRole) {
    const tokenPayload: TokenPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this._generateAccessToken(tokenPayload);
    const refreshToken = this._generateRefreshToken(tokenPayload);

    await this.setRefreshToken(userId, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  async setRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, SALT_ROUNDS);

    await this.prisma.publisher.update({
      where: {
        id: userId,
      },
      data: {
        hashedRefreshToken,
      },
    });
  }

  async refreshToken(refreshToken: string) {
    const payload = this.decodeToken(refreshToken);

    return this._generateTokens(payload.sub, payload.email, payload.role);
  }

  private decodeToken(token: string) {
    const payload = this.jwtService.decode(token);

    if (typeof payload === 'object') {
      return payload as TokenPayload;
    }

    throw new HttpException('Cannot decode token', 401);
  }

  private _generateRefreshToken(payload: TokenPayload) {
    return this._signToken(payload, {
      secret: this.configService.get('auth.jwtRefreshSecret'),
      expiresIn: `${this.configService.get('auth.jwtRefreshExpirationTime')}s`,
    });
  }

  private _generateAccessToken(payload: TokenPayload) {
    return this._signToken(payload, {
      secret: this.configService.get('auth.jwtSecret'),
      expiresIn: `${this.configService.get('auth.jwtExpirationTime')}s`,
    });
  }

  private _signToken(payload: TokenPayload, options?: JwtSignOptions): string {
    return this.jwtService.sign(payload, options);
  }
}

export type TokenPayload = {
  sub: string;
  email: string;
  role: UserRole;
};
