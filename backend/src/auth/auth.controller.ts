import { Controller, Post, Body, UseGuards, Request, Get, HttpException, HttpStatus, UnauthorizedException, NotFoundException, ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RegisterDto } from './dto/register.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { EmailService } from './email.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
    private readonly emailService: EmailService
  ) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    try {
      const user = await this.usersService.create({
        email: registerDto.email,
        name: registerDto.name,
        password: registerDto.password,
      });

      // Send welcome email
      await this.emailService.sendWelcomeEmail(user.email, user.name);

      return {
        message: 'Registration successful',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      };
    } catch (error) {
      console.error('Registration error:', error);
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to register user',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    try {
      return this.authService.login(req.user);
    } catch (error) {
      throw new UnauthorizedException('Incorrect email or password');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return {
      userId: req.user.userId,
      email: req.user.email,
      name: req.user.name,
      role: req.user.role
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    try {
      console.log('Received forgot password request for email:', forgotPasswordDto.email);
      await this.authService.forgotPassword(forgotPasswordDto.email);
      return { message: 'Password reset link has been sent to your email.' };
    } catch (error) {
      console.error('Error in forgot password controller:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to process forgot password request',
          details: error.message,
          stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return { message: 'Password has been reset successfully.' };
  }
}

