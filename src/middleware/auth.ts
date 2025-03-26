import { Request, Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: { id: number };
}

export const auth = (req: AuthRequest, res: Response, next: NextFunction): void => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];
    console.log('Auth:', token);
    if (!token) {
        res.status(401).json({ message: 'Token não fornecido' });
        return;
    }
    try {
        const decoded = jsonwebtoken.verify(token, process.env.JWT_SECRET!) as { id: number };
        if (!decoded.id) {
            res.status(401).json({ message: 'Token inválido, ID não encontrado' });
            return;
        }
        req.user = decoded; 
        return next();
    } catch (error) {
        res.status(401).json({ message: 'Token não é válido' });
    }
};