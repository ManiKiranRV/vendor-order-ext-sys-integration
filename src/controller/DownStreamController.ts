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
    private downStreamService: DownStreamService;
    private expResponseDataRepository: ExpResponseDataRepository;


    constructor() {
        this.logger = DI.get(Logger);
        this.downStreamService = DI.get(DownStreamService);
        this.expResponseDataRepository = DI.get(ExpResponseDataRepository);
    }

    getRouter(): Router {
        const router = Router();

        router.post('/exp-bkng-rqst', AuthService.verifyToken, async (req: Request, res: Response, next: NextFunction) => {
            try {
                let token = await this.downStreamService.expBookingReqDownStreamHandler(req.body.message);
                res.json({ "token": token })
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });


        router.post('/consume-tms-response', async (req, res) => {
            try {
                let expResponseList;
                if (Array.isArray(req.body)) {
                    expResponseList = req.body;
                } else {
                    expResponseList = [req.body];
                }
                this.logger.log(`req.body is ${JSON.stringify(req.body)}`)
                await this.downStreamService.consumeTMSResponse(req.body["tmsResponse"]);
                res.json({ "token": "" });

            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);
            }
        });




        return router;
    }


}