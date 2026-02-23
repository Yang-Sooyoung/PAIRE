import { Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('api/user')
export class UserController {
  constructor(private userService: UserService) {}

  @Post('delete')
  @UseGuards(JwtAuthGuard)
  async deleteUser(@Request() req: any) {
    return this.userService.deleteUser(req.user.sub);
  }
}
