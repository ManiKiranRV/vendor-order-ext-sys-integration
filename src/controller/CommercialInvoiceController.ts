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
import { DownStreamService } from "../service/DownStreamServiceCI";
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

        //DOWNSTREAM LLP-Express(UI update)

        router.post('/commercialInvoiceRequest/:route',  async (req:any, res) => {
            try {
                this.logger.log(`=============================================START - LLP - TMS - LOBSTER COMMERCIAL INVOICE DOWNSTREAM UI =======================================`)
                this.logger.log("Timestamp when we received the data from UI to LLP Downstream API --->",Date());
                var downstreamToTmsSystemRates = await this.DownStreamService.downStreamToTmsSystemUpdatedCI(req.params.route,res)

                // var downstreamToTmsSystemRates = await this.DownStreamService.downStreamToTmsSystemRates(req.body[0].body,res)

                res.json({ token:downstreamToTmsSystemRates });
                this.logger.log(`=============================================END - LLP - TMS - LOBSTER COMMERCIAL INVOICE DOWNSTREAM UI =======================================`)

            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });

        //DOWNSTREAM LLP-Express for Commercial Invoice

        router.post('/tmsCommercialInvoiceResponse',  async (req:any, res) => {
            try {
                this.logger.log(`=============================================START - LLP - TMS - LOBSTER COMMERCIAL INVOICE DOWNSTREAM =======================================`)
                this.logger.log("Timestamp when we received the data from BLESS to LLP Downstream API --->",Date());
                this.logger.log(`BLESS REQUEST BODY is ${JSON.stringify(req.body.message)}`);

                //Calling Downstream service from LLP to TMS
                
                var downstreamToTmsSystemCI = await this.DownStreamService.downStreamToTmsSystemCommercialInvoice(JSON.parse(req.body.message).transformedMessage,res)


                res.json({ token:downstreamToTmsSystemCI });
                this.logger.log(`=============================================END -- LLP - TMS - LOBSTER COMMERCIAL INVOICE DOWNSTREAM =======================================`)
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });       


        return router;
    }


}