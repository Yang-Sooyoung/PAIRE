import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
    
    console.log('JwtStrategy initialized with secret:', process.env.JWT_SECRET ? 'SET' : 'NOT SET');
  }

  async validate(payload: any) {
    console.log('=== JWT Strategy validate ===');
    console.log('Payload:', payload);
    console.log('Returning user with sub:', payload.sub);
    return { sub: payload.sub };
  }
}
