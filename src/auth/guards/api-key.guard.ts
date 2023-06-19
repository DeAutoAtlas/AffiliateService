import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    if (request.headers['x-api-key'] === process.env.API_KEY) {
      request['user'] = {
        role: 'admin',
      };
    }

    return true;
  }
}
