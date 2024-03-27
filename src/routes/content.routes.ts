import { Router } from "express";
import contentController from "../controller/content.controller";
import isAuth from "../middleware";
const routes = Router();

routes.get("/", isAuth.isAuthenticated, contentController.find)
routes.patch("/", isAuth.isAuthenticated, contentController.upsert)

export default routes;