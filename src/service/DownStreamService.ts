import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { any, resolve } from "bluebird";
import { GenericUtil } from "../util/GenericUtil";
import { Response } from "express";
import { NextFunction, Request } from "express-serve-static-core";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
var request = require('request');



var fs = require('fs');


export class DownStreamService {
    private logger: Logger;
    private expTmsDataRepository: ExpTmsDataRepository;
    private expResponseDataRepository: ExpResponseDataRepository;


    constructor() {
        this.logger = DI.get(Logger);
        this.expTmsDataRepository = DI.get(ExpTmsDataRepository);
        this.expResponseDataRepository = DI.get(ExpResponseDataRepository);
    }

    async expBookingReqDownStreamHandler(message: any): Promise<any> {
        const token = GenericUtil.generateRandomHash();

        //Remove extraneous fields i.e plannedShipmentDate and plannedShipmentOffset fields
        delete message["plannedShippingDate"];
        delete message["plannedShippingOffset"];
        delete message[""]
        //Insert Exp-Booking Request Data in exp_tms_data Table
        await this.expTmsDataRepository.create({
            "message": message,
            "shipment_Tracking_Number": "",
            "status": "UNPROCESSED",
            "token": token
        });

        return token;
    }

    async expBookingResponseDownStreamHandler(message: any): Promise<any> {
        const token = GenericUtil.generateRandomHash();

        //Insert Exp-Booking Response Data in `exp_response_data` Table
        await this.expResponseDataRepository.create({
            "message": message,
            "shipment_Tracking_Number": message["shipmentTrackingNumber"],
            "status": "UNPROCESSED",
            "token": token
        });

        return token;
    }


    async publishToEXpTMS(): Promise<any> {
        try {
            //Get all the EXP Booking Request Messages which are not sent to EXP TMS system i.e {"status":"UNPROCESSED"}
            const expBookingReqList = await this.expTmsDataRepository.get({ "status": "UNPROCESSED" });
            let expTmsResponse: any[] = [];
            let options: any = {
                'method': 'POST',
                'url': process.env.POST_URL,
                'headers': {
                    'Authorization': process.env.EXP_TMS_AUTH,
                    'Content-Type': 'application/json',
                    'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                },
                body: ""
            };

            for (let expBookingReqItem of expBookingReqList) {
                options["body"] = JSON.stringify(expBookingReqItem);
                expTmsResponse = await request(options, function (error: any, response: any) {
                    if (error) throw new Error(error);
                    response = {
                        statusCode: response.statusCode,
                        data: response.body
                    }
                    console.log("Response from EXP TMS System: ", response)
                    resolve({ res: response })
                });

                //Insert EXP_TMS-Response into `exp_response_data` table
                await this.expResponseDataRepository.create({ "message": "" })


            }



        } catch (e) {
            //resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
        }

    }


    async consumeTMSResponse(expResponseItem: any): Promise<any> {

        let expRespCreateObj = { "customer_order_number":expResponseItem["customer_order_number"],"message": expResponseItem["message"], "shipmentTrackingNumber": expResponseItem["shipmentTrackingNumber"], status: "UNPROCESSED","statusCode":expResponseItem["statusCode"],"parent_uuid":expResponseItem["parent_uuid"] };
        return await this.expResponseDataRepository.create(expRespCreateObj);
    }


}