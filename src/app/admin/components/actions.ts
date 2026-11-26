"use server";

import { cookies } from "next/headers";

import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  createAdminToken,
  passwordMatches,
} from "@/lib/admin-session";

export async function validarAdminSenha(senha: string) {
  if (typeof senha !== "string" || !passwordMatches(senha)) {
    // pequeno atraso para dificultar tentativas em sequência
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { sucesso: false };
  }

  const token = createAdminToken();

  if (!token) {
    return { sucesso: false };
  }

  const cookieStore = await cookies();

  cookieStore.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: ADMIN_SESSION_SECONDS,
    path: "/",
  });

  return { sucesso: true };
}
