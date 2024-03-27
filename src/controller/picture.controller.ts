import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
import { uploadsController } from "../controller/upload.controller";


export const pictureController = {
    async find(req: Request, res: Response){
        try{
            let state;
            let totalPage;
            const limit = Number(req.query.limit) || 5;
            const page:number = Number(req.query.page) || 0;
            delete req.query.page
            delete req.query.limit;
            const randomPick = (values: string[]) => {
                const index = Math.floor(Math.random() * values.length);
                return values[index];
            }
            const orderBy = randomPick(['caption', 'createdAt']);
            const orderDir = randomPick([`asc`, `asc`]);
            if (Object.keys(req.query).length !== 0){
                state = await prisma.pictures.findMany({
                    where: req.query,
                    select:{
                        id:true,
                        caption:true,
                        sell:true,
                        view:true,
                        likes:true,
                        share:true,
                        mentions:true,
                        long:true,
                        lat:true,
                        file:{
                            select:{
                                file:true,
                                height:true,
                                width:true,
                                type:true
                            }
                        },
                        music:{
                            select:{
                                cover:true,
                                file:true,
                                name:true,
                                artist: true,
                            }
                        },
                        startPosition:true,
                        stopPosition:true,
                        author:{
                            select:{
                                id:true,
                                name:true,
                                username:true,
                                avatar:true,
                            }
                        },
                        _count:{
                            select:{
                                comments:true,
                                likes:true,
                                share:true,
                                view:true
                            }
                        },
                        createdAt:true,
                        updatedAt:true
                    },
                    orderBy:{
                        [orderBy]: orderDir
                    },
                    skip:(page < 2 ? 0 : page-1) * limit,
                    take:limit
                });
                totalPage = await prisma.pictures.count({
                    where: req.query,
                    select: {
                    _all: true,
                    },
                })
            }else{
                state = await prisma.pictures.findMany({
                    select:{
                        id:true,
                        caption:true,
                        sell:true,
                        view:true,
                        likes:true,
                        share:true,
                        mentions:true,
                        long:true,
                        lat:true,
                        file:{
                            select:{
                                file:true,
                                height:true,
                                width:true,
                                type:true
                            }
                        },
                        music:{
                            select:{
                                cover:true,
                                file:true,
                                name:true,
                                artist: true,
                            }
                        },
                        startPosition:true,
                        stopPosition:true,
                        author:{
                            select:{
                                id:true,
                                name:true,
                                username:true,
                                avatar:true,
                            }
                        },
                        _count:{
                            select:{
                                comments:true,
                                likes:true,
                                share:true,
                                view:true
                            }
                        },
                        createdAt:true,
                        updatedAt:true
                    },
                    orderBy:{
                        [orderBy]: orderDir
                    },
                    skip:(page < 2 ? 0 : page-1) * limit,
                    take:limit
                });
                totalPage = await prisma.pictures.count({
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
            
            let result = state.map((e:any,i) => {
                const objIndex = e.likes.findIndex((obj:any) => obj.authorId == req.body.payload.userId);
                return {...e, 'liked': objIndex != -1, 'likedId':e.likes[objIndex]?.id}
            });
            return responseData.resFind(res, 'post', result, pagination)
        }catch(e){
            return responseData.resBadRequest(res, 'Faield')
        }
    },

    async upsert(req: any, res: Response){
        try{
            if (typeof req.body.category === 'undefined') {
                return responseData.resBadRequest(res, 'Category name is required.')
            }
            let saveData:any;
            if (typeof req.body.id === 'undefined') {
                saveData = await prisma.pictures.create({
                    data:{
                        caption: req.body?.caption,
                        categoryId: req.body?.category,
                        musicId: req.body?.music,
                        startPosition: req.body?.startPosition,
                        stopPosition: req.body?.stopPosition,
                        long: req.body?.long??0.0,
                        lat: req.body?.lat??0.0,
                        authorId: req.body?.payload.userId
                    }
                })
                if (typeof req.body?.mentions === 'undefined'){
                    await prisma.mentions.createMany({
                        data: req.body?.mentions
                    });
                }
            }else{
                saveData = await prisma.pictures.update({
                    where:{
                        id: req.body?.id
                    },
                    data:{
                        caption: req.body?.caption,
                        categoryId: req.body?.category,
                        musicId: req.body?.music,
                        startPosition: req.body?.startPosition,
                        stopPosition: req.body?.stopPosition,
                        long: req.body?.long??0.0,
                        lat: req.body?.lat??0.0,
                        authorId: req.body?.payload.userId
                    }
                })
                if (typeof req.body?.mentions === 'undefined'){
                    await prisma.mentions.updateMany({
                        where: {
                            postId: saveData.id
                        },
                        data: req.body?.mentions,
                    });
                }
            }
            if (req.files){
                uploadsController.uploadPicture(req.files, req.body.payload.userId, saveData.id);
            }

            return responseData.resCreated(res, 'picture')
        }catch(err){
            console.log(req.body);
            return responseData.resBadRequest(res, 'Faield')
        }
    }
}

export default pictureController