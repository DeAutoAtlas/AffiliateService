import { HttpException, HttpStatus } from '@nestjs/common';

export class InvalidTwoFactorTokenException extends HttpException {
  constructor() {
    super(
      {
        message: 'Invalid two-factor token',
      },
      HttpStatus.UNAUTHORIZED,
    );
  }
}
