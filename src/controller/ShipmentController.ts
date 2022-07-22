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

        //LLP-TMS//

        router.post('/expResponse',async (req, res) => {
            try {

                var responseData, response;
                //console.log("Request Body inside ShipmentController",req.body)
                
                responseData = await this.ExpTmsService.ExpDhl()
                // console.log("Response in ShipmentController",responseData)

                // response = await this.ExpResponseDataService.expResData(responseData, res)
                res.json({ status: { code: 'SUCCESS', message: "Created Successfully" }});
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });

    
        //LLP-CLIENT2//  

        router.post('/tmsResponse',async (req, res) => {
            try {

                var response;

                console.log("Inside tmsResponse--->")

                response = await this.ExpTmsService.clientTmsResponse();

                res.json({lobdata: response });
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });

        //CLIENT2-LOBSTER//    

        router.post('/lobsterData',async (req, res) => {
            try {

                var lobMessage;

                lobMessage = await this.ExpTmsService.postToLobsterSystem(res);

                res.json({lobdata: lobMessage });
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        });        


        router.post('/expTmsData',async (req, res) => {
            try {

                var result;
                //console.log("Request Body inside ShipmentController",req.body)

                result = await this.ExpTmsService.expTmsData(req.body,res)
               // console.log("Response in ShipmentController",result)
                
                res.json({ status: { code: 'SUCCESS', message: "Created Successfully" }, data: result });

            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: "Error While Uploading The File" } }
                res.json(response);

            }
        });        

        return router;
    }


}