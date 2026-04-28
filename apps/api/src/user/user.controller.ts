import { Body, Controller, Get, Patch, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RequestWithUser } from 'src/auth/jwt.strategy';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(JwtAuthGuard) // toutes les routes du module sont protégées
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('me')
  async getMe(@Request() request: RequestWithUser) {
    return this.userService.getUserById({ userId: request.user.userId });
  }

  @Patch('me')
  async updateMe(
    @Request() request: RequestWithUser,
    @Body() body: UpdateUserDto,
  ) {
    return this.userService.updateUser({
      userId: request.user.userId,
      data: body,
    });
  }
}