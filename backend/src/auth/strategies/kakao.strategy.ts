import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { AuthService } from '../auth.service';

@Injectable()
export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_CLIENT_SECRET || '',
      callbackURL: process.env.KAKAO_CALLBACK_URL || 'http://localhost:3001/api/auth/kakao/callback',
    });
    
    console.log('KakaoStrategy initialized with:', {
      clientID: process.env.KAKAO_CLIENT_ID,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    console.log('Kakao validate called with profile:', profile);
    
    const { id, username, _json } = profile;
    
    const user = await this.authService.validateOAuthUser({
      provider: 'kakao',
      providerId: String(id),
      email: _json.kakao_account?.email || `kakao_${id}@paire.app`,
      username: username || _json.properties?.nickname || `카카오사용자${id}`,
      profileImage: _json.properties?.profile_image,
    });

    console.log('Kakao user validated:', user);
    done(null, user);
  }
}
