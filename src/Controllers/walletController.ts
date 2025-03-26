import { isValidId, isValidNumber } from "../Utils/validation";
import { sendNotification } from "../Utils/notification";
import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";
import axios from "axios";

const prisma = new PrismaClient();

/**
 * Realiza o depósito de saldo na carteira do usuário
 * 
 * Esta função permite que um usuário deposite um valor em sua carteira. 
 * A validação é feita para garantir que o ID do usuário e o valor do depósito sejam válidos.
 * O saldo da carteira é atualizado no banco de dados com o novo valor.
 * 
 * @param {Request} req - A requisição contendo o ID do usuário e o valor a ser depositado.
 * @param {Response} res - A resposta da requisição, que indicará se o depósito foi bem-sucedido ou se ocorreu algum erro.
 * @returns {Promise<any>} - Retorna uma resposta com status 200 se o depósito for bem-sucedido ou um erro em caso de falha.
 */
export const walletDeposit = async (req: Request, res: Response): Promise<any> => {
    try {
        const { saldo } = req.body;
        const user_id = (req as any).user?.id;
        if (!user_id) {
            return res.status(401).json({ message: "Usuário não autenticado!" });
        }
        if (!isValidId(user_id) || !isValidNumber(saldo)) {
            return res.status(400).json({ message: "ID ou valor de depósito inválido!" });
        }
        const userExists = await prisma.registro.findUnique({
            where: { id: user_id }
        });
        if (!userExists) {
            return res.status(404).json({ message: "Usuário não encontrado!" });
        }
        await prisma.wallet.update({
            where: { user_id },
            data: {
                saldo: { increment: parseFloat(saldo) },
                updated_at: new Date(),
            },
        });
        return res.status(200).json({ message: "Depósito realizado com sucesso!" });
    } catch (error) {
        console.error("Erro ao depositar dinheiro:", error);
        return res.status(500).json({ message: "Erro interno ao depositar dinheiro!", error });
    }
};



/**
 * Realiza uma transferência de saldo entre dois usuários
 * 
 * Esta função permite que um usuário (pagador) transfira um valor para outro usuário (destinatário). 
 * São feitas várias validações, como garantir que os IDs de ambos os usuários são válidos, 
 * que o valor da transferência é positivo e que o pagador possui saldo suficiente em sua carteira.
 * A transação também é autorizada por meio de um serviço externo.
 * 
 * @param {Request} req - A requisição contendo os IDs do pagador e destinatário, além do valor da transferência.
 * @param {Response} res - A resposta da requisição, que indicará se a transferência foi bem-sucedida ou se ocorreu algum erro.
 * @returns {Promise<any>} - Retorna uma resposta com status 200 se a transferência for bem-sucedida ou um erro em caso de falha.
 */
export const walletTransfer = async (req: Request, res: Response): Promise<any> => {
    const { payee, value } = req.body;
    const payer = (req as any).user?.id;
    try {
        const payerId = Number(payer);
        const payeeId = Number(payee);
        const transferValue = Number(value);
        if (!isValidId(payerId) || !isValidId(payeeId) || !isValidNumber(transferValue) || transferValue <= 0) {
            return res.status(400).json({ message: "IDs ou valor da transferência inválidos!" });
        }
        const authResponse = await axios.get("https://util.devi.tools/api/v2/authorize");
        const { status, data } = authResponse.data;
        if (!status || !data) {
            return res.status(500).json({ message: "Resposta inválida do serviço externo!" });
        }
        if (status === "error" || (status === "fail" && data.authorization === false)) {
            return res.status(403).json({ message: "Transação não autorizada pelo serviço externo!" });
        }
        const result = await prisma.$queryRaw`SELECT TRANSFERIR_SALDO(${payerId}, ${payeeId}, ${transferValue})`;
        const transferResult = result as [{ transferir_saldo: number }];
        if (transferResult[0].transferir_saldo === 1) {
            await sendNotification(payeeId, "Você recebeu um pagamento!");
            return res.status(200).json({ message: "Transferência realizada com sucesso!" });
        } else {
            return res.status(400).json({ message: "Erro ao realizar a transferência!" });
        }
    } catch (error) {
        return res.status(500).json({ message: "Erro interno ao processar a transferência!", error });
    }
};