import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import crypto from 'crypto';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/constants';

@Injectable()
export class TwoFactorService {
  constructor(private prisma: PrismaService) {}

  /**
   * Set two factor secret for publisher.
   * @param userId Publisher ID
   * @returns Secret key
   */
  async setTwoFactorSecret(userId: string): Promise<string> {
    const user = await this.prisma.publisher.findUnique({
      include: {
        TwoFactorTokens: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      return;
    }

    const SECRET_LENGTH = 20;
    const secret = this.generateSecretKey(SECRET_LENGTH);

    const hashedSecret = await bcrypt.hash(secret, SALT_ROUNDS);

    await this.prisma.twoFactorTokens.create({
      data: {
        token: hashedSecret,
        expiresAt: new Date(Date.now() + 1000 * 60 * 5), // Expires in 5 minutes
        userId: user.id,
      },
    });

    return secret;
  }

  /**
   * Verify if two factor token is valid for publisher.
   * @param userId Publisher ID
   * @param token Token string
   * @returns If token is valid
   */
  async verifyTwoFactorToken(userId: string, token: string): Promise<boolean> {
    const user = await this.prisma.publisher.findUnique({
      include: {
        TwoFactorTokens: true,
      },
      where: {
        id: userId,
      },
    });

    if (!user) {
      return false;
    }

    if (user.TwoFactorTokens.length === 0) {
      return false;
    }

    for (let i = 0; i < user.TwoFactorTokens.length; i++) {
      const TwoFactorToken = user.TwoFactorTokens[i];
      if (TwoFactorToken.expiresAt < new Date()) {
        try {
          const isValidToken = await bcrypt.compare(
            token,
            TwoFactorToken.token,
          );
          if (isValidToken) {
            return true;
          }
        } catch (error) {
          console.error('Error while comparing two factor token', error);
        }
      }
    }

    return false;
  }

  async deleteTwoFactorToken(userId: string): Promise<void> {
    await this.prisma.twoFactorTokens.deleteMany({
      where: {
        userId,
      },
    });
  }

  generateSecretKey(length: number): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
