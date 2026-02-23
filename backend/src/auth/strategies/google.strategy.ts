import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    const clientID = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    // 환경 변수가 없으면 더미 값 사용 (전략 비활성화)
    super({
      clientID: clientID || 'dummy-client-id',
      clientSecret: clientSecret || 'dummy-client-secret',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3001/api/auth/google/callback',
      scope: ['email', 'profile'],
    });

    // 환경 변수가 없으면 경고 로그
    if (!clientID || !clientSecret) {
      console.warn('⚠️  Google OAuth is disabled: GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET not set');
    }
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { id, emails, displayName, photos } = profile;
    
    const user = await this.authService.validateOAuthUser({
      provider: 'google',
      providerId: id,
      email: emails[0].value,
      username: displayName,
      profileImage: photos?.[0]?.value,
    });

    done(null, user);
  }
}
