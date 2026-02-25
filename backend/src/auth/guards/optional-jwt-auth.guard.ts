import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to allow requests without authentication
  handleRequest(err: any, user: any) {
    // If there's an error or no user, just return null (don't throw)
    if (err || !user) {
      return null;
    }
    return user;
  }
}
