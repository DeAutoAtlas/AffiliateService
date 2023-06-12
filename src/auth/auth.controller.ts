import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  LoginRequestDto,
  RefreshRequestDto,
  VerifyTokenRequestDto,
} from './dto/request.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginRequestDto) {
    const token = await this.authService.setTwoFactorSecret(loginDto.email);
    console.log('User has received token: ', token);
    return;
  }

  @Post('verify')
  async verify(@Body() verifyDto: VerifyTokenRequestDto) {
    const authTokens = await this.authService.loginPublisher(
      verifyDto.email,
      verifyDto.token,
    );

    return {
      accessToken: authTokens.accessToken,
      refreshToken: authTokens.refreshToken,
    };
  }

  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refresh(@Body() refreshDto: RefreshRequestDto) {
    return await this.authService.refreshToken(refreshDto.refreshToken);
  }
}
