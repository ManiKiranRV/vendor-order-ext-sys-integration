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

export class ShipmentController implements Controller {
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

    
        //DOWNSTREAM LLP-TMS(EXP Request Data) & LLP-CLIENT2(TMS Response)//  

        router.post('/tmsResponse', async (req:any, res) => {
            try {
                this.logger.log(`=============================================START-LLP -TMS DOWNSTREAM=======================================`)
                //this.logger.log(`BLESS REQUEST BODY is ${JSON.stringify(req.body.message)}`);
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

        //DOWNSTREAM CLIENT2-LOBSTER//
        
        router.post('/client-lobster-tms-resp', async (req:any, res) => {
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

        router.post('/lobsterData',async (req, res) => {
            try {

                var lobMessage;

                lobMessage = await this.LobsterService.postTmsResponseToLobster();

                res.json({lobdata: lobMessage });
                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        }); 
        
        
        //Post Events Data to Lobster
        router.post('/events-to-lobster',async (req, res) => {
            try {
                let result = await this.LobsterService.postEventsToLobster();
                res.json({result});                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);
            }
        }); 
        
        //DATAGEN

        router.post('/datagen',async (req, res) => {
            try {
                var pubMessage;
                //pubMessage = await this.DataGenTransformationService.dataGenTransformation("VND_ORD_LLP_TMS_DATAGEN");
                res.json({data: pubMessage });                
            } catch (error) {
                let response: any = { status: { code: 'FAILURE', message: error } }
                res.json(response);

            }
        }); 

        // To get TMS DATA
        router.post('/expTmsData', async (req, res) => {
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