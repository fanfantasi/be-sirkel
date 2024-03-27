import { NextFunction, Request, Response } from "express";
const jwt = require('jsonwebtoken');

export const isAuth = {
    async isAuthenticated(req:Request, res: Response, next: NextFunction){
        const { authorization } = req.headers;

        if (!authorization) {
            return res.status(401).json({
                error   : "Unauthorized",
                message : "🚫 Un-Authorized 🚫."
            });
        }

        try {
            const token = authorization.split(' ')[1];
            const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
            req.body.payload = payload;
        } catch (err:any) {
            if (err.name === 'TokenExpiredError') {
                return res.status(401).json({
                    error   : "Unauthorized",
                    message : 'Token Expired Error'
                });
            }
            return res.status(401).json({
                error   : "Unauthorized",
                message : "🚫 Un-Authorized 🚫."
            });
        }
    
        return next();
    }
}

export default isAuth;