import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-up")
  async signUp(@Body() body: { name: string; email: string; password: string; avatar?: string }) {
    return this.authService.signUp(body);
  }

  @Post("verify-email")
  async verifyEmail(@Body() body: { email: string; code: string }) {
    return this.authService.verifyEmail(body);
  }

  @Post("resend-verification")
  async resendVerification(@Body() body: { email: string }) {
    return this.authService.resendVerification(body);
  }

  @Post("sign-in")
  async signIn(@Body() body: { email: string; password: string }) {
    return this.authService.signIn(body);
  }

  @Post("forgot-password")
  async forgotPassword(@Body() body: { email: string }) {
    return this.authService.forgotPassword(body);
  }

  @Post("reset-password")
  async resetPassword(@Body() body: { token: string; password: string }) {
    return this.authService.resetPassword(body);
  }

  @Post("google")
  async google(@Body() body: { googleSub: string; email: string; name: string; avatar?: string; emailVerified: boolean }) {
    return this.authService.googleSignIn(body);
  }

  @Post("sign-out")
  async signOut(@Headers("x-sceneatlas-session") sessionToken = "") {
    return this.authService.signOut(sessionToken);
  }

  @Get("me")
  async me(@Headers("x-sceneatlas-session") sessionToken = "") {
    return this.authService.me(sessionToken);
  }
}
