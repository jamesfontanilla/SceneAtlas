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

export interface AccountSyncInput {
  sessionToken?: string;
  displayName?: string;
  email?: string;
  avatar?: string;
  provider?: string;
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

  me(userId: string, input: AccountSyncInput = {}) {
    const account = sceneAtlasStore.getAccount(userId);
    if (account) {
      if (input.sessionToken) {
        sceneAtlasStore.createSession(account.id, input.sessionToken);
      }

      return account;
    }

    if (!input.email) {
      return null;
    }

    const user = sceneAtlasStore.upsertUser({
      id: userId,
      name: input.displayName?.trim() || input.email,
      email: input.email,
      avatar: input.avatar,
      provider: input.provider ?? "clerk"
    });

    if (input.sessionToken) {
      sceneAtlasStore.createSession(user.id, input.sessionToken);
    }

    return sceneAtlasStore.getAccount(user.id);
  }

  signOut(sessionToken: string) {
    sceneAtlasStore.signOut(sessionToken);
    return { ok: true };
  }
}
