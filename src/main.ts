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
import { ExpTmsService } from "./service/ExpTmsService";
import { LlpClien2Service } from "./service/LlpClien2Service";
import { LobsterService } from "./service/LobsterService";
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
            expressApp.use(`${baseUrl}/auth`,DI.get<AuthController>(AuthController).getRouter());
            expressApp.use(`${baseUrl}/out/bless-downstream`,DI.get<DownStreamController>(DownStreamController).getRouter());
            expressApp.use(`${baseUrl}/vendor`,DI.get<ShipmentController>(ShipmentController).getRouter());
            expressApp.use(DI.get<ErrorHandler>(ErrorHandler).errorHandler);
    }
    

    private startServer() {
        expressApp.listen(process.env.PORT, () => {
            this.logger.log('Application Server Started',process.env.PORT);

  
                let expTmsService: ExpTmsService = DI.get(ExpTmsService)
                let llpToClient2Service: LlpClien2Service = DI.get(LlpClien2Service)
                let lobsterService: LobsterService = DI.get(LobsterService)

                var llpToTms = cron.job(process.env.CRON1, async () => {              
                    await expTmsService.ExpDhl()
                    this.logger.log('cron Execution Success for LLP to TMS');
    
    
                });
                var llpToClient2 = cron.job(process.env.CRON2, async () => {
                    await llpToClient2Service.clientTmsResponse();
                    this.logger.log('cron Execution Success for LLP to CLIENT2');
                });
                var client2ToLob = cron.job(process.env.CRON3, async () => {
                    await lobsterService.postTmsResponseToLobster();
                    this.logger.log('cron Execution Success for CLIENT2 to Lobster');
                });
                if(process.env.LLP_TMS_CRON=="ON"){
                    llpToTms.start(); 
                }else if(process.env.LLP_TMS_CRON=="OFF"){
                    llpToTms.stop();
                }  
                if(process.env.LLP_CLIENT2_CRON=="ON"){   
                    llpToClient2.start();
                }else if(process.env.LLP_CLIENT2_CRON=="OFF"){
                    llpToClient2.stop();
                }
                if(process.env.CLIENT2_LOBSTER_CRON=="ON"){  
                    client2ToLob.start();             
                }else if(process.env.CLIENT2_LOBSTER_CRON=="OFF"){                  
                    client2ToLob.stop();
                }
                
                //nodeApis.start();
                //cronApis.start();
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

