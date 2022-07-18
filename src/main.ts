import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Logger } from './logger/Logger';
import { DBConnection } from './config/DBConnection';
import {ShipmentController} from './controller/ShipmentController'
import { initModels } from './data/entity/init-models';
import { DI } from './di/DIContainer';
import { ErrorHandler } from './error/ErrorHandler';
import session, { MemoryStore } from 'express-session';
import { DownStreamController } from './controller/DownStreamController';
import { AuthController } from './controller/AuthController';


const expressApp: express.Application = express(); 
var bodyParser = require('body-parser');            
var cron = require('cron');
expressApp.use(bodyParser.json({limit:'500mb'})); 
expressApp.use(bodyParser.urlencoded({extended:true, limit:'500mb'})); 

var schedule = require('node-schedule');
var request = require('request');

const memoryStore = DI.get<MemoryStore>(MemoryStore);


dotenv.config();

class Main {
    private logger: Logger;
    private dbConnection: DBConnection;
    constructor() { 
        this.logger = DI.get(Logger);
        this.dbConnection = DI.get(DBConnection);
    }

    initializeApplication() {
        this.registerControllers();
        this.startServer();
        initModels(this.dbConnection.connection);
    }

    private initializeRepositories() {
    }

    private registerControllers() {
        const baseUrl = process.env.BASE_URL
            this.initializeRepositories();
            expressApp.use(session({
                secret: 'mySecret',
                resave: false,
                saveUninitialized: true,
                store: memoryStore
            }));
            expressApp.use(cors());
            expressApp.use(bodyParser.urlencoded({extended: true}));
            expressApp.use(bodyParser.json());
            expressApp.use((req, res, next) => {
                DI.destroy();
                next();
            })
            expressApp.use('/auth',DI.get<AuthController>(AuthController).getRouter());
            expressApp.use(`/vendor`,DI.get<ShipmentController>(ShipmentController).getRouter());
            expressApp.use(`/out/bless-downstream`,DI.get<DownStreamController>(DownStreamController).getRouter());
            expressApp.use(`/vendor`,DI.get<ShipmentController>(ShipmentController).getRouter());
            expressApp.use(DI.get<ErrorHandler>(ErrorHandler).errorHandler);
    }
    

    private startServer() {
        expressApp.listen(process.env.PORT, () => {
            this.logger.log('Application Server Started',process.env.PORT);
        });
    }
}

const app = DI.get<Main>(Main);
app.initializeApplication();
function onComplete(arg0: string, onComplete: any) {
    throw new Error('Function not implemented.');
}

function elseif() {
    throw new Error('Function not implemented.');
}

