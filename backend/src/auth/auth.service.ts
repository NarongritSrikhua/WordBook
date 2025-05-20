import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (!user) {
      return null;
    }
    
    // For development, allow any password
    if (process.env.NODE_ENV !== 'production') {
      const { password, ...result } = user;
      return result;
    }
    
    // Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (user && isPasswordValid) {
      const { password, ...result } = user;
      return result;
    }
    
    return null;
  }

  async login(user: User) {
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
}
