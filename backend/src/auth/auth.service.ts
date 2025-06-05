import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { EmailService } from './email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    console.log('Validating user login:', { email });
    
    const user = await this.usersService.findByEmail(email);
    console.log('User found:', { 
      found: !!user,
      userId: user?.id,
      email: user?.email,
      hasPassword: !!user?.password,
      passwordLength: user?.password?.length
    });
    
    if (!user) {
      console.log('No user found with email:', email);
      throw new UnauthorizedException('Incorrect email or password');
    }
    
    // Always check password, even in development
    console.log('Comparing passwords:', {
      providedPasswordLength: password.length,
      storedPasswordLength: user.password.length
    });
    
    try {
      const isPasswordValid = await bcrypt.compare(password, user.password);
      console.log('Password comparison result:', { isPasswordValid });
      
      if (!isPasswordValid) {
        console.log('Invalid password for user:', email);
        throw new UnauthorizedException('Incorrect email or password');
      }
    } catch (error) {
      console.error('Error comparing passwords:', error);
      throw new UnauthorizedException('Incorrect email or password');
    }
    
    console.log('User validated successfully:', { userId: user.id, email: user.email });
    const { password: _, ...result } = user;
    return result;
  }

  async login(user: User) {
    // Update lastLoginAt
    await this.usersService.update(user.id, { lastLoginAt: new Date() });

    const payload = { 
      email: user.email, 
      sub: user.id,
      name: user.name,
      role: user.role
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
  
  // Verify token without throwing exceptions
  verifyToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (e) {
      return null;
    }
  }

  async forgotPassword(email: string): Promise<void> {
    try {
      console.log('Processing forgot password request for email:', email);
      
      const user = await this.usersService.findByEmail(email);
      if (!user) {
        console.log('No user found with email:', email);
        throw new NotFoundException('This email is not registered');
      }

      console.log('Found user:', { id: user.id, email: user.email });

      // Generate reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date();
      resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token expires in 1 hour

      console.log('Generated reset token:', { 
        tokenLength: resetToken.length,
        expiresAt: resetTokenExpires 
      });

      // Save reset token to user
      await this.usersService.update(user.id, {
        resetToken,
        resetTokenExpires,
      });

      console.log('Reset token saved to user');

      // Send reset email
      await this.emailService.sendPasswordResetEmail(user.email, resetToken);
      console.log('Reset email sent successfully');
    } catch (error) {
      console.error('Error in forgotPassword:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new Error(`Failed to process forgot password request: ${error.message}`);
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      console.log('Reset password request received:', { 
        tokenLength: token?.length,
        hasNewPassword: !!newPassword,
        newPasswordLength: newPassword?.length
      });

      if (!token || !newPassword) {
        throw new Error('Token and new password are required');
      }

      const user = await this.usersService.findByResetToken(token);
      console.log('User found by reset token:', { 
        found: !!user,
        userId: user?.id,
        email: user?.email,
        hasResetToken: !!user?.resetToken,
        resetTokenExpires: user?.resetTokenExpires,
        currentPasswordLength: user?.password?.length
      });
      
      if (!user) {
        console.log('No user found with the provided reset token');
        throw new UnauthorizedException('Invalid reset token');
      }

      if (!user.resetTokenExpires) {
        console.log('User has no reset token expiration date');
        throw new UnauthorizedException('Reset token has expired');
      }

      const now = new Date();
      if (user.resetTokenExpires < now) {
        const hoursExpired = Math.round((now.getTime() - user.resetTokenExpires.getTime()) / (1000 * 60 * 60));
        console.log('Reset token has expired:', { 
          hoursExpired,
          resetTokenExpires: user.resetTokenExpires,
          now
        });
        throw new UnauthorizedException(`Reset token has expired ${hoursExpired} hour(s) ago`);
      }

      // Update user's password and clear reset token
      console.log('Updating user with new password and clearing reset token');
      await this.usersService.update(user.id, {
        password: newPassword, // The service will handle hashing
        resetToken: undefined,
        resetTokenExpires: undefined
      });

      console.log('Password reset completed successfully');
    } catch (error) {
      console.error('Error during password reset:', error);
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new Error(`Failed to reset password: ${error.message}`);
    }
  }
}
