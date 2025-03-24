import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const registerUser = async (req: Request, res: Response): Promise<any> => {
    const { nome, email, password, cpf, type_user } = req.body;
    try {
        const senha = await bcrypt.hash(password, 10);
        const response = await prisma.registro.create({
            data: { nome, email, senha, cpf, type_user },
        });
        const token = jwt.sign({ userId: response.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
        return res.status(201).json({ token, user: { ...response, senha: undefined } });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao registrar usuário", error });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<any> => {
    const { login, password } = req.body;
    try {
        const user = await findUser(login);
        if (!user) return res.status(400).json({ message: "Email ou CPF inválido" });
        const passwordMatch = await bcrypt.compare(password, user.senha);
        if (!passwordMatch) return res.status(401).json({ message: "Senha inválida" });
        const wallet = await prisma.wallet.findUnique({ where: { user_id: user.id } });
        const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });  
        return res.status(200).json({ token, user: { ...user, senha: undefined }, wallet });
    } catch (error) {
        return res.status(500).json({ message: "Erro ao logar usuário", error });
    }
};

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

const findUser = async (login: string) => {
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login)) {
        return await prisma.registro.findUnique({ where: { email: login } });
    }
    if (/^\d{11}$/.test(login)) {
        return await prisma.registro.findUnique({ where: { cpf: login } });
    }
    if (/^\d+$/.test(login)) {
        return await prisma.registro.findUnique({ where: { id: parseInt(login) } });
    }
    return null;
};