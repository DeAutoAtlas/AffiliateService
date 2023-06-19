import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TwoFactorService } from './two-factor.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshTokenStrategy } from './strategies/jwt-refresh.strategy';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { RolesGuard } from './guards/roles.guard';
import { PrismaModule } from 'src/prisma.module';
import { PublisherModule } from 'src/publisher/publisher.module';
import { PassportModule } from '@nestjs/passport';

@Module({
  providers: [
    AuthService,
    TwoFactorService,
    JwtStrategy,
    JwtAuthGuard,
    JwtRefreshTokenStrategy,
    JwtRefreshGuard,
    RolesGuard,
  ],
  controllers: [AuthController],
  imports: [
    PrismaModule,
    PublisherModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('auth.jwtSecret'),
          signOptions: {
            expiresIn: `${configService.get('auth.jwtExpirationTime')}s`,
          },
        };
      },
    }),
  ],
})
export class AuthModule {}
