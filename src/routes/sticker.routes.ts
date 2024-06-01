import { Router } from "express";
import stickerController from "../controller/sticker.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.get("/", isAuth.isAuthenticated, stickerController.find)
routes.post("/", isAuth.isAuthenticated, stickerController.upsert)
routes.delete("/", isAuth.isAuthenticated, stickerController.deleteOne)

export default routes;