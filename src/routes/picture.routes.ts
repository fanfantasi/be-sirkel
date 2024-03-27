import { Router } from "express";
import pictureController from "../controller/picture.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.get("/", isAuth.isAuthenticated, pictureController.find)
routes.patch("/", isAuth.isAuthenticated, pictureController.upsert)

export default routes;