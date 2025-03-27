-- TABLES
CREATE TABLE REGISTRO (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    type_user VARCHAR(10) NOT NULL CHECK (type_user IN ('lojista', 'comum'))
);

CREATE TABLE PERFIL (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    nome VARCHAR(255) NOT NULL,
    cpf VARCHAR(11) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    type_user VARCHAR(255) NOT NULL,
    FOREIGN KEY (user_id) REFERENCES REGISTRO(id) ON DELETE CASCADE
);

CREATE TABLE WALLET (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    saldo DECIMAL(10,2) DEFAULT 0.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES PERFIL(user_id) ON DELETE CASCADE
);

CREATE TABLE TRANSACTIONS (
    id SERIAL PRIMARY KEY,
    payer_id INT NOT NULL,
    payee_id INT NOT NULL,
    valor DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) DEFAULT 'pendente',
    FOREIGN KEY (payer_id) REFERENCES WALLET(user_id) ON DELETE CASCADE,
    FOREIGN KEY (payee_id) REFERENCES WALLET(user_id) ON DELETE CASCADE
);

-- FUNCTIONS
CREATE OR REPLACE FUNCTION CREATE_PROFILE()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO PERFIL (user_id, nome, cpf, email, type_user)
    VALUES (NEW.id, NEW.nome, NEW.cpf, NEW.email, NEW.type_user);
    
    INSERT INTO WALLET (user_id, saldo) VALUES (NEW.id, 0.00);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


--RETURN 0 = ERRO/ RETURN 1 = SUCESSO
CREATE OR REPLACE FUNCTION TRANSFERIR_SALDO(payer INT, payee INT, valor DECIMAL)
RETURNS INT AS $$
DECLARE
    saldo_atual DECIMAL(10,2);
    tipo_usuario VARCHAR(10);
BEGIN
    SELECT type_user INTO tipo_usuario FROM REGISTRO WHERE id = payer;
    IF tipo_usuario IS NULL THEN
        RETURN 0;
    END IF;

    IF tipo_usuario = 'lojista' THEN
        RETURN 0;
    END IF;

    SELECT saldo INTO saldo_atual FROM WALLET WHERE user_id = payer;
    IF saldo_atual IS NULL THEN
        RETURN 0;
    END IF;

    IF saldo_atual < valor THEN
        RETURN 0;
    END IF;

    UPDATE WALLET SET saldo = saldo - valor, updated_at = CURRENT_TIMESTAMP WHERE user_id = payer;
    UPDATE WALLET SET saldo = saldo + valor, updated_at = CURRENT_TIMESTAMP WHERE user_id = payee;
    INSERT INTO TRANSACTIONS (payer_id, payee_id, valor, status)
    VALUES (payer, payee, valor, 'sucesso');
    RETURN 1;
END;
$$ LANGUAGE plpgsql;

-- TRIGGERS
CREATE TRIGGER TRIGGER_PROFILE
AFTER INSERT ON REGISTRO
FOR EACH ROW
EXECUTE FUNCTION CREATE_PROFILE();

-- TESTANDO TRANSFERÊNCIA
-- SELECT transferir_saldo(1, 2, 50.00);