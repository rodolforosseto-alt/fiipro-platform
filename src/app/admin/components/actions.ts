"use server";

import { cookies } from "next/headers";

import { revalidatePath } from "next/cache";

import {
  ADMIN_COOKIE,
  ADMIN_SESSION_SECONDS,
  createAdminToken,
  passwordMatches,
  requireAdmin,
} from "@/lib/admin-session";

import { getSupabaseAdmin } from "@/lib/supabase-admin";

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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Ativa ou desativa um fundo (coluna `ativo`). Não apaga nada: o fundo desativado
 * deixa de aparecer no site e de ser atualizado pelas rotinas de cron.
 */
export async function alterarAtivoFundo(fundoId: string, ativo: boolean) {
  try {
    await requireAdmin();

    if (typeof fundoId !== "string" || !UUID.test(fundoId) || typeof ativo !== "boolean") {
      return { sucesso: false, erro: "Dados inválidos" };
    }

    const supabase = getSupabaseAdmin();
    const { error } = await supabase.from("fundos").update({ ativo }).eq("id", fundoId);

    if (error) {
      return { sucesso: false, erro: error.message };
    }

    revalidatePath("/admin/dashboard");
    revalidatePath("/fundos");
    revalidatePath("/");

    return { sucesso: true };
  } catch {
    return { sucesso: false, erro: "Acesso não autorizado" };
  }
}
