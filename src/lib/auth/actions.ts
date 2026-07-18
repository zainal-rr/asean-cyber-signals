"use server";

import { redirect } from "next/navigation";

import {
  applyAuthenticationResult,
  authenticateOwner,
  InvalidCredentialsError,
  signOutOwner,
} from "@/lib/auth/session";
import { AuthConfigurationError } from "@/lib/supabase/config";

export type LoginActionState = {
  error: string | null;
};

export async function loginAction(
  _previousState: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const username = String(formData.get("username") ?? "").slice(0, 160);
  const password = String(formData.get("password") ?? "").slice(0, 1024);

  try {
    const result = await authenticateOwner(username, password);
    await applyAuthenticationResult(result);
  } catch (error) {
    if (error instanceof AuthConfigurationError) {
      return { error: "Sign-in is temporarily unavailable." };
    }
    if (error instanceof InvalidCredentialsError) {
      return { error: "Invalid username or password." };
    }
    return { error: "Unable to sign in. Please try again." };
  }

  redirect("/dashboard");
}

export async function logoutAction() {
  await signOutOwner();
  redirect("/login");
}

