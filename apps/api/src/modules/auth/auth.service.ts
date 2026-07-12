import { Injectable } from "@nestjs/common";
import {
  generateResetToken,
  generateSessionToken,
  generateVerificationCode,
  hashPassword,
  hashToken,
  normalizeEmail,
  prisma,
  sceneAtlasStore,
  verifyPassword,
  SceneAtlasError
} from "@sceneatlas/db";
import type { AccountSnapshot, UsageSnapshot } from "@sceneatlas/shared";
import { apiEnv } from "../../config/env";
import { isAdminEmail } from "../../common/admin";

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  avatar?: string;
}

export interface VerifyEmailInput {
  email: string;
  code: string;
}

export interface SignInInput {
  email: string;
  password: string;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  password: string;
}

export interface GoogleOAuthInput {
  googleSub: string;
  email: string;
  name: string;
  avatar?: string;
  emailVerified: boolean;
}

export interface AuthResult {
  account: AccountSnapshot;
  sessionToken: string;
  usage: UsageSnapshot;
}

export interface RegistrationResult {
  email: string;
  verificationSent: true;
}

function now() {
  return new Date();
}

function addMinutes(date: Date, minutes: number) {
  return new Date(date.getTime() + minutes * 60_000);
}

function addDays(date: Date, days: number) {
  return new Date(date.getTime() + days * 24 * 60 * 60_000);
}

function displayNameFromEmail(email: string) {
  const localPart = normalizeEmail(email).split("@")[0] || "Movie Fan";
  return localPart
    .replace(/[._-]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim();
}

function normalizeAvatar(avatar?: string | null) {
  const value = avatar?.trim();
  return value ? value : undefined;
}

function authProviderForUser(input: { passwordHash?: string | null; googleSub?: string | null }) {
  if (input.passwordHash && input.googleSub) {
    return "password+google";
  }

  if (input.googleSub) {
    return "google";
  }

  return "password";
}

function verificationEmailHtml(name: string, code: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h1 style="margin: 0 0 16px; font-size: 24px;">Verify your SceneAtlas account</h1>
      <p style="margin: 0 0 12px;">Hi ${name},</p>
      <p style="margin: 0 0 12px;">Enter this verification code to finish creating your account:</p>
      <p style="font-size: 30px; letter-spacing: 0.25em; font-weight: 700; margin: 0 0 12px;">${code}</p>
      <p style="margin: 0;">This code expires in 15 minutes.</p>
    </div>
  `;
}

function resetEmailHtml(name: string, resetUrl: string) {
  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827;">
      <h1 style="margin: 0 0 16px; font-size: 24px;">Reset your SceneAtlas password</h1>
      <p style="margin: 0 0 12px;">Hi ${name},</p>
      <p style="margin: 0 0 16px;">Use the button below to choose a new password.</p>
      <p style="margin: 0 0 20px;">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 18px;border-radius:999px;background:#111827;color:#fff;text-decoration:none;font-weight:700;">Reset password</a>
      </p>
      <p style="margin: 0;">If you didn't ask for a reset, you can ignore this email.</p>
    </div>
  `;
}

@Injectable()
export class AuthService {
  private async sendEmail(input: { to: string; name: string; subject: string; htmlContent: string; textContent: string }) {
    if (!apiEnv.brevoApiKey || !apiEnv.brevoSenderEmail) {
      throw new SceneAtlasError("Brevo email settings are missing.", "STATE_ERROR");
    }

    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        accept: "application/json",
        "api-key": apiEnv.brevoApiKey,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        sender: {
          email: apiEnv.brevoSenderEmail,
          name: apiEnv.brevoSenderName
        },
        to: [
          {
            email: input.to,
            name: input.name
          }
        ],
        subject: input.subject,
        htmlContent: input.htmlContent,
        textContent: input.textContent
      })
    });

    if (!response.ok) {
      const message = await response.text();
      throw new SceneAtlasError(`Brevo email send failed: ${message || response.statusText}`, "STATE_ERROR");
    }
  }

  private syncMirrorUser(user: {
    id: string;
    email: string;
    name: string | null;
    image: string | null;
    authProvider: string;
    subscriptionTier: "FREE" | "PREMIUM";
  }) {
    sceneAtlasStore.upsertUser({
      id: user.id,
      name: user.name?.trim() || displayNameFromEmail(user.email),
      email: user.email,
      avatar: normalizeAvatar(user.image),
      provider: user.authProvider,
      subscriptionTier: user.subscriptionTier,
      subscriptionStatus: "NONE"
    });
  }

  private async issueChallenge(userId: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET", token: string, expiresAt: Date) {
    await prisma.authChallenge.deleteMany({
      where: {
        userId,
        purpose,
        consumedAt: null
      }
    });

    return prisma.authChallenge.create({
      data: {
        userId,
        purpose,
        tokenHash: hashToken(token),
        expiresAt
      }
    });
  }

  private async createSession(userId: string) {
    const sessionToken = generateSessionToken();
    await prisma.authSession.create({
      data: {
        userId,
        tokenHash: hashToken(sessionToken),
        expiresAt: addDays(now(), 30)
      }
    });

    return sessionToken;
  }

  private async getUserBySession(sessionToken?: string | null) {
    if (!sessionToken) {
      return null;
    }

    const session = await prisma.authSession.findFirst({
      where: {
        tokenHash: hashToken(sessionToken),
        revokedAt: null,
        expiresAt: {
          gt: now()
        }
      },
      select: {
        userId: true
      }
    });

    if (!session) {
      return null;
    }

    return prisma.user.findUnique({
      where: {
        id: session.userId
      }
    });
  }

  private async accountForUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: {
        id: userId
      }
    });

    if (!user) {
      return null;
    }

    this.syncMirrorUser(user);
    const account = sceneAtlasStore.getAccount(user.id);
    return account ? { ...account, isAdmin: isAdminEmail(user.email) } : null;
  }

  private async sendVerificationEmail(user: {
    id: string;
    email: string;
    name: string | null;
  }) {
    const code = generateVerificationCode();
    await this.issueChallenge(user.id, "EMAIL_VERIFICATION", code, addMinutes(now(), 15));
    await this.sendEmail({
      to: user.email,
      name: user.name?.trim() || displayNameFromEmail(user.email),
      subject: "Verify your SceneAtlas account",
      htmlContent: verificationEmailHtml(user.name?.trim() || displayNameFromEmail(user.email), code),
      textContent: `Verify your SceneAtlas account with code ${code}. This code expires in 15 minutes.`
    });
  }

  private async sendResetEmail(user: {
    id: string;
    email: string;
    name: string | null;
  }) {
    const token = generateResetToken();
    await this.issueChallenge(user.id, "PASSWORD_RESET", token, addMinutes(now(), 60));
    const resetUrl = `${apiEnv.appUrl.replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(token)}&email=${encodeURIComponent(user.email)}`;
    await this.sendEmail({
      to: user.email,
      name: user.name?.trim() || displayNameFromEmail(user.email),
      subject: "Reset your SceneAtlas password",
      htmlContent: resetEmailHtml(user.name?.trim() || displayNameFromEmail(user.email), resetUrl),
      textContent: `Reset your SceneAtlas password using this link: ${resetUrl}`
    });
  }

  private assertPasswordStrength(password: string) {
    if (password.trim().length < 8) {
      throw new SceneAtlasError("Password must be at least 8 characters long.", "VALIDATION");
    }
  }

  async signUp(input: RegisterInput): Promise<RegistrationResult> {
    const email = normalizeEmail(input.email);
    if (!email) {
      throw new SceneAtlasError("Email is required.", "VALIDATION");
    }

    this.assertPasswordStrength(input.password);

    const existing = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (existing?.emailVerifiedAt) {
      throw new SceneAtlasError("That email is already registered.", "CONFLICT");
    }

    const passwordHash = hashPassword(input.password);
    const user = existing
      ? await prisma.user.update({
          where: {
            email
          },
          data: {
            name: input.name.trim() || existing.name || displayNameFromEmail(email),
            image: normalizeAvatar(input.avatar),
            passwordHash,
            authProvider: authProviderForUser({ passwordHash, googleSub: existing.googleSub }),
            googleSub: existing.googleSub,
            emailVerifiedAt: null
          }
        })
      : await prisma.user.create({
          data: {
            email,
            name: input.name.trim() || displayNameFromEmail(email),
            image: normalizeAvatar(input.avatar),
            passwordHash,
            authProvider: "password",
            emailVerifiedAt: null
          }
        });

    this.syncMirrorUser(user);
    await this.sendVerificationEmail(user);

    return {
      email: user.email,
      verificationSent: true
    };
  }

  async resendVerification(input: { email: string }): Promise<RegistrationResult> {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return {
        email,
        verificationSent: true
      };
    }

    if (user.emailVerifiedAt) {
      this.syncMirrorUser(user);
      return {
        email: user.email,
        verificationSent: true
      };
    }

    this.syncMirrorUser(user);
    await this.sendVerificationEmail(user);

    return {
      email: user.email,
      verificationSent: true
    };
  }

  async verifyEmail(input: VerifyEmailInput): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      throw new SceneAtlasError("That verification code is invalid or expired.", "VALIDATION");
    }

    const challenge = await prisma.authChallenge.findFirst({
      where: {
        userId: user.id,
        purpose: "EMAIL_VERIFICATION",
        consumedAt: null
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!challenge || challenge.expiresAt.getTime() <= now().getTime()) {
      throw new SceneAtlasError("That verification code is invalid or expired.", "VALIDATION");
    }

    const expectedHash = hashToken(input.code.trim());
    if (expectedHash !== challenge.tokenHash) {
      await prisma.authChallenge.update({
        where: {
          id: challenge.id
        },
        data: {
          attempts: {
            increment: 1
          }
        }
      });
      throw new SceneAtlasError("That verification code is invalid or expired.", "VALIDATION");
    }

    const verifiedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        emailVerifiedAt: now(),
        authProvider: authProviderForUser({ passwordHash: user.passwordHash, googleSub: user.googleSub }),
        lastLoginAt: now()
      }
    });

    await prisma.authChallenge.update({
      where: {
        id: challenge.id
      },
      data: {
        consumedAt: now()
      }
    });

    this.syncMirrorUser(verifiedUser);
    const sessionToken = await this.createSession(verifiedUser.id);
    const account = await this.accountForUser(verifiedUser.id);

    if (!account) {
      throw new SceneAtlasError("Failed to resolve account.", "STATE_ERROR");
    }

    return {
      account,
      sessionToken,
      usage: account.usage
    };
  }

  async signIn(input: SignInInput): Promise<AuthResult> {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (!user || !user.passwordHash) {
      throw new SceneAtlasError("We couldn't sign you in with those credentials.", "FORBIDDEN");
    }

    if (!user.emailVerifiedAt) {
      await this.sendVerificationEmail(user);
      throw new SceneAtlasError("Please verify your email first. We just sent a new code.", "FORBIDDEN");
    }

    if (!verifyPassword(input.password, user.passwordHash)) {
      throw new SceneAtlasError("We couldn't sign you in with those credentials.", "FORBIDDEN");
    }

    const updatedUser = await prisma.user.update({
      where: {
        id: user.id
      },
      data: {
        lastLoginAt: now(),
        authProvider: authProviderForUser({ passwordHash: user.passwordHash, googleSub: user.googleSub })
      }
    });

    this.syncMirrorUser(updatedUser);
    const sessionToken = await this.createSession(updatedUser.id);
    const account = await this.accountForUser(updatedUser.id);

    if (!account) {
      throw new SceneAtlasError("Failed to resolve account.", "STATE_ERROR");
    }

    return {
      account,
      sessionToken,
      usage: account.usage
    };
  }

  async forgotPassword(input: ForgotPasswordInput): Promise<{ ok: true }> {
    const email = normalizeEmail(input.email);
    const user = await prisma.user.findUnique({
      where: {
        email
      }
    });

    if (user) {
      this.syncMirrorUser(user);
      await this.sendResetEmail(user);
    }

    return { ok: true };
  }

  async resetPassword(input: ResetPasswordInput): Promise<AuthResult> {
    const tokenHash = hashToken(input.token.trim());
    const challenge = await prisma.authChallenge.findFirst({
      where: {
        tokenHash,
        purpose: "PASSWORD_RESET",
        consumedAt: null,
        expiresAt: {
          gt: now()
        }
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    if (!challenge) {
      throw new SceneAtlasError("That reset link is invalid or expired.", "VALIDATION");
    }

    this.assertPasswordStrength(input.password);

    const passwordHash = hashPassword(input.password);
    const existingUser = await prisma.user.findUnique({
      where: {
        id: challenge.userId
      },
      select: {
        googleSub: true
      }
    });

    const user = await prisma.user.update({
      where: {
        id: challenge.userId
      },
      data: {
        passwordHash,
        emailVerifiedAt: now(),
        authProvider: authProviderForUser({ passwordHash, googleSub: existingUser?.googleSub ?? null }),
        lastLoginAt: now()
      }
    });

    await prisma.authChallenge.update({
      where: {
        id: challenge.id
      },
      data: {
        consumedAt: now()
      }
    });

    this.syncMirrorUser(user);
    const sessionToken = await this.createSession(user.id);
    const account = await this.accountForUser(user.id);

    if (!account) {
      throw new SceneAtlasError("Failed to resolve account.", "STATE_ERROR");
    }

    return {
      account,
      sessionToken,
      usage: account.usage
    };
  }

  async googleSignIn(input: GoogleOAuthInput): Promise<AuthResult> {
    if (!input.emailVerified) {
      throw new SceneAtlasError("Google did not verify that email address.", "FORBIDDEN");
    }

    const email = normalizeEmail(input.email);
    const existingByGoogle = await prisma.user.findFirst({
      where: {
        googleSub: input.googleSub
      }
    });
    const existingByEmail = existingByGoogle
      ? null
      : await prisma.user.findUnique({
          where: {
            email
          }
        });

    const baseData = {
      email,
      name: input.name.trim() || displayNameFromEmail(email),
      image: normalizeAvatar(input.avatar),
      emailVerifiedAt: now(),
      lastLoginAt: now()
    };

    const user = existingByGoogle
      ? await prisma.user.update({
          where: {
            id: existingByGoogle.id
          },
          data: {
            ...baseData,
            googleSub: input.googleSub,
            authProvider: authProviderForUser({
              passwordHash: existingByGoogle.passwordHash,
              googleSub: input.googleSub
            })
          }
        })
      : existingByEmail
        ? await prisma.user.update({
            where: {
              id: existingByEmail.id
            },
            data: {
              ...baseData,
              googleSub: input.googleSub,
              authProvider: authProviderForUser({
                passwordHash: existingByEmail.passwordHash,
                googleSub: input.googleSub
              })
            }
          })
        : await prisma.user.create({
            data: {
              ...baseData,
              googleSub: input.googleSub,
              authProvider: "google"
            }
          });

    this.syncMirrorUser(user);
    const sessionToken = await this.createSession(user.id);
    const account = await this.accountForUser(user.id);

    if (!account) {
      throw new SceneAtlasError("Failed to resolve account.", "STATE_ERROR");
    }

    return {
      account,
      sessionToken,
      usage: account.usage
    };
  }

  async me(sessionToken: string) {
    const user = await this.getUserBySession(sessionToken);
    if (!user) {
      return null;
    }

    this.syncMirrorUser(user);
    return this.accountForUser(user.id);
  }

  async signOut(sessionToken: string) {
    if (sessionToken) {
      await prisma.authSession.updateMany({
        where: {
          tokenHash: hashToken(sessionToken),
          revokedAt: null
        },
        data: {
          revokedAt: now()
        }
      });
    }

    return { ok: true as const };
  }
}
