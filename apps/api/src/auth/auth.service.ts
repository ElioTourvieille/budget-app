import {
    ConflictException,
    Injectable,
    UnauthorizedException,
    BadRequestException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { compare, hash } from 'bcrypt';
  import { createId } from '@paralleldrive/cuid2';
  import { PrismaService } from 'src/prisma/prisma.service';
  import { MailerService } from 'src/mailer/mailer.service';
  import { UserPayload } from './jwt.strategy';
  import { CreateUserDto } from './dto/create-user.dto';
  import { LoginUserDto } from './dto/login-user.dto';
  import { ResetPasswordDto } from './dto/reset-password.dto';
  
  @Injectable()
  export class AuthService {
    constructor(
      private readonly prisma: PrismaService,
      private readonly jwtService: JwtService,
      private readonly mailerService: MailerService,
    ) {}
  
    // ─── LOGIN ────────────────────────────────────────────────────────
  
    async login({ email, password }: LoginUserDto) {
      const user = await this.prisma.user.findUnique({ where: { email } });
  
      if (!user) {
        throw new UnauthorizedException('Email ou mot de passe incorrect.');
      }
  
      const isPasswordValid = await compare(password, user.password);
      if (!isPasswordValid) {
        throw new UnauthorizedException('Email ou mot de passe incorrect.');
      }
  
      return this.generateToken(user.id);
    }
  
    // ─── REGISTER ─────────────────────────────────────────────────────
  
    async register({ email, firstName, password }: CreateUserDto) {
      const existingUser = await this.prisma.user.findUnique({ where: { email } });
  
      if (existingUser) {
        throw new ConflictException('Un compte avec cet email existe déjà.');
      }
  
      const hashedPassword = await hash(password, 10);
  
      const user = await this.prisma.user.create({
        data: { email, firstName, password: hashedPassword },
      });
  
      await this.mailerService.sendWelcomeEmail({
        recipient: user.email,
        firstName: user.firstName,
      });
  
      return this.generateToken(user.id);
    }
  
    // ─── RESET PASSWORD REQUEST ────────────────────────────────────────
  
    async resetPasswordRequest({ email }: { email: string }) {
      const user = await this.prisma.user.findUnique({ where: { email } });
  
      // Sécurité : on ne révèle pas si l'email existe ou non
      if (!user) {
        return { message: 'Si ce compte existe, un email a été envoyé.' };
      }
  
      // Invalide les anciens tokens en attente
      await this.prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });
  
      const token = createId();
      const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1h
  
      await this.prisma.passwordResetToken.create({
        data: { userId: user.id, token, expiresAt },
      });
  
      await this.mailerService.sendResetPasswordEmail({
        recipient: user.email,
        firstName: user.firstName,
        token,
      });
  
      return { message: 'Si ce compte existe, un email a été envoyé.' };
    }
  
    // ─── VERIFY RESET TOKEN ────────────────────────────────────────────
  
    async verifyResetToken({ token }: { token: string }) {
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
      });
  
      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        throw new BadRequestException('Token invalide ou expiré.');
      }
  
      return { valid: true };
    }
  
    // ─── RESET PASSWORD ────────────────────────────────────────────────
  
    async resetPassword({ token, password }: ResetPasswordDto) {
      const resetToken = await this.prisma.passwordResetToken.findUnique({
        where: { token },
        include: { user: true },
      });
  
      if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
        throw new BadRequestException('Token invalide ou expiré.');
      }
  
      const hashedPassword = await hash(password, 10);
  
      await this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword },
      });
  
      await this.prisma.passwordResetToken.update({
        where: { token },
        data: { usedAt: new Date() },
      });
  
      return { message: 'Mot de passe mis à jour avec succès.' };
    }
  
    // ─── PRIVATE ──────────────────────────────────────────────────────
  
    private generateToken(userId: string) {
      const payload: UserPayload = { userId };
      return {
        access_token: this.jwtService.sign(payload),
      };
    }
  }