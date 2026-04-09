import { Controller, Post, Get, Patch, Body, UseGuards, Request, Res, Req } from '@nestjs/common';
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

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  async updateProfile(@Request() req: any, @Body() body: { nickname?: string }) {
    return this.authService.updateProfile(req.user.sub, body);
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
    const { accessToken, refreshToken } = result;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // 딥링크 시도 후 웹 fallback 처리
    res.send(`
      <html><body><script>
        var deeplink = 'paire://auth?accessToken=${accessToken}&refreshToken=${refreshToken}';
        var webUrl = '${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}';
        window.location.href = deeplink;
        setTimeout(function() { window.location.href = webUrl; }, 1500);
      </script></body></html>
    `);
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
    const { accessToken, refreshToken } = result;
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    // 딥링크 시도 후 웹 fallback 처리
    res.send(`
      <html><body><script>
        var deeplink = 'paire://auth?accessToken=${accessToken}&refreshToken=${refreshToken}';
        var webUrl = '${frontendUrl}/auth/callback?accessToken=${accessToken}&refreshToken=${refreshToken}';
        window.location.href = deeplink;
        setTimeout(function() { window.location.href = webUrl; }, 1500);
      </script></body></html>
    `);
  }
}
