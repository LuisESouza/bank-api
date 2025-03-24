import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const walletDeposit = async (req: Request, res: Response): Promise<any> => {
    const { user_id } = req.params;
    const { saldo } = req.body;
    try {
        await prisma.wallet.update({
            where: { user_id: parseInt(user_id) },
            data: {
                saldo: {increment: parseFloat(saldo)},
                updated_at: new Date()
            }
        });
        return res.status(200).json({ message: "Dinheiro depositado com sucesso!" });
    } catch (error) {
        res.status(500).json({ message: "Erro interno ao depositar dinheiro!", error });
    }
};

export const walletTransfer = async(req: Request, res: Response) => {
    const { payer, payee} = req.body;
    try{
        
    }catch(error){
        return res.status(500).json({ message: "Erro interno ao fazer tranferencia!", error })
    }
}