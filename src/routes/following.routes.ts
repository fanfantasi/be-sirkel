import { Router } from "express";
import followController from "../controller/following.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.post("/", isAuth.isAuthenticated, followController.follow)

export default routes;