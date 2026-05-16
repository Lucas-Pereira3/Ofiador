CREATE TABLE empresa (
	id_empresa SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	cnpj VARCHAR(20) NOT NULL UNIQUE,
	email VARCHAR(100) UNIQUE NOT NULL,
	endereco TEXT,
	telefone VARCHAR(20)
);

CREATE TABLE usuario(
	id_usuario SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	login VARCHAR(100) UNIQUE NOT NULL,
	senha_hash VARCHAR(250) NOT NULL
);

CREATE TABLE cliente (
	id_cliente SERIAL PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	cpf_cnpj VARCHAR(20) NOT NULL UNIQUE,
	telefone VARCHAR(20),
	email VARCHAR(100) NOT NULL,
	endereco TEXT,
	limite DECIMAL(10,2),
	id_empresa INT NOT NULL,
	FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE fatura(
	id_fatura SERIAL PRIMARY KEY,
	data_geracao DATE,
	valor_total DECIMAL(10,2),
	status VARCHAR(20),
	id_cliente INT,
	FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente)
);

CREATE TABLE compra (
	id_compra SERIAL PRIMARY KEY,
	data_compra DATE,
	valor_total DECIMAL(10,2),
	data_venciomento DATE,
	parcelas INT,
	parcelas_pagas INT,
	id_cliente INT,
	id_empresa INT,
	FOREIGN KEY (id_cliente) REFERENCES cliente(id_cliente),
	FOREIGN KEY (id_empresa) REFERENCES empresa(id_empresa)
);

CREATE TABLE compra_parcela(
	id_compra_parcela SERIAL PRIMARY KEY,
	id_compra INT NOT NULL,
	id_fatura INT NOT NULL,
	numero_parcelas INT NOT NULL,
	valor_parcela NUMERIC(10,2) NOT NULL,
	pago BOOLEAN NOT NULL DEFAULT FALSE,
	data_pagamento TIMESTAMP NULL,
	CONSTRAINT fk_parcela_compra FOREIGN KEY (id_compra) REFERENCES compras(id_compra),
	CONSTRAINT fk_parcela_fatura FOREIGN KEY (id_fatura) REFERENCES faturas(id_fatura)
);

CREATE TABLE pagamento (
	id_pagamento SERIAL PRIMARY KEY,
	data_pagamento DATE,
	valorpago DECIMAL(10,2),
	id_fatura INT,
	FOREIGN KEY (id_fatura) REFERENCES fatura(id_fatura)
);