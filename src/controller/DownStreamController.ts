import { Controller } from "./Controller";
import { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { Logger } from "../logger/Logger";
import { DI } from "../di/DIContainer";
import { AuthService } from "../service/AuthService";
import { DownStreamService } from "../service/DownStreamService";


var request = require('request');

export class DownStreamController implements Controller {
    private logger: Logger;
    private downStreamService:DownStreamService;


    constructor(){
        this.logger = DI.get(Logger);
        this.downStreamService = DI.get(DownStreamService);
    }

    getRouter(): Router {
        const router = Router();

        router.post('/exp-bkng-rqst', AuthService.verifyToken, async (req: Request, res: Response, next: NextFunction) => {
            try {                
                let token  = await this.downStreamService.expBookingReqDownStreamHandler(req.body.message);  
                res.json({"token":token})              
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });


        router.post('/consume-tms-response',async (req, res) => {
            try {
                let token  = await this.downStreamService.consumeTMSResponse(req.body.message);  
                res.json({"token":token});
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });

    


        return router;
    }


}