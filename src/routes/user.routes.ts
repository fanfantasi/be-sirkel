import { Router } from "express";
import userController from "../controller/user.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.get("/", isAuth.isAuthenticated, userController.findMyID)
routes.post("/", userController.createOrUpdate)
routes.post("/follow", isAuth.isAuthenticated, userController.findFollow)
routes.get("/token", isAuth.isAuthenticated, userController.generateTokenVideo)

export default routes;