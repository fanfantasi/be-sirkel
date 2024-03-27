import prisma from "../services/prisma";
const { hashToken } = require('../services/hashToken')

export const authController = {
    async addrefreshtokenToWhitelist(jti:any, refreshtoken:any, userId:any) {
        return prisma.refreshtoken.create({
            data: {
              hashedToken: hashToken(refreshtoken),
              userId: userId
            },
          });        
    },

    async findrefreshtokenById(id:any){
        return prisma.refreshtoken.findUnique({
            where: {
              id: id,
            },
        });        
    },

    async findUserById(id:any){
        return prisma.users.findUnique({
            where: {
              id,
            },
        });        
    },

    async deleterefreshtoken(id:any){
        return prisma.refreshtoken.update({
            where: {
                id,
            },
              data: {
                revoked: true
            }          
        })
    },

    async revokeTokens(userId:any){
        return prisma.refreshtoken.updateMany({
            where: {
              userId
            },
            data: {
              revoked: true
            }
        });
    }
}
export default authController;