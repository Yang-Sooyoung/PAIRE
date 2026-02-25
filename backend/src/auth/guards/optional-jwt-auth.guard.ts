import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  // Override handleRequest to allow requests without authentication
  handleRequest(err: any, user: any, info: any, context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;
    
    console.log('=== OptionalJwtAuthGuard ===');
    console.log('Authorization header:', authHeader);
    console.log('Error:', err);
    console.log('User from JWT:', user);
    console.log('Info:', info);
    
    // If there's an error or no user, just return null (don't throw)
    if (err || !user) {
      console.log('Returning null - no valid user');
      return null;
    }
    
    console.log('Returning user:', user);
    return user;
  }
}
