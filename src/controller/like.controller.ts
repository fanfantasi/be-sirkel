import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";

export const likeController = {
    async upsert(req: any, res: Response){
        try{
            let result:any;
            if (typeof req.body.id === 'undefined') {
                result = await prisma.likes.create({
                    data:{
                        postId: req.body?.postId,
                        authorId: req.body?.payload.userId
                    }
                })
            }else{
                result = await prisma.likes.delete({
                    where:{
                        id: req.body?.id
                    },
                })
            }
            return responseData.resCreatedReturn(res, 'liked', result)
        }catch(err){
            console.log(err);
            return responseData.resBadRequest(res, 'Faield')
        }
    }
}

export default likeController