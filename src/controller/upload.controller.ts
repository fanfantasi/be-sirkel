import { Request, Response } from "express";
import prisma from "../services/prisma";
import responseData from "../services/response";
var fs = require('fs');
const { v4: uuidv4 } = require('uuid');
var sizeOf = require('image-size');
var ffmpeg = require('fluent-ffmpeg');

function baseName(str:any) {
    var base = new String(str).substring(str.lastIndexOf('/') + 1); 
    if(base.lastIndexOf(".") != -1) {
        base = base.substring(0, base.lastIndexOf("."));
    }     
    return base;
}

export const uploadsController = {
    async uploadPicture(files:any, userId:String, postId:any, body:any){
        const dir = './uploads/pictures/'+userId;
        const dirVid = './uploads/videos/'+userId;
        if (files){
            if (typeof files.file.length === 'undefined'){
                const file:any = files.file;
                let extension = file.name.split('.').pop().toLowerCase();
                if(extension  === "jpeg" || extension === "jpg" || extension === "png" || extension === "tiff" || extension === "gif") {
                    if (!fs.existsSync(dir)){
                        await fs.mkdirSync(dir, { recursive: true });
                    }
                    const fileName = uuidv4()+'.'+file.name.split('.').pop();
                    await file.mv(dir+'/'+fileName);
                    sizeOf(dir+'/'+fileName, async function  (err:any, dimensions:any) {
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
                                    width: dimensions?.width,
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
                    return fileName;
                }
                else if(extension  === "mp4" || extension === "m4a"|| extension === "f4v" || extension  === "m4b" || extension  === "mov") {
                    try {
                        const fileThumb:any = files.thumbnail;
                        if (!fs.existsSync(dirVid)){
                            await fs.mkdirSync(dirVid, { recursive: true });
                        }
                        const fileNameThumb = 'thumb_'+uuidv4()+'.'+fileThumb.name.split('.').pop();
                        await fileThumb.mv(dirVid+'/'+fileNameThumb);

                        const fileNameVid = 'vid_'+uuidv4()+'.'+file.name.split('.').pop();
                        await file.mv(dirVid+'/'+fileNameVid);
                        
                        if (!fs.existsSync(dirVid+'/480')){
                            await fs.mkdirSync(dirVid+'/480', { recursive: true });
                        }
                        if (!fs.existsSync(dirVid+'/720')){
                            await fs.mkdirSync(dirVid+'/720', { recursive: true });
                        }
                        ffmpeg(dirVid+'/'+fileNameVid)
                            // Generate 480 video
                            .videoCodec('libx264')
                            .size('480x?')
                            .save(dirVid + '/480/'+fileNameVid)

                            
                            // .videoCodec('libx264')
                            // .size('720x?')
                            // .save(dirVid + '/720/'+fileNameVid);

                        sizeOf(dirVid+'/'+fileNameThumb, async function  (err:any, dimensions:any) {
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
                                        file: fileNameVid,
                                        height: dimensions?.height,
                                        width: dimensions?.width,
                                        type: dimensions?.type,
                                        thumbnail: fileNameThumb
                                    }
                                })
                            }else{
                                await prisma.files.create({
                                    data:{
                                        file: fileNameVid,
                                        postId: postId,
                                        height: dimensions.height,
                                        width: dimensions.width,
                                        type: dimensions.type,
                                        thumbnail: fileNameThumb
                                    }
                                })
                            }
                        })
                        return fileNameVid;
                    }catch (e) {
                        console.error(e);
                    }            
                    
                }
                               
                
            }else{
                await prisma.files.deleteMany({
                    where:{
                        postId: postId
                    }
                });
                files.file.forEach(async (el:any) => {
                    const file:any = el;
                    let extension = file.name.split('.').pop().toLowerCase();
                    if(extension  === "jpeg" || extension === "jpg" || extension === "png" || extension === "tiff" || extension === "gif") {
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
                    }
                    
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