import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";

export const followingController = {
    async follow(req: Request, res: Response){
        try{
            if (typeof req.body.user === 'undefined') {
                return responseData.resBadRequest(res, 'User is required.')
            }
            await prisma.follows.create({
                data:{
                    followingId:req.body?.user,
                    followerId: req.body?.payload.userId
                }
            })
            return responseData.resUpdate(res, 'follow')
        }catch(err){
            return responseData.resBadRequest(res, 'Faield')
        }
    },

    async unfollow(req: Request, res: Response){
        try{
            if (typeof req.body.user === 'undefined') {
                return responseData.resBadRequest(res, 'User is required.')
            }
            await prisma.follows.delete({
                where:{
                    id: req.body?.id
                }
            })
            return responseData.resUpdate(res, 'unfollow')
        }catch(err){
            return responseData.resBadRequest(res, 'Faield')
        }
    }
}

export default followingController