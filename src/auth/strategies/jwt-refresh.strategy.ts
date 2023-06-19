import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { TokenPayload } from '../auth.service';
import PublisherService from 'src/publisher/publisher.service';

@Injectable()
export class JwtRefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly publisherService: PublisherService,
  ) {
    super({
      secretOrKey: configService.get('auth.jwtRefreshSecret'),
      ignoreExpiration: false,
      passReqToCallback: true,
      jwtFromRequest: ExtractJwt.fromBodyField('refreshToken'),
    });
  }

  async validate(request: Request, payload: TokenPayload) {
    const refreshToken: string = request.body.refreshToken;
    return await this.publisherService.getIfRefreshTokenMatches(
      payload.sub,
      refreshToken,
    );
  }
}
