import axios from "axios";

export const sendNotification = async (userId: number, message: string) => {
    try {
        await axios.post("https://util.devi.tools/api/v1/notify", { userId, message });
    } catch (error) {
        console.error("Erro ao enviar notificação:", error);
    }
};
