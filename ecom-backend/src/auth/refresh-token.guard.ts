import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class RefreshTokenGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();

    const refreshToken = request.cookies?.refreshToken; // assuming refresh token in httpOnly cookie
    if (!refreshToken) return false;

    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET,
      });
      request.user = { userId: payload.sub };
      return true;
    } catch (err) {
      return false;
    }
  }
}
