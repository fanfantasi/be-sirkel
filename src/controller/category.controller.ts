import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";
export const categoryController = {
    async upsert(req: Request, res: Response){
        try{
            if (typeof req.body.name === 'undefined') {
                return responseData.resBadRequest(res, 'Category name is required.')
            }

            if (typeof req.body.id === 'undefined') {
                await prisma.category.create({
                    data:{
                        name: req.body?.name
                    }
                })
            }else{
                await prisma.category.update({
                    where:{
                        id: req.body?.id
                    },
                    data:{
                        name: req.body?.name
                    }
                })
            }
            return responseData.resCreated(res, 'Category')
        }catch(err){
            return responseData.resBadRequest(res, 'Faield')
        }
    }
}

export default categoryController