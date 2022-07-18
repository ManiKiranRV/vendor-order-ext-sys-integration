import { Controller } from "./Controller";
import { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { Logger } from "../logger/Logger";
import { DI } from "../di/DIContainer";
import { ExpTmsService } from "../service/ExpTmsService";
import { ExpResponseDataService } from "../service/ExpResponseDataService";
import { LobsterService } from "../service/LobsterService";
import { AuthService } from "../service/AuthService";


var request = require('request');

export class ShipmentController implements Controller {
    private logger: Logger = DI.get(Logger)
    private ExpTmsService: ExpTmsService = DI.get(ExpTmsService)
    private ExpResponseDataService: ExpResponseDataService = DI.get(ExpResponseDataService)
    private LobsterService: LobsterService = DI.get(LobsterService);
    private authService: AuthService;

    constructor(){
        this.authService = DI.get(AuthService);
    }

    getRouter(): Router {
        const router = Router();


        router.post('/expResponse',async (req, res) => {
            try {

                var responseData, response;
                console.log("Request Body inside ShipmentController",req.body)
                
                responseData = await this.ExpTmsService.ExpDhl(req, res)
                // console.log("Response in ShipmentController",responseData)

                // response = await this.ExpResponseDataService.expResData(responseData, res)
                res.json({ status: { code: 'SUCCESS', message: "Created Successfully" }});
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });

    
        router.post('/expTmsData',async (req, res) => {
            try {

                var result;
                console.log("Request Body inside ShipmentController",req.body)

                result = await this.ExpTmsService.expTmsData(req.body,res)
                console.log("Response in ShipmentController",result)
                
                res.json({ status: { code: 'SUCCESS', message: "Created Successfully" }, data: result });

            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: "Error While Uploading The File" } }
                res.json(response);

            }
        });

        router.post('/lobsterData/:arg1',async (req, res) => {
            try {

                var expData, expResData, lobMessage;
                console.log("Request Body inside ShipmentController",req.params.arg1)

                let shipmentTrackingNumber = req.params.arg1
                expData = await this.ExpTmsService.getexpTmsData(shipmentTrackingNumber, res)
                var trsd = expData.res.dataValues.message
                expResData = await this.ExpResponseDataService.getexpResData(shipmentTrackingNumber, res)

                var resp = JSON.parse(expResData.res.dataValues.message)

                var message = {
                    "content":{
                        "accountNumber": trsd.accounts[0].number,
                        "HWAB": resp.shipmentTrackingNumber,
                        "PrincipalreferenceNumber": trsd.content.packages[0].customerReferences[0].value,
                        "documents": resp.documents
                    }
                };

                lobMessage = await this.LobsterService.lobData(message, res)
                console.log("LobMessage", lobMessage)
                res.json({lobdata: lobMessage });
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });


        return router;
    }


}