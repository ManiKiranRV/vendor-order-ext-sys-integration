import express from 'express';
import { initModels } from './data/entity/init-models';
import { DI } from "./di/DIContainer";
import { Logger } from "./logger/Logger";
import dotenv from 'dotenv';
import { DBConnection } from "./config/DBConnection";
import { AuthController } from './controller/AuthController';
import { CommercialInvoiceController } from "./controller/CommercialInvoiceController";
const multer  = require('multer');

var upload = multer();


dotenv.config();
const expressApp: express.Application = express();
var bodyParser = require('body-parser');            
var cron = require('cron');
expressApp.use(bodyParser.json({limit:'500mb'})); 
expressApp.use(bodyParser.urlencoded({extended:true, limit:'500mb'})); 
expressApp.use(upload.array());
var schedule = require('node-schedule'); 

export class ConsumeInvoiceMain {
    private logger: Logger;
   
    constructor(){
        this.logger = DI.get(Logger);
        this.initializeRepositories();
    } 

    initializeRepositories() {
        initModels(DI.get<DBConnection>(DBConnection).connection);
    }

 
    public commercialInvoiceController(){
        const baseUrl = process.env.BASE_URL
        this.logger.log("baseUrl",baseUrl)
        this.logger.log("Consume Message Service Started");
        expressApp.use(`${baseUrl}/auth`,DI.get<AuthController>(AuthController).getRouter());
        expressApp.use(`${baseUrl}/commercialInvoice`,DI.get<CommercialInvoiceController>(CommercialInvoiceController).getRouter());
    }
}

const app = DI.get<ConsumeInvoiceMain>(ConsumeInvoiceMain);
app.commercialInvoiceController();

