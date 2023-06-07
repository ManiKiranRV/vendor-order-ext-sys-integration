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
import {ShipmentRatesController} from './controller/ShipmentRatesController'
import { RetryController } from './controller/RetryController';
import { LobsterService } from './service/LobsterService';
import { RetryService } from "./service/RetryService";
const multer  = require('multer');

var upload = multer();

const expressApp: express.Application = express(); 
var bodyParser = require('body-parser');            
var cron = require('cron');
expressApp.use(bodyParser.json({limit:'500mb'})); 
expressApp.use(bodyParser.urlencoded({extended:true, limit:'500mb'})); 
expressApp.use(upload.array());
var schedule = require('node-schedule');
var request = require('request');

const memoryStore = DI.get<MemoryStore>(MemoryStore);


dotenv.config();

class Main {
    private logger: Logger;
    private dbConnection: DBConnection;
    private lobsterService: LobsterService
    private retryService: RetryService
    constructor() { 
        this.logger = DI.get(Logger);
        this.dbConnection = DI.get(DBConnection);
        this.lobsterService = DI.get(LobsterService)
        this.retryService = DI.get(RetryService)
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
        this.logger.log("baseUrl",baseUrl)
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
            expressApp.use(`${baseUrl}/auth`,DI.get<AuthController>(AuthController).getRouter());
            expressApp.use(`${baseUrl}/out/bless-downstream`,DI.get<DownStreamController>(DownStreamController).getRouter());
            expressApp.use(`${baseUrl}/vendor`,DI.get<ShipmentController>(ShipmentController).getRouter());
            expressApp.use(`${baseUrl}/vendorRates`,DI.get<ShipmentRatesController>(ShipmentRatesController).getRouter());
            expressApp.use(`${baseUrl}/retry`, DI.get<RetryController>(RetryController).getRouter());
            expressApp.use(DI.get<ErrorHandler>(ErrorHandler).errorHandler);
    }
    

    private startServer() {
        expressApp.listen(process.env.PORT, () => {
            this.logger.log('Application Server Started',process.env.PORT);
            var eventsToLobsterCron = cron.job(process.env.EVENTS_DURATION, async () => {
                await this.lobsterService.postEventsToLobster();
                this.logger.log('cron Execution Success for sending EVENTS to LOBSTER');
            });
            if(process.env.EVENTS_TO_LOBSTER_CRON =="ON"){
                eventsToLobsterCron.start(); 
            }else if(process.env.EVENTS_TO_LOBSTER_CRON =="OFF"){
                eventsToLobsterCron.stop();
            }
            var retryCron = cron.job(process.env.RETRY_DURATION, async () => {
                await this.retryService.vendorbookingRetryService();
                this.logger.log('cron Execution Success for sending EVENTS to LOBSTER');
            });
            if(process.env.RETRY_CRON =="ON"){
                retryCron.start(); 
            }else if(process.env.RETRY_CRON =="OFF"){
                retryCron.stop();
            }
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

