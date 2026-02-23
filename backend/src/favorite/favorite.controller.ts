import { Controller, Post, Delete, Get, UseGuards, Request, Param, Query } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('api/favorite')
export class FavoriteController {
  constructor(private favoriteService: FavoriteService) {}

  @Post(':drinkId')
  @UseGuards(JwtAuthGuard)
  async addFavorite(@Request() req: any, @Param('drinkId') drinkId: string) {
    return this.favoriteService.addFavorite(req.user.sub, drinkId);
  }

  @Delete(':drinkId')
  @UseGuards(JwtAuthGuard)
  async removeFavorite(@Request() req: any, @Param('drinkId') drinkId: string) {
    return this.favoriteService.removeFavorite(req.user.sub, drinkId);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  async getFavorites(@Request() req: any) {
    return this.favoriteService.getFavorites(req.user.sub);
  }

  @Get('check/:drinkId')
  @UseGuards(JwtAuthGuard)
  async isFavorite(@Request() req: any, @Param('drinkId') drinkId: string) {
    return this.favoriteService.isFavorite(req.user.sub, drinkId);
  }
}
