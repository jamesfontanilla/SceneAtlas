import { Body, Controller, Get, Headers, Post } from "@nestjs/common";
import { resolveSceneAtlasUserId } from "../../common/sceneatlas-request";
import { AuthService } from "./auth.service";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("sign-up")
  signUp(@Body() body: { name: string; email: string; avatar?: string; provider?: string }) {
    return this.authService.signUp(body);
  }

  @Post("sign-in")
  signIn(@Body() body: { email: string; avatar?: string; provider?: string; name?: string }) {
    return this.authService.signIn({
      email: body.email,
      avatar: body.avatar,
      provider: body.provider
    });
  }

  @Post("sign-out")
  signOut(@Headers("x-sceneatlas-session") sessionToken = "") {
    return this.authService.signOut(sessionToken);
  }

  @Get("me")
  me(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    const resolved = resolveSceneAtlasUserId(sessionToken, userId);
    return this.authService.me(resolved);
  }
}
