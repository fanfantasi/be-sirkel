import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
import { uploadsController } from "./upload.controller";
const ratio = require('aspect-ratio');


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
                state = await prisma.content.findMany({
                    where: req.query,
                    select:{
                        id:true,
                        caption:true,
                        sell:true,
                        view:true,
                        likes:true,
                        share:true,
                        mentions:{
                            select:{
                                user:{
                                    select:{
                                        id:true,
                                        username:true,
                                        name:true,
                                        avatar:true,
                                    }
                                }
                            }
                        },
                        location:true,
                        long:true,
                        lat:true,
                        typepost:true,
                        videoId:true,
                        file:{
                            select:{
                                file:true,
                                height:true,
                                width:true,
                                type:true,
                                thumbnail:true
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
                        endPosition:true,
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
                totalPage = await prisma.content.count({
                    where: req.query,
                    select: {
                    _all: true,
                    },
                })
            }else{
                state = await prisma.content.findMany({
                    select:{
                        id:true,
                        caption:true,
                        sell:true,
                        view:true,
                        likes:true,
                        share:true,
                        mentions:{
                            select:{
                                user:{
                                    select:{
                                        id:true,
                                        username:true,
                                        name:true,
                                        avatar:true,
                                    }
                                }
                            }
                        },
                        location:true,
                        long:true,
                        lat:true,
                        typepost:true,
                        videoId:true, 
                        file:{
                            select:{
                                file:true,
                                height:true,
                                width:true,
                                type:true,
                                thumbnail:true,
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
                        endPosition:true,
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
                totalPage = await prisma.content.count({
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
            // const client = new ApiVideoClient({ apiKey: process.env.API_KEY_VIDEO });
            let result = await Promise.all(
                state.map(async (e:any,i) => {
                    let pic:any = [];
                    e.file.map((f:any) => {
                        pic.push({
                            'file':e.author.id+'/'+f.file,
                            'height':f.height,
                            'width':f.width,
                            'type':f.type,
                            'thumbnail': e.author.id+'/'+f.thumbnail,
                            'ratio':ratio(f.width, f.height, '/')
                        })
                    })

                    const objIndex = e.likes.findIndex((obj:any) => obj.authorId == req.body.payload.userId);
                    // if (e.videoId !=null){
                    //     const video = await client.videos.get(e.videoId);
                    //     return {...e, 'video':video, 'file': pic, 'liked': objIndex != -1, 'likedId':e.likes[objIndex]?.id}
                    // }else{
                    //     return {...e, 'video':null, 'file': pic, 'liked': objIndex != -1, 'likedId':e.likes[objIndex]?.id}
                    // }
                    return {...e, 'video':null, 'file': pic, 'liked': objIndex != -1, 'likedId':e.likes[objIndex]?.id}
                   
                })
            );

            return responseData.resFind(res, 'post', result, pagination)
        }catch(e){
            console.log(e)
            return responseData.resBadRequest(res, 'Faield')
        }
    },

    async funOne(req: any, res: Response){
        try{
            let state:any;
            state = await prisma.content.findFirst({
                where:{
                    id: req.body.id
                },
                select:{
                    id:true,
                    caption:true,
                    sell:true,
                    view:true,
                    likes:true,
                    share:true,
                    mentions:{
                        select:{
                            user:{
                                select:{
                                    id:true,
                                    username:true,
                                    name:true,
                                    avatar:true,
                                }
                            }
                        }
                    },
                    location:true,
                    long:true,
                    lat:true,
                    typepost:true,
                    videoId:true, 
                    file:{
                        select:{
                            file:true,
                            height:true,
                            width:true,
                            type:true,
                            thumbnail:true,
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
                    endPosition:true,
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
                }
            });
            let result: any[]=[];
            let pic:any = [];
                state.file.map((f:any) => {
                    pic.push({
                        'file':state.author.id+'/'+f.file,
                        'height':f.height,
                        'width':f.width,
                        'type':f.type,
                        'thumbnail': state.author.id+'/'+f.thumbnail
                    })
                })
            result.push({...state,  'file': pic, 'video':null, 'liked': false});
            return responseData.resFind(res, 'post', result, null);
        }catch(e){
            return responseData.resBadRequest(res, 'Faield')
        }
    },


    async upsert(req: any, res: Response){
        try{
            let saveData:any;
            if (typeof req.body.id === 'undefined') {
                if (typeof req.body?.music == 'undefined' || req.body?.music == ''){
                    saveData = await prisma.content.create({
                        data:{
                            caption: req.body?.caption,
                            categoryId: req.body?.category??'65f87e3c66f5c6e6bd96e312',
                            typepost: req.body?.typepost,
                            location: req.body?.location,
                            long: req.body?.long??'0.0',
                            lat: req.body?.lat??'0.0',
                            authorId: req.body?.payload.userId
                        }
                    })
                }else{
                    saveData = await prisma.content.create({
                        data:{
                            caption: req.body?.caption,
                            categoryId: req.body?.category??'65f87e3c66f5c6e6bd96e312',
                            musicId: req.body?.music,
                            typepost: req.body?.typepost,
                            location: req.body?.location,
                            long: req.body?.long??'0.0',
                            lat: req.body?.lat??'0.0',
                            authorId: req.body?.payload.userId
                        }
                    })
                }
                
                if (typeof req.body?.mentions != 'undefined'){
                    if (JSON.parse(req.body.mentions).length > 0){
                        const mentions:any=[];
                        const men = JSON.parse(req.body.mentions);
                        men.forEach((e:any) => {
                            mentions.push({
                                'postId': saveData.id,
                                'userId': e
                            })
                        });
                        await prisma.mentions.createMany({
                            data: mentions
                        });
                    }
                }
                
            }else{
                if (typeof req.body?.music == 'undefined' || req.body?.music == ''){
                    saveData = await prisma.content.update({
                        where:{
                            id: req.body?.id
                        },
                        data:{
                            caption: req.body?.caption,
                            categoryId: req.body?.category??'65f87e3c66f5c6e6bd96e312',
                            typepost: req.body?.typepost,
                            location: req.body?.location,
                            long: req.body?.long??'0.0',
                            lat: req.body?.lat??'0.0',
                            authorId: req.body?.payload.userId
                        }
                    })
                }else{
                    saveData = await prisma.content.update({
                        where:{
                            id: req.body?.id
                        },
                        data:{
                            caption: req.body?.caption,
                            categoryId: req.body?.category??'65f87e3c66f5c6e6bd96e312',
                            musicId: req.body?.music,
                            typepost: req.body?.typepost,
                            location: req.body?.location,
                            long: req.body?.long??'0.0',
                            lat: req.body?.lat??'0.0',
                            authorId: req.body?.payload.userId
                        }
                    })
                }
                
                if (JSON.parse(req.body.mentions).length > 0){
                    await prisma.mentions.deleteMany({
                        where:{
                            postId: saveData.id
                        }
                    })
                    const mentions:any=[];
                    const men = JSON.parse(req.body.mentions);
                    men.forEach((e:any) => {
                        mentions.push({
                            'postId': saveData.id,
                            'userId': e
                        })
                    });
                    
                    await prisma.mentions.createMany({
                        data: mentions,
                    });
                }
            }
            if (req.files){
                uploadsController.uploadPicture(req.files, req.body.payload.userId, saveData.id, req.body);
            }

            return responseData.resCreatedReturn(res, 'content', saveData)
        }catch(err){
            console.log(err);
            return responseData.resBadRequest(res, 'Faield')
        }
    }
}

export default pictureController