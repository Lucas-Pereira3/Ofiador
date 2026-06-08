-- =============================================================
--  SEED — Dados para teste da tela de Relatórios (OFIADOR)
--  Execute APÓS as migrations estarem aplicadas.
--
--  Senha do usuário admin: admin123
--  Para gerar o hash correto execute em PowerShell depois que
--  o container subir:
--    curl -X POST http://localhost:8080/api/auth/register \
--         -H "Content-Type: application/json" \
--         -d '{"nome":"Admin","login":"admin","senha":"admin123"}'
--  (ou use o hash abaixo, gerado com BCrypt work-factor 11)
-- =============================================================

-- ======================== LIMPAR ============================
-- (ordem reversa das FKs)
DELETE FROM "Pagamentos";
DELETE FROM "compra_parcela";
DELETE FROM "fatura";
DELETE FROM "Compras";
DELETE FROM "Clientes";
DELETE FROM "Empresas";
DELETE FROM "Usuarios";

-- Resetar sequences
ALTER SEQUENCE "Empresas_IdEmpresa_seq"       RESTART WITH 1;
ALTER SEQUENCE "Clientes_IdCliente_seq"        RESTART WITH 1;
ALTER SEQUENCE "Compras_IdCompra_seq"          RESTART WITH 1;
ALTER SEQUENCE "fatura_id_fatura_seq"          RESTART WITH 1;
ALTER SEQUENCE "compra_parcela_id_compra_parcela_seq" RESTART WITH 1;
ALTER SEQUENCE "Pagamentos_IdPagamento_seq"    RESTART WITH 1;
ALTER SEQUENCE "Usuarios_IdUsuario_seq"        RESTART WITH 1;

-- ======================== USUÁRIO ===========================
-- Senha: admin123  (hash BCrypt work-factor 11)
INSERT INTO "Usuarios" ("Nome", "Login", "SenhaHash") VALUES
  ('Administrador', 'admin',
   '$2a$11$K9K7XpyNh5xS9Bj5eReIJ.NKm8XbgVrJqF8S3sYlH2V4DqN4F7FPi');

-- ======================== EMPRESAS ==========================
INSERT INTO "Empresas" ("Nome", "Cnpj", "Email", "Endereco", "Telefone") VALUES
  ('Americanas S.A.',    '12.345.678/0001-00', 'contato@americanas.com.br',  'Rua das Flores, 100 - Rio de Janeiro/RJ', '(21) 3000-1000'),
  ('Casas Bahia Ltda.',  '98.765.432/0001-00', 'contato@casasbahia.com.br',  'Av. Paulista, 500 - São Paulo/SP',         '(11) 4000-2000');

-- ======================== CLIENTES ==========================
-- IdEmpresa 1 = Americanas, 2 = Casas Bahia
INSERT INTO "Clientes" ("Nome", "Cpf_Cnpj", "Telefone", "Email", "Endereco", "Limite", "IdEmpresa") VALUES
  -- Americanas
  ('Matheus Ricordi Sossai',  '12276370980', '(27) 99100-1111', 'matheus@email.com',  'Rua A, 10 - Vitória/ES',      1500.00, 1),
  ('Ana Paula Ferreira',       '98765432100', '(11) 98200-2222', 'ana@email.com',      'Rua B, 20 - São Paulo/SP',     2000.00, 1),
  ('Roberto Silva Santos',     '55566677788', '(21) 97300-3333', 'roberto@email.com', 'Rua E, 50 - Rio de Janeiro/RJ', 3000.00, 1),
  -- Casas Bahia
  ('Carlos Eduardo Lima',      '11122233344', '(31) 96400-4444', 'carlos@email.com',  'Rua C, 30 - Belo Horizonte/MG', 1000.00, 2),
  ('Fernanda Costa Oliveira',  '44455566677', '(41) 95500-5555', 'fernanda@email.com','Rua D, 40 - Curitiba/PR',       2500.00, 2);

-- ======================== COMPRAS ===========================
-- IdCliente: 1=Matheus, 2=Ana Paula, 3=Roberto, 4=Carlos, 5=Fernanda
INSERT INTO "Compras" ("Valor_Total", "Data_Compra", "DataPrimeiroVencimento", "Parcelas", "ParcelasPagas", "IdCliente", "IdEmpresa") VALUES
  -- Matheus: R$300 em 3x — 1 parcela paga (Em dia)
  (300.00, '2026-03-01 00:00:00+00', '2026-04-01 00:00:00+00', 3, 1, 1, 1),
  -- Ana Paula: R$600 em 3x — totalmente paga (Pago)
  (600.00, '2025-11-01 00:00:00+00', '2025-12-01 00:00:00+00', 3, 3, 2, 1),
  -- Roberto: R$200 em 1x — pago (para testar consolidação no Geral)
  (200.00, '2026-02-01 00:00:00+00', '2026-03-01 00:00:00+00', 1, 1, 3, 1),
  -- Roberto: R$100 em 1x — pendente (Em dia)
  (100.00, '2026-05-01 00:00:00+00', '2026-09-01 00:00:00+00', 1, 0, 3, 1),
  -- Carlos: R$150 em 1x — vence em 4 dias (Vence em breve)
  (150.00, '2026-05-10 00:00:00+00', '2026-06-12 00:00:00+00', 1, 0, 4, 2),
  -- Fernanda: R$400 em 2x — ambas atrasadas (Atrasado)
  (400.00, '2026-03-01 00:00:00+00', '2026-05-01 00:00:00+00', 2, 0, 5, 2);

-- ======================== FATURAS ===========================
-- Campos: id_cliente, valor_total, vencimento, parcelas, status, mes_referencia, data_geracao, ClienteIdCliente
-- status: 'Pendente' = aparece em contas-a-receber | 'PAGO' = aparece em contas-pagas (histórico)
INSERT INTO "fatura"
  ("id_cliente", "valor_total", "vencimento", "parcelas", "status",
   "mes_referencia", "data_geracao", "ClienteIdCliente")
VALUES
  -- Fatura 1: Matheus — Pendente (1 parcela paga, 2 pendentes)
  (1, 300.00, '2026-08-01 00:00:00+00', 3, 'Pendente',
   '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', 1),

  -- Fatura 2: Ana Paula — PAGO (todas parcelas pagas)
  (2, 600.00, '2026-02-01 00:00:00+00', 3, 'PAGO',
   '2025-11-01 00:00:00+00', '2025-11-01 00:00:00+00', 2),

  -- Fatura 3: Roberto — PAGO (compra de R$200 quitada)
  (3, 200.00, '2026-03-01 00:00:00+00', 1, 'PAGO',
   '2026-02-01 00:00:00+00', '2026-02-01 00:00:00+00', 3),

  -- Fatura 4: Roberto — Pendente (compra de R$100)
  (3, 100.00, '2026-09-01 00:00:00+00', 1, 'Pendente',
   '2026-05-01 00:00:00+00', '2026-05-01 00:00:00+00', 3),

  -- Fatura 5: Carlos — Pendente (vence em breve)
  (4, 150.00, '2026-06-12 00:00:00+00', 1, 'Pendente',
   '2026-05-01 00:00:00+00', '2026-05-10 00:00:00+00', 4),

  -- Fatura 6: Fernanda — Pendente (atrasada)
  (5, 400.00, '2026-05-01 00:00:00+00', 2, 'Pendente',
   '2026-03-01 00:00:00+00', '2026-03-01 00:00:00+00', 5);

-- ==================== COMPRA_PARCELA ========================
-- Campos: id_compra, id_fatura, numero_parcelas, valor_parcela,
--         data_vencimento, status, pago, data_pagamento, created_at, updated_at
-- status enum: 1=Pendente, 2=Pago, 3=Atrasado, 4=Renegociado

-- --- Matheus (fatura 1, compra 1) ---
-- Parcela 1: PAGA
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "data_pagamento", "created_at")
VALUES
  (1, 1, 1, 100.00, '2026-04-01 00:00:00+00', 2, TRUE,
   '2026-04-05 10:00:00+00', '2026-03-01 00:00:00+00');

-- Parcela 2: Pendente (Em dia — vence em 2026-07-01)
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "created_at")
VALUES
  (1, 1, 2, 100.00, '2026-07-01 00:00:00+00', 1, FALSE,
   '2026-03-01 00:00:00+00');

-- Parcela 3: Pendente (Em dia — vence em 2026-08-01)
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "created_at")
VALUES
  (1, 1, 3, 100.00, '2026-08-01 00:00:00+00', 1, FALSE,
   '2026-03-01 00:00:00+00');

-- --- Ana Paula (fatura 2, compra 2) — todas pagas ---
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "data_pagamento", "created_at")
VALUES
  (2, 2, 1, 200.00, '2025-12-01 00:00:00+00', 2, TRUE,
   '2025-12-03 09:00:00+00', '2025-11-01 00:00:00+00'),
  (2, 2, 2, 200.00, '2026-01-01 00:00:00+00', 2, TRUE,
   '2026-01-04 09:00:00+00', '2025-11-01 00:00:00+00'),
  (2, 2, 3, 200.00, '2026-02-01 00:00:00+00', 2, TRUE,
   '2026-02-03 09:00:00+00', '2025-11-01 00:00:00+00');

-- --- Roberto — compra 3 (fatura 3): paga ---
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "data_pagamento", "created_at")
VALUES
  (3, 3, 1, 200.00, '2026-03-01 00:00:00+00', 2, TRUE,
   '2026-03-02 11:00:00+00', '2026-02-01 00:00:00+00');

-- --- Roberto — compra 4 (fatura 4): pendente (Em dia) ---
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "created_at")
VALUES
  (4, 4, 1, 100.00, '2026-09-01 00:00:00+00', 1, FALSE,
   '2026-05-01 00:00:00+00');

-- --- Carlos (fatura 5, compra 5): vence em 2026-06-12 = Vence em breve ---
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "created_at")
VALUES
  (5, 5, 1, 150.00, '2026-06-12 00:00:00+00', 1, FALSE,
   '2026-05-10 00:00:00+00');

-- --- Fernanda (fatura 6, compra 6): atrasadas ---
-- Parcela 1: venceu 2026-05-01 (38 dias atrás)
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "created_at")
VALUES
  (6, 6, 1, 200.00, '2026-05-01 00:00:00+00', 3, FALSE,
   '2026-03-01 00:00:00+00');

-- Parcela 2: venceu 2026-06-01 (7 dias atrás)
INSERT INTO "compra_parcela"
  ("id_compra", "id_fatura", "numero_parcelas", "valor_parcela",
   "data_vencimento", "status", "pago", "created_at")
VALUES
  (6, 6, 2, 200.00, '2026-06-01 00:00:00+00', 3, FALSE,
   '2026-03-01 00:00:00+00');

-- ======================== PAGAMENTOS ========================
-- Histórico real de pagamentos (usado pela aba "Contas Pagas")

-- Matheus: 1 pagamento (parcela 1 — Pix)
INSERT INTO "Pagamentos" ("Data_Pagamento", "ValorPago", "IdFatura", "MetodoPagamento")
VALUES ('2026-04-05 10:00:00+00', 100.00, 1, 'Pix');

-- Ana Paula: 3 pagamentos (Cartão, Boleto, Dinheiro)
INSERT INTO "Pagamentos" ("Data_Pagamento", "ValorPago", "IdFatura", "MetodoPagamento")
VALUES
  ('2025-12-03 09:00:00+00', 200.00, 2, 'Cartão de Crédito'),
  ('2026-01-04 09:00:00+00', 200.00, 2, 'Boleto'),
  ('2026-02-03 09:00:00+00', 200.00, 2, 'Dinheiro');

-- Roberto: 1 pagamento (Transferência)
INSERT INTO "Pagamentos" ("Data_Pagamento", "ValorPago", "IdFatura", "MetodoPagamento")
VALUES ('2026-03-02 11:00:00+00', 200.00, 3, 'Transferência');

-- =============================================================
--  RESUMO ESPERADO NOS RELATÓRIOS
-- =============================================================
--
--  CONTAS A RECEBER (faturas com status != 'PAGO'):
--  ┌──────────────────────┬─────────────┬────────────┬──────────────┬────────────────┐
--  │ Cliente              │ Total Dívida│ Valor Pago │ Saldo Devedor│ Status         │
--  ├──────────────────────┼─────────────┼────────────┼──────────────┼────────────────┤
--  │ Matheus Ricordi S.   │  R$ 300,00  │  R$ 100,00 │  R$ 200,00   │ Em dia         │
--  │ Roberto Silva S.     │  R$ 100,00  │  R$   0,00 │  R$ 100,00   │ Em dia         │
--  │ Carlos Eduardo L.    │  R$ 150,00  │  R$   0,00 │  R$ 150,00   │ Vence em breve │
--  │ Fernanda Costa O.    │  R$ 400,00  │  R$   0,00 │  R$ 400,00   │ Atrasado       │
--  └──────────────────────┴─────────────┴────────────┴──────────────┴────────────────┘
--
--  CONTAS PAGAS (histórico de pagamentos individuais):
--  ┌──────────────────────┬─────────────┬──────────────┬──────────────────────┐
--  │ Cliente              │ Referência  │ Valor Pago   │ Método               │
--  ├──────────────────────┼─────────────┼──────────────┼──────────────────────┤
--  │ Matheus Ricordi S.   │ 03/2026     │  R$ 100,00   │ Pix                  │
--  │ Ana Paula Ferreira   │ 11/2025     │  R$ 200,00   │ Cartão de Crédito    │
--  │ Ana Paula Ferreira   │ 11/2025     │  R$ 200,00   │ Boleto               │
--  │ Ana Paula Ferreira   │ 11/2025     │  R$ 200,00   │ Dinheiro             │
--  │ Roberto Silva S.     │ 02/2026     │  R$ 200,00   │ Transferência        │
--  └──────────────────────┴─────────────┴──────────────┴──────────────────────┘
--
--  RELATÓRIO GERAL (consolidado por cliente — cada cliente aparece 1 vez):
--  ┌──────────────────────┬─────────────┬────────────┬──────────────┬────────────────┐
--  │ Cliente              │ Total Dívida│ Valor Pago │ Saldo Devedor│ Status         │
--  ├──────────────────────┼─────────────┼────────────┼──────────────┼────────────────┤
--  │ Matheus Ricordi S.   │  R$ 300,00  │  R$ 100,00 │  R$ 200,00   │ Em dia         │
--  │ Ana Paula Ferreira   │  R$ 600,00  │  R$ 600,00 │  R$   0,00   │ Pago           │
--  │ Roberto Silva S.     │  R$ 300,00  │  R$ 200,00 │  R$ 100,00   │ Em dia         │  ← consolidado!
--  │ Carlos Eduardo L.    │  R$ 150,00  │  R$   0,00 │  R$ 150,00   │ Vence em breve │
--  │ Fernanda Costa O.    │  R$ 400,00  │  R$   0,00 │  R$ 400,00   │ Atrasado       │
--  └──────────────────────┴─────────────┴────────────┴──────────────┴────────────────┘
--
--  TAXA DE RECEBIMENTO (aba Geral):
--    Total Negociado = R$ 1.750,00
--    Total Recebido  = R$   900,00
--    Taxa            = 51,43%
-- =============================================================
