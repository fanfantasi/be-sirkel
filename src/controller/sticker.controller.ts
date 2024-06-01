import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');

export const stickerController = {
    async find(req: Request, res: Response){
        try{
            let state;
            let totalPage;
            const limit = Number(req.query.limit) || 30;
            const page:number = Number(req.query.page) || 0;
            state = await prisma.sticker.findMany({
                select:{
                    id:true,
                    image: true
                },
                skip:(page < 2 ? 0 : page-1) * limit,
                take:limit,
                orderBy:{
                    id: 'desc'
                },
            })
            totalPage = await prisma.sticker.count({
                select: {
                _all: true,
                },
            })
            const pagination = {
                page:page < 2 ? 1 : page,
                limit:limit,
                totalPage: totalPage._all
            }
            return responseData.resFind(res, 'sticker', state, pagination)
        }catch(err){
            return responseData.resBadRequest(res, 'Faield')
        }
    },

    async upsert(req: any, res: Response){
        try{
            if (typeof req.body.id === 'undefined') {
                if (req.files){
                    const dir = './uploads/sticker';
                    const file:any = req.files.image;
                    if (!fs.existsSync(dir)){
                        await fs.mkdirSync(dir, { recursive: true });
                    }
                    const fileName = uuidv4()+'.'+file.name.split('.').pop();
                    await file.mv(dir+'/'+fileName);

                    await prisma.sticker.create({
                        data:{
                            image: fileName
                        }
                    })
                }
            }else{
                if (req.files){
                    const dir = './uploads/sticker';
                    const file:any = req.files.image;
                    const find:any = prisma.sticker.findFirst({
                        where: {
                            id: req.body?.id
                        }
                    });
                    
                    if (fs.existsSync(dir)){
                        fs.readdirSync(dir).forEach(function(file:any, index:number){
                            var curPath = dir + find?.image;
                            var inFolder = dir + file;
                            if (inFolder === curPath){
                                fs.unlinkSync(inFolder);
                            }
                        });
                    }
                    if (!fs.existsSync(dir)){
                        await fs.mkdirSync(dir, { recursive: true });
                    }
                    const fileName = uuidv4()+'.'+file.name.split('.').pop();
                    await file.mv(dir+'/'+fileName);

                    await prisma.sticker.update({
                        where:{
                            id: req.body?.id
                        },
                        data:{
                            image: fileName
                        }
                    })
                }
            }
            return responseData.resCreated(res, 'sticker')
        }catch(err){
            return responseData.resBadRequest(res, 'Faield')
        }
    },

    async deleteOne(req: any, res: Response){
        try{
            const dir = './uploads/sticker';
            const find:any = await prisma.sticker.findFirst({
                where: {
                    id: req.body?.id
                }
            });
            
            if (fs.existsSync(dir)){
                fs.readdirSync(dir).forEach(function(file:any, index:number){
                    var curPath = dir + find?.image;
                    var inFolder = dir + file;
                    if (inFolder === curPath){
                        fs.unlinkSync(inFolder);
                    }
                });
            }
            await prisma.sticker.delete({
                where:{
                    id: req.body?.id
                }
            })
            return responseData.resDelete(res, 'sticker')
        }catch(err){
            return responseData.resBadRequest(res, 'Faield')
        }
    }
}

export default stickerController