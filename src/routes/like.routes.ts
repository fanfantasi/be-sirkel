import { Router } from "express";
import likeController from "../controller/like.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.post("/", isAuth.isAuthenticated, likeController.upsert)

export default routes;