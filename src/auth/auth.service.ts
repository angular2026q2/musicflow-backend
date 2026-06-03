import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { SupabaseService } from '@supabase/supabase.service';
import { UsersService } from '@users/users.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import type { AuthUser, JwtPayload } from './strategies/jwt.strategy';
import type { StringValue } from 'ms';

export interface AuthResponse {
  accessToken: string;
  user: AuthUser;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
  ) {}

  async signUp(dto: SignUpDto): Promise<AuthResponse> {
    const { data: existingProfile } = await this.supabaseService.db
      .from('profiles')
      .select('id')
      .eq('username', dto.username)
      .single();

    if (existingProfile) {
      throw new ConflictException('Username already taken');
    }

    const { data: authData, error: authError } =
      await this.supabaseService.db.auth.admin.createUser({
        email: dto.email,
        password: dto.password,
        email_confirm: true,
      });

    if (authError ?? !authData.user) {
      throw new ConflictException(
        authError?.message ?? 'Failed to create user',
      );
    }

    const defaultAvatarUrl = await this.usersService.getDefaultAvatarUrl();

    const { data: profile, error: profileError } = await this.supabaseService.db
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: dto.username,
        full_name: dto.full_name ?? null,
        avatar_url: defaultAvatarUrl,
      })
      .select()
      .single();

    if (profileError ?? !profile) {
      // тут нужно откатить создание юзвера, если провиль не создалсяЖ
      await this.supabaseService.db.auth.admin.deleteUser(authData.user.id);
      throw new ConflictException('Failed to create user profile');
    }

    const accessToken = this.generateToken(authData.user.id, dto.email);

    return { accessToken, user: profile };
  }

  async signIn(dto: SignInDto): Promise<AuthResponse> {
    // * `identifier` checks: whether it's an email or username:
    const isEmail = dto.identifier.includes('@');

    let email: string;

    if (isEmail) {
      email = dto.identifier;
    } else {
      // * find user by their `username` in profiles Table:
      const { data: profile, error: profileLookupError } =
        await this.supabaseService.db
          .from('profiles')
          .select('id')
          .eq('username', dto.identifier)
          .single();

      if (profileLookupError ?? !profile) {
        throw new UnauthorizedException('Invalid credentials');
      }

      // * Get email from `auth.users` via Supabase Admin API:
      const { data: adminUser, error: adminError } =
        await this.supabaseService.db.auth.admin.getUserById(profile.id);

      if (adminError ?? !adminUser.user?.email) {
        throw new UnauthorizedException('Invalid credentials');
      }

      email = adminUser.user.email;
    }

    // * Authentication via Supabase with found email
    const { data, error } =
      await this.supabaseService.db.auth.signInWithPassword({
        email,
        password: dto.password,
      });

    if (error ?? !data.user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { data: profile, error: profileError } = await this.supabaseService.db
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError ?? !profile) {
      throw new UnauthorizedException('User profile not found');
    }

    const accessToken = this.generateToken(data.user.id, email);

    return { accessToken, user: profile };
  }

  async getMe(userId: string): Promise<AuthUser> {
    const { data, error } = await this.supabaseService.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error ?? !data) {
      throw new UnauthorizedException('User not found');
    }

    return data;
  }

  /** @description
   * - Sends a password reset email to the user via Supabase Auth service.
   * - Does not reveal whether the email exists in the system (security best practice).
   * @param email - user email address to recover password
   */
  async resetPassword(email: string): Promise<void> {
    // check in auth.users via Supabase admin
    const { data, error } =
      await this.supabaseService.db.auth.admin.listUsers();

    if (error) {
      throw new NotFoundException('No account found with this email');
    }

    const userExists = data.users.some(
      (u: { email?: string }) => u.email === email,
    );

    if (!userExists) {
      throw new NotFoundException('No account found with this email');
    }

    await this.supabaseService.db.auth.resetPasswordForEmail(email);
  }

  /**
   * @description Updates user password using recovery token from a Supabase email link.
   * @param {string} accessToken - recovery token from URL hash
   * @param {string} newPassword - new password to set
   * @throws {UnauthorizedException} if the recovery token is invalid or expired
   */
  async updatePassword(
    accessToken: string,
    newPassword: string,
  ): Promise<void> {
    // * Set session from recovery token first
    const { error: sessionError } =
      await this.supabaseService.db.auth.setSession({
        access_token: accessToken,
        refresh_token: '',
      });

    if (sessionError) {
      throw new UnauthorizedException(
        'Failed to update password. Link may have expired.',
      );
    }

    const { error } = await this.supabaseService.db.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      throw new UnauthorizedException(
        'Failed to update password. Link may have expired.',
      );
    }
  }

  private generateToken(userId: string, email: string): string {
    const payload: JwtPayload = { sub: userId, email };
    const expiresIn = this.configService.getOrThrow<string>(
      'JWT_EXPIRES_IN',
    ) as StringValue;

    return this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_SECRET'),
      expiresIn,
    });
  }
}
