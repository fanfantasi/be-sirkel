import { Router } from "express";
import categoryController from "../controller/category.controller";
import isAuth from "./../middleware";
const routes = Router();

routes.post("/", isAuth.isAuthenticated, categoryController.upsert)

export default routes;