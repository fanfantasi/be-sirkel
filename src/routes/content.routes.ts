import { Router } from "express";
import contentController from "../controller/content.controller";
import isAuth from "../middleware";
const routes = Router();

routes.get("/", isAuth.isAuthenticated, contentController.find)
routes.post("/", isAuth.isAuthenticated, contentController.upsert)
routes.post("/findone", isAuth.isAuthenticated, contentController.funOne)

export default routes;