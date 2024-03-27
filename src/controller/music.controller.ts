import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";
import { uploadsController } from "../controller/upload.controller";

export const categoryController = {
    async find(req: Request, res: Response){
        try{
            let state;
            let totalPage;
            const limit = Number(req.query.limit) || 5;
            const page:number = Number(req.query.page) || 0;
            delete req.query.page
            delete req.query.limit;
            if (Object.keys(req.query).length !== 0){
                state = await prisma.music.findMany({
                    where: req.query,
                    select:{
                        id:true,
                        name:true,
                        artist:true,
                        cover:true,
                        file:true,
                    },
                    orderBy:{
                        name:'asc'
                    },
                    skip:(page < 2 ? 0 : page-1) * limit,
                    take:limit
                })
                totalPage = await prisma.music.count({
                    where: req.query,
                    select: {
                    _all: true,
                    },
                })
            }else{
                state = await prisma.music.findMany({
                    select:{
                        id:true,
                        name:true,
                        artist:true,
                        cover:true,
                        file:true,
                    },
                    orderBy:{
                        name:'asc'
                    },
                    skip:(page < 2 ? 0 : page-1) * limit,
                    take:limit
                })
                totalPage = await prisma.music.count({
                    select: {
                    _all: true,
                    },
                })
            }
            const pagination = {
                page:page < 2 ? 1 : page,
                limit:limit,
                totalPage: totalPage._all
            }
            return responseData.resFind(res, 'music', state, pagination)
        }catch(e){
            console.log(e);
            return responseData.resBadRequest(res, 'Faield')
        }
    },

    async upsert(req: any, res: Response){
        try{
            if (typeof req.body.name === 'undefined') {
                return responseData.resBadRequest(res, 'Music name is required.')
            }

            if (typeof req.body.id === 'undefined') {
                if (req.files){
                    if (req.files.cover){
                        uploadsController.uploadsCoverMusic(req.files);
                    }

                    if (req.files.music){
                        uploadsController.uploadsMusic(req.files);
                    }
                }

                await prisma.music.create({
                    data:{
                        name: req.body?.name,
                        artist: req.body?.artist,
                        cover: req.files?.cover?.name,
                        file: req.files?.music?.name
                    }
                })
            }else{
                if (req.files){
                    if (req.files.cover){
                        uploadsController.uploadsCoverMusic(req.files);
                    }

                    if (req.files.music){
                       uploadsController.uploadsMusic(req.files);
                    }
                }
                await prisma.music.update({
                    where:{
                        id: req.body?.id
                    },
                    data:{
                        name: req.body?.name,
                        cover: req.files?.cover?.name,
                        artist: req.body?.artist,
                        file: req.files?.music?.name
                    }
                })
            }
            return responseData.resCreated(res, 'music')
        }catch(err){
            console.log(err)
            return responseData.resBadRequest(res, 'Faield')
        }
    }
}

export default categoryController