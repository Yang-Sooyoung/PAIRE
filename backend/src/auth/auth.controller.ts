import { Controller, Post, Get, Body, UseGuards, Request, Res, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { SignupDto, LoginDto, RefreshTokenDto } from './dto';

@Controller('api/auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto.refreshToken);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@Request() req: any) {
    return this.authService.getCurrentUser(req.user.sub);
  }

  // Google OAuth
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Guard redirects to Google
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    const accessToken = result.accessToken;
    const refreshToken = result.refreshToken;

    // 모바일 앱: 딥링크로 리다이렉트
    // 웹: 프론트엔드 콜백 페이지로 리다이렉트
    const userAgent = req.headers['user-agent'] || '';
    const isMobile = userAgent.includes('capacitor') || userAgent.includes('Android') || userAgent.includes('iPhone');

    if (isMobile) {
      res.redirect(`paire://auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    } else {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
  }

  // Kakao OAuth
  @Get('kakao')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuth() {
    console.log('Kakao auth initiated');
    // Guard redirects to Kakao
  }

  @Get('kakao/callback')
  @UseGuards(AuthGuard('kakao'))
  async kakaoAuthCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.authService.oauthLogin(req.user);
    const accessToken = result.accessToken;
    const refreshToken = result.refreshToken;

    const userAgent = req.headers['user-agent'] || '';
    const isMobile = userAgent.includes('capacitor') || userAgent.includes('Android') || userAgent.includes('iPhone');

    if (isMobile) {
      res.redirect(`paire://auth?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    } else {
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}`);
    }
  }
}
