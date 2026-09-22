alter table public.dividendos

add constraint dividendos_unique_payment

unique
(
fundo_id,
data_pagamento,
valor
);