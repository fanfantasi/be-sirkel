import { Router } from "express";
import musicController from "../controller/music.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.get("/", isAuth.isAuthenticated, musicController.find)
routes.patch("/", isAuth.isAuthenticated, musicController.upsert)

export default routes;