import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";
import type { AccountSnapshot, UsageSnapshot } from "@sceneatlas/shared";

export interface AuthInput {
  name: string;
  email: string;
  avatar?: string;
  provider?: string;
}

export interface AuthResult {
  account: AccountSnapshot;
  sessionToken: string;
  usage: UsageSnapshot;
}

@Injectable()
export class AuthService {
  signUp(input: AuthInput): AuthResult {
    const { session, user, usage } = sceneAtlasStore.signUp(input);
    const account = sceneAtlasStore.getAccount(user.id);
    if (!account) {
      throw new Error("Failed to create account.");
    }

    return {
      account,
      sessionToken: session.token,
      usage
    };
  }

  signIn(input: Omit<AuthInput, "name">): AuthResult {
    const { session, user, usage } = sceneAtlasStore.signIn(input);
    const account = sceneAtlasStore.getAccount(user.id);
    if (!account) {
      throw new Error("Failed to resolve account.");
    }

    return {
      account,
      sessionToken: session.token,
      usage
    };
  }

  me(userId: string) {
    return sceneAtlasStore.getAccount(userId);
  }

  signOut(sessionToken: string) {
    sceneAtlasStore.signOut(sessionToken);
    return { ok: true };
  }
}
