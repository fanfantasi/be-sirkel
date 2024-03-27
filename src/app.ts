import express from "express";
const fileUpload = require('express-fileupload');
const rt = require("thumb-express");
var bodyParser = require('body-parser');
import { 
    categoryRoutes,
    followRoutes,
    likeRoutes,
    musicRoutes,
    pictureRoutes,
    userRoutes
} from "./routes";

const path = __dirname;



class App {
    public server;

    constructor() {
        this.server = express()

        this.middlewares();
        this.routes();
    }
    

    middlewares(){
        this.server.use(express.json());
    }

    routes(){
        const cors=require("cors");
        this.server.use(cors());
        //Body Parser
        this.server.use(bodyParser.urlencoded({
            extended: false
        }));
        this.server.use(bodyParser.json({
            limit: "16mb",
        }));
        this.server.use(cors());
        this.server.use(function (req, res, next) {
            next();
        });

        this.server.use(express.static(path));
        
        this.server.get('/', function (req, res) {
            res.sendFile(path + "/index.html");
        });
          
        this.server.use(fileUpload());
        this.server.use('/uploads', rt.init(process.cwd() + '/uploads'));
        this.server.use('/uploads', express.static(process.cwd() + '/uploads'));
        this.server.use('/v1/picture', pictureRoutes);
        this.server.use('/v1/user', userRoutes);
        this.server.use('/v1/category', categoryRoutes);
        this.server.use('/v1/music', musicRoutes);
        this.server.use('/v1/like', likeRoutes);
        this.server.use('/v1/following', followRoutes);
    }
}

export default new App().server;