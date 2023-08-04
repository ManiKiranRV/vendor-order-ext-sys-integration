import express from 'express';
import cors from 'cors';
import { initModels } from './data/entity/init-models';
import { DI } from "./di/DIContainer";
import { Logger } from "./logger/Logger";
import dotenv from 'dotenv';
import session, { MemoryStore } from 'express-session';
import { DBConnection } from "./config/DBConnection";
import { AuthController } from './controller/AuthController';
import { CommercialInvoiceController } from "./controller/CommercialInvoiceController";
import { DownStreamServiceCI } from "./service/DownStreamServiceCI";
const multer  = require('multer');
var cron = require('cron');

var upload = multer();
const memoryStore = DI.get<MemoryStore>(MemoryStore);

dotenv.config();
const expressApp: express.Application = express();
var bodyParser = require('body-parser');            
expressApp.use(bodyParser.json({limit:'500mb'})); 
expressApp.use(bodyParser.urlencoded({extended:true, limit:'500mb'})); 
expressApp.use(upload.array());


export class ConsumeInvoiceMain {
    private logger: Logger;
    private dbConnection: DBConnection;
    private DownStreamServiceCI:DownStreamServiceCI;

    constructor(){
        this.logger = DI.get(Logger);
        this.dbConnection = DI.get(DBConnection);
        this.DownStreamServiceCI = DI.get(DownStreamServiceCI);
        // this.initializeRepositories();
    } 

    initializeApplication() {
        this.commercialInvoiceController();
        this.startServer();
        initModels(this.dbConnection.connection);
    }

    initializeRepositories() {
    }


    public commercialInvoiceController(){
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
        expressApp.use(`${baseUrl}/commercialInvoice`,DI.get<CommercialInvoiceController>(CommercialInvoiceController).getRouter());
    }
    private startServer() {
        expressApp.listen(process.env.PORT, () => {
            this.logger.log('Application Server Started',process.env.PORT);
            var comInvCron = cron.job(process.env.COM_INV_DURATION, async () => {
                let req:any
                let flag:any
                let res:any
                let result:any = await this.DownStreamServiceCI.downStreamToTmsSystemUpdatedCI(req,flag,res)
                this.logger.log(result)
                this.logger.log('Cron Execution Success for sending transformed data');
            });
            if(process.env.COM_INV_CRON =="ON"){
                comInvCron.start(); 
            }else if(process.env.COM_INV_CRON =="OFF"){
                comInvCron.stop();
            }
        });
        
    }
}



const app = DI.get<ConsumeInvoiceMain>(ConsumeInvoiceMain);
app.initializeApplication();
