import {
    Body,
    Controller,
    Get,
    Post,
    Query,
    Request,
    UseGuards,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { JwtAuthGuard } from './jwt-auth.guard';
  import { RequestWithUser } from './jwt.strategy';
  import { UserService } from 'src/user/user.service';
  import { CreateUserDto } from './dto/create-user.dto';
  import { LoginUserDto } from './dto/login-user.dto';
  import { ResetPasswordRequestDto } from './dto/reset-password-request.dto';
  import { ResetPasswordDto } from './dto/reset-password.dto';
  
  @Controller('auth')
  export class AuthController {
    constructor(
      private readonly authService: AuthService,
      private readonly userService: UserService,
    ) {}
  
    @Post('login')
    async login(@Body() body: LoginUserDto) {
      return this.authService.login(body);
    }
  
    @Post('register')
    async register(@Body() body: CreateUserDto) {
      return this.authService.register(body);
    }
  
    @Post('reset-password-request')
    async resetPasswordRequest(@Body() body: ResetPasswordRequestDto) {
      return this.authService.resetPasswordRequest({ email: body.email });
    }
  
    @Get('verify-reset-token')
    async verifyResetToken(@Query('token') token: string) {
      return this.authService.verifyResetToken({ token });
    }
  
    @Post('reset-password')
    async resetPassword(@Body() body: ResetPasswordDto) {
      return this.authService.resetPassword(body);
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() request: RequestWithUser) {
      return this.userService.getUserById({ userId: request.user.userId });
    }
  }