import { Controller } from "./Controller";
import { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { Logger } from "../logger/Logger";
import { DI } from "../di/DIContainer";
import { ExpTmsService } from "../service/ExpTmsService";
import { ExpResponseDataService } from "../service/ExpResponseDataService";
import { LlpClien2Service } from "../service/LlpClien2Service";
import { LobsterService } from "../service/LobsterService";
import { AuthService } from "../service/AuthService";
import { VerifyJwtTokenService } from "../security/VerifyJwtTokenService";


import { DataGenTransformationService } from "../service/DataGenTransformationService";
import { DownStreamService } from "../service/DownStreamService";
import { GenericUtil } from "../util/GenericUtil";

var request = require('request');

//For Timestamp
import * as moment from 'moment';
var today = new Date();
// var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss.SSSZ") + ' UTC' + moment.utc(today).format("Z")
export class CommercialInvoiceController implements Controller {
    private logger: Logger = DI.get(Logger)
    private ExpTmsService: ExpTmsService = DI.get(ExpTmsService)
    private ExpResponseDataService: ExpResponseDataService = DI.get(ExpResponseDataService)
    private LlpClien2Service: LlpClien2Service = DI.get(LlpClien2Service);
    private LobsterService: LobsterService = DI.get(LobsterService);
    private DataGenTransformationService: DataGenTransformationService = DI.get(DataGenTransformationService);
    private DownStreamService: DownStreamService = DI.get(DownStreamService);
    private authService: AuthService;
    private verifyJwtTokenService: VerifyJwtTokenService;


    constructor(){
        this.authService = DI.get(AuthService);
        this.verifyJwtTokenService = DI.get(VerifyJwtTokenService);

    }

    getRouter(): Router {
        const router = Router();
    
        //DOWNSTREAM LLP-TMS(EXP Rates Request Data) & LLP-CLIENT2(TMS Rates Response)//  

        router.post('/commercialInvoiceRequest', this.verifyJwtTokenService.verifyToken, async (req:any, res) => {
            try {
                this.logger.log(`=============================================START-LLP - TMS RATES DOWNSTREAM=======================================`)
                this.logger.log("Timestamp when we received the data from BLESS to LLP Downstream API --->",Date());
                this.logger.log(`BLESS REQUEST BODY is ${JSON.stringify(req.body.message)}`);
                // this.logger.log("S3 data----->",req.body.body)
                //Calling Downstream service from LLP to TMS
                // Uncomment when you get data from BLESS
                var downstreamToTmsSystemRates = await this.DownStreamService.downStreamToTmsSystemRates(JSON.parse(req.body.message).transformedMessage,res)

                // var downstreamToTmsSystemRates = await this.DownStreamService.downStreamToTmsSystemRates(req.body[0].body,res)

                res.json({ token:downstreamToTmsSystemRates });
                this.logger.log(`=============================================END-LLP To TMS RATES DOWNSTREAM=======================================`)
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });

        //DOWNSTREAM CLIENT2-LOBSTER for Rates
        
        router.post('/client-lobster-tms-rates-resp', this.verifyJwtTokenService.verifyToken, async (req:any, res) => {
            try {

                this.logger.log(`=============================================START-C2 To Lobster DOWNSTREAM=======================================`)
                this.logger.log("Timestamp when we received the data from BLESS to CLIENT2 Downstream API --->",Date());
                // this.logger.log(`BLESS REQUEST BODY is ${JSON.parse(req.body.message)}`);

                // Uncomment when you get data from BLESS
                // var downstreamToLobSystemRates = await this.DownStreamService.downStreamToLobsterSystemRates(JSON.parse(req.body.message).transformedMessage,res);
                
                // var downstreamToLobSystemRates = await this.DownStreamService.downStreamToLobsterSystemRates(req,res);
                var downstreamToLobSystemRates = GenericUtil.generateRandomHash();
                res.json({token:downstreamToLobSystemRates });
                
                this.logger.log(`=============================================END-C2 To Lobster DOWNSTREAM=======================================`)              
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });         
       

        return router;
    }


}