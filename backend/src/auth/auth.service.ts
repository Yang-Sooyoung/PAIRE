import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '@/prisma/prisma.service';
import { SignupDto, LoginDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        username: dto.username,
        nickname: dto.nickname,
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  async login(dto: LoginDto) {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(dto.password, user.password || '');

    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    // Generate tokens
    const tokens = this.generateTokens(user.id);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_SECRET || 'your-secret-key',
      });

      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });

      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
      }

      const tokens = this.generateTokens(user.id);

      return {
        user: this.formatUser(user),
        ...tokens,
      };
    } catch (error) {
      throw new UnauthorizedException('토큰이 유효하지 않습니다.');
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    return this.formatUser(user);
  }

  /**
   * OAuth 사용자 검증 및 생성/업데이트
   */
  async validateOAuthUser(profile: {
    provider: string;
    providerId: string;
    email: string;
    username: string;
    profileImage?: string;
  }) {
    // provider + providerId로 사용자 찾기
    let user = await this.prisma.user.findUnique({
      where: {
        provider_providerId: {
          provider: profile.provider,
          providerId: profile.providerId,
        },
      },
    });

    if (!user) {
      // 이메일로 기존 사용자 찾기 (이메일 연동)
      const existingUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
      });

      if (existingUser && !existingUser.provider) {
        // 기존 로컬 계정에 OAuth 연동
        user = await this.prisma.user.update({
          where: { id: existingUser.id },
          data: {
            provider: profile.provider,
            providerId: profile.providerId,
          },
        });
      } else {
        // 새 OAuth 사용자 생성
        user = await this.prisma.user.create({
          data: {
            email: profile.email,
            username: profile.username,
            nickname: profile.username,
            provider: profile.provider,
            providerId: profile.providerId,
            password: null, // OAuth 사용자는 비밀번호 없음
          },
        });
      }
    }

    return user;
  }

  /**
   * OAuth 로그인 후 토큰 생성
   */
  async oauthLogin(user: any) {
    const tokens = this.generateTokens(user.id);

    return {
      user: this.formatUser(user),
      ...tokens,
    };
  }

  private generateTokens(userId: string) {
    const payload = { sub: userId };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_EXPIRATION || '3600s',
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION || '604800s',
    });

    return { accessToken, refreshToken };
  }

  private formatUser(user: any) {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
