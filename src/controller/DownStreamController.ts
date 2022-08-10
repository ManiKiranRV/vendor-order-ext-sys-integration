import { Controller } from "./Controller";
import { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { Logger } from "../logger/Logger";
import { DI } from "../di/DIContainer";
import { AuthService } from "../service/AuthService";
import { DownStreamService } from "../service/DownStreamService";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";


var request = require('request');

export class DownStreamController implements Controller {
    private logger: Logger;
    private DownStreamService: DownStreamService;
    private expResponseDataRepository: ExpResponseDataRepository;
    


    constructor() {
        this.logger = DI.get(Logger);
        this.DownStreamService = DI.get(DownStreamService);
        this.expResponseDataRepository = DI.get(ExpResponseDataRepository);
    }

    getRouter(): Router {
        const router = Router();

        router.post('/exp-bkng-rqst', AuthService.verifyToken, async (req: Request, res: Response, next: NextFunction) => {
            try {
                let token = await this.DownStreamService.expBookingReqDownStreamHandler(req.body.message);
                res.json({ "token": token })
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });

        /*
            **Downstream Wrapper which handles the TMS Response and posts it to LOBSTER system.
            
        */

        router.post('/consume-tms-response', async (req, res) => {
            try {
                let expResponseList;
                if (Array.isArray(req.body)) {
                    expResponseList = req.body;
                } else {
                    expResponseList = [req.body];
                }
                this.logger.log(`req.body is ${JSON.stringify(req.body)}`)
                await this.DownStreamService.consumeTMSResponse(req.body["tmsResponse"]);
                res.json({ "token": "" });

            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);
            }
        });

        /*
            **Downstream Wrapper which handles the TMS Response and persist response in LLP system.
            
        */ 

        router.post('/tmsResponse',async (req:any, res) => {
            try {
                this.logger.log(`=============================================START-TMS To LLP DOWNSTREAM=======================================`)
                this.logger.log(`BLESS REQUEST BODY is ${JSON.parse(req.body.message)}`);

                //Calling Downstream service from LLP to TMS
                var downstreamToTmsSystem = await this.DownStreamService.downStreamToTmsSystem(JSON.parse(req.body.message).transformedMessage,res)

                //var response = await this.LlpClien2Service.clientTmsResponse();

                res.json({ token:downstreamToTmsSystem });
                this.logger.log(`=============================================END-TMS To LLP DOWNSTREAM=======================================`)
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });

        /*
            **Downstream Wrapper which handles the TMS Response and posts it to LOBSTER system.
            
        */
        
        router.post('/client-lobster-tms-resp',async (req:any, res) => {
            try {

                this.logger.log(`=============================================START-C2 To Lobster DOWNSTREAM=======================================`)
                this.logger.log(`BLESS REQUEST BODY is ${JSON.parse(req.body.message)}`);

                var lobMessage = await this.DownStreamService.downStreamToLobsterSystem(JSON.parse(req.body.message).transformedMessage,res);
                res.json({token:lobMessage });
                
                this.logger.log(`=============================================END-C2 To Lobster DOWNSTREAM=======================================`)              
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });
        
        return router;
    }


}