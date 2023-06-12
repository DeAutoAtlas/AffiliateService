import { HttpException, HttpStatus } from '@nestjs/common';

export class UserNotFoundException extends HttpException {
  constructor(identifier: string | number) {
    super(
      {
        message: `User not found with identifier: ${identifier}`,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}
