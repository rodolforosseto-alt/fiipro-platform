-- Documenta a tabela public.acessos_fundos, que já existe no banco (foi criada fora das migrations).
-- Idempotente: se for executada, não altera o que já existe.

create table if not exists public.acessos_fundos (
    id uuid primary key default gen_random_uuid(),
    fundo_id uuid references public.fundos(id),
    ticker text not null,
    data_acesso timestamp with time zone default now()
);

create index if not exists idx_acessos_fundos_ticker
    on public.acessos_fundos using btree (ticker);

alter table public.acessos_fundos enable row level security;

do $$
begin
    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'acessos_fundos'
          and policyname = 'Permitir registro de acessos'
    ) then
        create policy "Permitir registro de acessos"
            on public.acessos_fundos for insert to anon with check (true);
    end if;

    if not exists (
        select 1 from pg_policies
        where schemaname = 'public' and tablename = 'acessos_fundos'
          and policyname = 'Permitir leitura de acessos'
    ) then
        create policy "Permitir leitura de acessos"
            on public.acessos_fundos for select to anon using (true);
    end if;
end
$$;
