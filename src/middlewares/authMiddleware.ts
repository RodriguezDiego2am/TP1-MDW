import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JwtPayload } from "../types/types";

const SECRET_KEY = process.env.JWT_SECRET!;
const jwtAccessExpiresIn = process.env.JWT_EXPIRES_IN!;
const jwtRefreshSecret = process.env.JWT_REFRESH_SECRET!;

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.accessToken;
    
    if (!token) {
        // Si no hay accessToken, intentar renovar con refreshToken
        return validateRefreshToken(req, res, next);
    }
    
    try {
        const decoded = jwt.verify(token, SECRET_KEY) as any;
        // Agregar información del usuario al request para uso posterior
        (req as any).user = decoded;
        next();
    } catch (error) {
        // Si el accessToken es inválido o expiró, intentar renovar
        validateRefreshToken(req, res, next);
    }
};

const validateRefreshToken = (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({ message: "No autenticado. Token requerido." });
    }

    try {
        const decoded = jwt.verify(refreshToken, jwtRefreshSecret) as any;

        // Crear nuevo accessToken con los datos correctos
        const newAccessToken = jwt.sign(
            { 
                userId: decoded.userId, 
                email: decoded.email 
            }, 
            SECRET_KEY, 
            { expiresIn: jwtAccessExpiresIn }
        );

        // Configurar la cookie del nuevo accessToken
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        // Agregar información del usuario al request
        (req as any).user = decoded;
        
        console.log("AccessToken renovado exitosamente"); // Debug log temporal
        next();
    } catch (err) {
        console.error("Error al validar refreshToken:", err); // Debug log
        return res.status(401).json({ 
            message: "Token de actualización inválido. Por favor, inicia sesión nuevamente." 
        });
    }
};