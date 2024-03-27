import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";
const { v4: uuidv4 } = require('uuid');
const { generateTokens } = require("../services/jwt");
import { authController } from "../controller/auth.controller";

export const userController = {
    async findMyID(req: Request, res: Response){
        try{
            const user = await prisma.users.findFirst({
                where:{
                    id: req.body?.payload.userId
                },
                select:{
                    id:true,
                    uid:true,
                    name:true,
                    email:true,
                    username:true,
                    verification:true,
                    address:true,
                    avatar:true,
                    _count:{
                        select:{
                            following:{
                                where:{
                                    status:'accepted'
                                }
                            },
                            followers:{
                                where:{
                                    status:'accepted'
                                }
                            },
                            like:true,
                            posts:true,
                            views:true,
                            shared:true,
                            comments:true
                        }
                    },
                    createdAt:true
                }
            });
            return responseData.resFindOne(res, 'user', user)
        }catch(e){
            console.log(e)
            return responseData.resBadRequest(res, `Current user unsuccessfully.`)
        }
    },

    async createOrUpdate(req: Request, res: Response){
        try{
            if (typeof req.body.email === 'undefined' || typeof req.body?.uid ==='undefined') {
                return responseData.resBadRequest(res, 'You must provide an email.')
            }
            const user = await prisma.users.upsert({
                where: {
                    uid: req.body?.uid
                },
                update: {
                    email: req.body?.email
                },
                create:{
                    uid: req.body?.uid,
                    name: req.body?.name,
                    email: req.body?.email,
                    avatar: req.body?.avatar,
                    username: req.body?.username,
                }
            })
            const jti = uuidv4();
            const { accessToken, refreshToken } = generateTokens(user, jti);
            await authController.addrefreshtokenToWhitelist(jti, refreshToken, user.id)
            return res.status(200).json({
                error   : null,
                message : "Login Successfully",
                data : {
                    accessToken    : accessToken,
                    refreshToken   : refreshToken,
                    user           : user
                },
            })
        }catch(err){
            return responseData.resBadRequest(res, `Login Unsuccessfully.`)
        }
    },

    async findFollow(req: Request, res: Response){
        try{
            const limit = Number(req.query.limit) || 10;
            const page:number = Number(req.query.page) || 0;
            delete req.query.page
            delete req.query.limit;
            const user = await prisma.follows.findMany({
                where:{
                    OR:[
                        {
                            followerId: req.body?.payload.userId,
                        },
                        {
                            followingId: req.body?.payload.userId,
                        },

                    ],
                    AND:[
                        {
                            status: 'accepted'
                        },
                        {
                            OR:[
                                {
                                    following:{
                                        username:{
                                            contains: req.body.name
                                        }
                                    }
                                }
                            ]
                        }
                    ],
                },
                select:{
                    id:true,
                    status:true,
                    follower:{
                        select:{
                            id: true,
                            name:true,
                            username:true,
                            avatar:true,
                            email:true,
                        }
                    },
                    following:{
                        select:{
                            id: true,
                            name:true,
                            username:true,
                            avatar:true,
                            email:true,
                        }
                    },
                    createdAt:true,
                    updatedAt:true,
                },
                skip:(page < 2 ? 0 : page-1) * limit,
                take:limit
            })
            var result:any = [];
            user.forEach((e:any) => {
                if (e.follower.id == req.body?.payload.userId){
                    result.push({
                        'id'        : e.id,
                        'status'    : e.status,
                        'follow'    : {...e.following, 'status': 'following'}
                    })
                }
                if (e.following.id == req.body?.payload.userId){
                    result.push({
                        'id'        : e.id,
                        'status'    : e.status,
                        'follow'    : {...e.follower, 'status': 'follower'}
                    })
                }

             });
            //  for (let i = 0; i < user.length; i++) {
            //     const data = user[i];
            //     if (data.follower.id == req.body?.payload.userId){
                    
            //     }

            //  }
            return responseData.resFindOne(res, 'user', result)
        }catch(e){
            console.log(e)
            return responseData.resBadRequest(res, `Follow Unsuccessfully.`)
        }
    }
}

export default userController