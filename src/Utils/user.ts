import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const findUser = async (login: string) => {
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
