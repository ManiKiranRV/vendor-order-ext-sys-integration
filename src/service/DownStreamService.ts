import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { any, resolve } from "bluebird";
import { GenericUtil } from "../util/GenericUtil";
import { Response } from "express";
import { NextFunction, Request } from "express-serve-static-core";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { UpdateCoreTablesService } from "./UpdateCoreTablesService";
var request = require('request');

import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { AddressRepository } from "../data/repository/AddressRepository";
import { LobsterTransformationService } from "./LobsterTransformationService";

var fs = require('fs');


export class DownStreamService {
    private logger: Logger;
    private ExpTmsDataRepository: ExpTmsDataRepository;
    private ExpResponseDataRepository: ExpResponseDataRepository;
    private UpdateCoreTablesService: UpdateCoreTablesService;
    private LobsterTransformationService: LobsterTransformationService;
    private VendorBoookingRepository: VendorBookingRepository;
    private AddressRepository: AddressRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpTmsDataRepository = DI.get(ExpTmsDataRepository);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.UpdateCoreTablesService = DI.get(UpdateCoreTablesService);
        this.LobsterTransformationService = DI.get(LobsterTransformationService);
        this.AddressRepository = DI.get(AddressRepository);
        this.VendorBoookingRepository = DI.get(VendorBookingRepository);
    }

    async expBookingReqDownStreamHandler(message: any): Promise<any> {
        const token = GenericUtil.generateRandomHash();

        //Remove extraneous fields i.e plannedShipmentDate and plannedShipmentOffset fields
        delete message["plannedShippingDate"];
        delete message["plannedShippingOffset"];
        delete message[""]
        //Insert Exp-Booking Request Data in exp_tms_data Table
        await this.ExpTmsDataRepository.create({
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
        await this.ExpResponseDataRepository.create({
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
            const expBookingReqList = await this.ExpTmsDataRepository.get({ "status": "UNPROCESSED" });
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
                await this.ExpResponseDataRepository.create({ "message": "" })


            }



        } catch (e) {
            //resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
        }

    }


    async consumeTMSResponse(expResponseItem: any): Promise<any> {

        let expRespCreateObj = { "customer_order_number":expResponseItem["customer_order_number"],"message": expResponseItem["message"], "shipmentTrackingNumber": expResponseItem["shipmentTrackingNumber"], status: "UNPROCESSED","statusCode":expResponseItem["statusCode"],"parent_uuid":expResponseItem["parent_uuid"] };
        
        
        //Update Core Tables

        var dataObj = expResponseItem

        console.log("dataObj",dataObj)

        var updateDocument = await this.UpdateCoreTablesService.updateTmsResCoreTables(dataObj)

        return await this.ExpResponseDataRepository.create(expRespCreateObj);
    }

    /*
        DownStream Service to send EXP Message to TMS System(From LLP Node) & Persisting the TMS Response
    */
    async downStreamToTmsSystem(req:any,res:any): Promise<any> {

        try {
            console.log("Request---------->/n/n",req)

            var message =  JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body
            console.log("Data after converting base64---->/n/n",message)
            let customerOrderNumber = message.principalRef+"";
            
            //Creating the Data Object from exp_tms_data table and Persisting the Data
            var tmsDataobj = {
                status: "UNPROCESSED",
                shipment_Tracking_Number: "",
                message: message,
                customer_order_number: customerOrderNumber
            }
            console.log("Object", tmsDataobj)
            var result = await this.ExpTmsDataRepository.create(tmsDataobj);
                
            //Remove the extraneous fields from message
            delete message["plannedShippingOffset"];
            delete message["plannedShippingDate"];
            delete message["sequence_timestamp"];
            delete message["vcid"];
            delete message["principalRef"];
            delete message["shipper_account_number"];
            delete message["trailToken"];
            //console.log("Message after deleteing-------->/n/n",message);
            
            //Creating the Data Object from tms data and calling TMS URL
            var options = {
                'method': 'POST',
                'url': process.env.POST_URL,
                'headers': {
                    'Authorization': 'Basic ZGhsYmxlc3NibG9DSDpDJDJhTyExbkMhMmVWQDhr',
                    'Content-Type': 'application/json',
                    'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                },
                body: JSON.stringify(message)
            };
            //let resultList: any = []
            console.log("OPTIONS---->\n\n",options)
            var result = await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                // console.log("response--->/n/n",response.body)
                // console.log("shipmentTrackingNumber----->", JSON.parse(response.body).shipmentTrackingNumber)
                var expres = {
                    statusCode: response.statusCode,
                    message: response.body,
                    shipmentTrackingNumber: JSON.parse(response.body).shipmentTrackingNumber,
                    status: "UNPROCESSED",
                    customer_order_number:customerOrderNumber
                }

                console.log("expres----->\n\n",expres)

                console.log("Response ")
                //Save expResponse in `exp_response_data` table along with shipment_Tracking_Number
                var expResponse = await this.ExpResponseDataRepository.create(expres)

                //Update Core Tables

                var updateDocument = await this.UpdateCoreTablesService.updateTmsResCoreTables(expres)

                //Update exp_tms_data with shipment_Tracking_Number
                var whereObj = { "customer_order_number":customerOrderNumber}
                console.log("WhereOBJ---->\n\n",whereObj)
                var updateRes = await this.ExpTmsDataRepository.update(whereObj, {
                    shipment_Tracking_Number: JSON.parse(response.body).shipmentTrackingNumber,
                    status: "PROCESSED"
                })

            });

            resolve({ status: { code: 'Success'}})

        } catch (e) {
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
        }

    }    

    /*
        DownStream Service to send TMS Response to Client2 System & Persisting the TMS Response
    */
    async downStreamToLobsterSystem(req:any,res:any): Promise<any> {

        return new Promise(async (resolve, reject) => {
            try {
                //Get all UNPROCESSED TMS Response Messages from exp_response_data table 
                let tmsResponseList: any = await this.ExpResponseDataRepository.get({ "status": "UNPROCESSED" })
                //Loop the UNPROCESSED rows and submit to LOBSTER SYSTEM
                for (let tmsReponseItem of tmsResponseList) {
                    var resp = JSON.parse(tmsReponseItem.dataValues.message)
                    var conMessage
                    var resp = JSON.parse(tmsReponseItem.dataValues.message);
                    //Derive accountNumber to be sent to LOSTER system
                    let vendorOrderItem = (await this.VendorBoookingRepository.get({ "customer_order_number": tmsReponseItem["customer_order_number"] }));
                    if (vendorOrderItem.length > 0) {
                        var id = vendorOrderItem[0]["id"]
                    } else {
                        //Save Error Message to exp_response_data table
                        await this.ExpResponseDataRepository.update({ "id": tmsReponseItem.id }, { "status": "ERROR", "error_reason": `No Vendor Booking Found with customer_order_number=${tmsReponseItem["customer_order_number"]}` });
                        continue;
                    }

                    let addressList = await this.AddressRepository.get({ "address_type": "consignor", "parent_id": id });
                    let accountNumber;

                    if (addressList.length > 0) {
                        accountNumber = addressList[0]["address_id"];
                    } else {
                        accountNumber = "";
                    }
                    console.log(`Account Number is ${accountNumber}`)

                    var message = {
                        "content": {
                            "accountNumber": accountNumber,
                            "HAWB": resp.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": tmsReponseItem["customer_order_number"],
                            "documents": resp.documents
                        }
                    };

                    //Removing extraneous fields in the error message
                    var errorBody = JSON.parse(tmsReponseItem.dataValues.message)
                    delete errorBody["instance"];
                    delete errorBody["message"];
                    var errorMessage = {
                        "content": {
                            "accountNumber": accountNumber,
                            "HAWB": resp.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": tmsReponseItem["customer_order_number"],
                            "documents": resp.documents
                        },
                        "error": errorBody
                    };

                    //Construct final Loster POST message
                    if (tmsReponseItem.dataValues.statusCode == 201) {
                        conMessage = await this.LobsterTransformationService.lobData(message);
                    } else {
                        conMessage = await this.LobsterTransformationService.lobData(errorMessage, true);
                    }

                    console.log("conMessage", conMessage)

                    var options = {
                        'method': 'POST',
                        'url': process.env.LOBSTER_POST_URL,
                        'headers': {
                            'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                            'Content-Type': 'text/plain'
                        },
                        body: JSON.stringify(conMessage.tdata)
                    };

                    this.logger.log(`Lobster Options is ${JSON.stringify(options)}`);
                    var result = await request(options, async (error: any, response: any) => {
                        if (error) throw new Error(error);
                        //Save response from Lobster system to exp_response table

                        console.log("response----->", response.body)
                        var expResponse = await this.ExpResponseDataRepository.update({ "id": tmsReponseItem.id }, { "status": response.body, "request": JSON.stringify(options) });
                        //console.log("Response---->", expResponse)

                    });
                    resolve({ 'status': "Success" })
                }
            } catch (error) {
                //Update processing_status of events table to ERROR
                await this.ExpResponseDataRepository.update({ "id": id }, { "status": "ERROR", "error_reason": error });
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: error } })
            }
        })
    }    

}