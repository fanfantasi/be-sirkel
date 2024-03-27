import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var sizeOf = require('image-size');

export const uploadsController = {
    async uploadPicture(files:any, userId:String, postId:any){
        const dir = './uploads/pictures/'+userId;
        if (files){
            if (typeof files.file.length === 'undefined'){
                const file:any = files.file;
                if (!fs.existsSync(dir)){
                    await fs.mkdirSync(dir, { recursive: true });
                }
                const fileName = uuidv4()+'.'+file.name.split('.').pop();
                await file.mv(dir+'/'+fileName);
                sizeOf(dir+'/'+fileName, async function  (err:any, dimensions:any) {
                    console.log(dimensions);
                    const result = await prisma.files.findFirst({
                        where:{
                            postId: postId
                        }
                    });
                    if (result){
                        await prisma.files.update({
                            where:{
                                id: result.id
                            },
                            data:{
                                file: fileName,
                                height: dimensions?.height,
                                width: dimensions?.width.toS,
                                type: dimensions?.type
                            }
                        })
                    }else{
                        await prisma.files.create({
                            data:{
                                file: fileName,
                                postId: postId,
                                height: dimensions.height,
                                width: dimensions.width,
                                type: dimensions.type
                            }
                        })
                    }
                })                  
                
            }else{
                await prisma.files.deleteMany({
                    where:{
                        postId: postId
                    }
                });
                files.file.forEach(async (el:any) => {
                    const file:any = el;
                    if (!fs.existsSync(dir)){
                        await fs.mkdirSync(dir, { recursive: true });
                    }
                    const fileName = uuidv4()+'.'+file.name.split('.').pop();
                    await file.mv(dir+'/'+fileName);
                    const dimensions = await sizeOf(dir+'/'+fileName)
                    await prisma.files.create({
                        data:{
                            file: fileName,
                            postId: postId,
                            height: dimensions.height,
                            width: dimensions.width,
                            type: dimensions.type
                        }
                    })
                });
            }
        }
    },

    async uploadsCoverMusic(files:any){
        const dir = './uploads/covermusic';
        const file:any = files.cover;
        if (!fs.existsSync(dir)){
            await fs.mkdirSync(dir, { recursive: true });
        }
        const fileName = file.name;
        file.mv(dir+'/'+fileName);
        return fileName;
    },

    async uploadsMusic(files:any){
        const dir = './uploads/music';
        const file:any = files.music;
        if (!fs.existsSync(dir)){
            await fs.mkdirSync(dir, { recursive: true });
        }
        // console.log(file.name);
        const fileName = file.name;
        file.mv(dir+'/'+fileName);
    }
}
export default uploadsController