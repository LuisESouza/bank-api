import { hashPassword, comparePassword } from "../Utils/crypto";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import { findUser } from "../Utils/user"; 
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

/**
 * Registra um novo usuário.
 * 
 * Este método cria um novo usuário no banco de dados, criptografa a senha fornecida
 * e gera um token JWT para o usuário autenticado.
 * 
 * @param {Request} req - Objeto da requisição contendo os dados do usuário.
 * @param {Response} res - Objeto da resposta para enviar a resposta ao cliente.
 * @returns {Promise<any>} - Retorna uma resposta com o token JWT e os dados do usuário (sem a senha).
 */
export const registerUser = async (req: Request, res: Response): Promise<any> => {
    const { nome, email, password, cpf, type_user } = req.body;
    try {
        const senha = await hashPassword(password);
        const response = await prisma.registro.create({
            data: { nome, email, senha, cpf, type_user },
        });
        const token = jwt.sign({ userId: response.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
        return res.status(201).json({ token, user: { ...response, senha: undefined } });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao registrar usuário", error });
    }
};

/**
 * Realiza o login de um usuário.
 * 
 * Este método busca um usuário no banco de dados utilizando o login (email ou CPF)
 * e valida a senha fornecida. Caso os dados sejam válidos, um token JWT é gerado.
 * 
 * @param {Request} req - Objeto da requisição contendo o login e a senha do usuário.
 * @param {Response} res - Objeto da resposta para enviar a resposta ao cliente.
 * @returns {Promise<any>} - Retorna um token JWT e os dados do usuário, incluindo a carteira, caso haja.
 */
export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { login, password } = req.body;
    try {
        const user = await findUser(login);
        if (!user) return res.status(400).json({ message: "Email ou CPF inválido" });
        const passwordMatch = await comparePassword(password, user.senha);
        if (!passwordMatch) return res.status(401).json({ message: "Senha inválida" });
        const wallet = await prisma.wallet.findUnique({ where: { user_id: user.id } });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
        return res.status(200).json({ token, user: { ...user, senha: undefined }, wallet });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao logar usuário", error });
    }
};

/**
 * Retorna a carteira de um usuário.
 * 
 * Este método busca a carteira associada a um usuário específico pelo `user_id`.
 * 
 * @param {Request} req - Objeto da requisição contendo o ID do usuário.
 * @param {Response} res - Objeto da resposta para enviar a resposta ao cliente.
 * @returns {Promise<any>} - Retorna os dados da carteira do usuário.
 */
export const walletGet = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    try {
        const wallet = await prisma.wallet.findUnique({ where: { user_id: parseInt(user_id) } });
        if (!wallet) return res.status(404).json({ message: "Carteira não encontrada" });
        return res.status(200).json({ wallet });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar carteira", error });
    }
};

/**
 * Busca os dados de um usuário.
 * 
 * Este método retorna os dados de um usuário específico, incluindo a sua carteira
 * associada, se houver.
 * 
 * @param {Request} req - Objeto da requisição contendo o ID do usuário.
 * @param {Response} res - Objeto da resposta para enviar a resposta ao cliente.
 * @returns {Promise<any>} - Retorna os dados do usuário (sem a senha) e a carteira.
 */
export const searchUser = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    try {
        const user = await findUser(user_id);
        if (!user) return res.status(404).json({ message: "Usuário não encontrado" });
        const wallet = await prisma.wallet.findUnique({ where: { user_id: user.id } });
        return res.status(200).json({ user: { ...user, senha: undefined }, wallet });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao buscar perfil", error });
    }
};