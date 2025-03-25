import { PrismaClient, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

export const processTransaction = async (
    payerId: number,
    payeeId: number,
    value: number
) => {
    const transferValue = new Prisma.Decimal(value);

    return prisma.$transaction([
        prisma.wallet.update({
            where: { user_id: payerId },
            data: { saldo: { decrement: transferValue } }
        }),
        prisma.wallet.update({
            where: { user_id: payeeId },
            data: { saldo: { increment: transferValue } }
        }),
        prisma.transactions.create({
            data: { payer_id: payerId, payee_id: payeeId, valor: transferValue, status: "sucesso" }
        })
    ]);
};