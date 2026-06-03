import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthResponse, AuthService } from '@auth/auth.service';

import { SignInDto } from '@auth/dto/sign-in.dto';
import { SignUpDto } from '@auth/dto/sign-up.dto';
import { ResetPasswordDto } from '@auth/dto/reset-password.dto';
import { UpdatePasswordDto } from '@auth/dto/update-password.dto';

import { JwtAuthGuard } from '@auth/guards/jwt-auth.guard';
import type { AuthUser } from '@auth/strategies/jwt.strategy';
import { CurrentUser } from '@common/decorators/current-user.decorator';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('sign-up')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User successfully registered' })
  @ApiResponse({ status: 409, description: 'Username or email already taken' })
  async signUp(@Body() dto: SignUpDto): Promise<AuthResponse> {
    return this.authService.signUp(dto);
  }

  @Post('sign-in')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sign in with email and password' })
  @ApiResponse({ status: 200, description: 'User successfully signed in' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async signIn(@Body() dto: SignInDto): Promise<AuthResponse> {
    return this.authService.signIn(dto);
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Reset user password via email' })
  @ApiResponse({ status: 200, description: 'Password reset email sent' })
  @ApiResponse({
    status: 404,
    description: 'User with provided email not found',
  })
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<void> {
    return this.authService.resetPassword(dto.email);
  }

  @Post('update-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update password using recovery token' })
  @ApiResponse({ status: 200, description: 'Password updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token' })
  async updatePassword(@Body() dto: UpdatePasswordDto): Promise<void> {
    return this.authService.updatePassword(dto.access_token, dto.new_password);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiResponse({ status: 200, description: 'Current user profile' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMe(@CurrentUser() user: AuthUser): Promise<AuthUser> {
    return this.authService.getMe(user.id);
  }
}
