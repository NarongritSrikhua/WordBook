import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req) => {
          // Also try to extract from cookies
          if (req && req.cookies) {
            return req.cookies['token'] || req.cookies['auth_session'];
          }
          return null;
        },
      ]),
      ignoreExpiration: process.env.NODE_ENV !== 'production', // Ignore token expiration in development
      secretOrKey: configService.get('JWT_SECRET', 'Ghs7f$8z!bXxZk1@WqPl3n2R'),
    });
  }

  async validate(payload: any) {
    // In development, allow any valid JWT format
    if (process.env.NODE_ENV !== 'production') {
      return { 
        id: payload.sub || 'dev-user',
        email: payload.email || 'dev@example.com',
        name: payload.name || 'Development User',
        role: payload.role || 'user'
      };
    }
    
    return { 
      id: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role
    };
  }
}

