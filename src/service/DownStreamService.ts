import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { any, resolve } from "bluebird";
import { GenericUtil } from "../util/GenericUtil";
import { FileUtil } from "../util/FileUtil";
import { Response } from "express";
import { NextFunction, Request } from "express-serve-static-core";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { UpdateCoreTablesService } from "./UpdateCoreTablesService";
var request = require('request');

import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { AddressRepository } from "../data/repository/AddressRepository";
import { LobsterTransformationService } from "./LobsterTransformationService";
import { DataGenTransformationService } from "../service/DataGenTransformationService";

var fs = require('fs');


export class DownStreamService {
    private logger: Logger;
    private ExpTmsDataRepository: ExpTmsDataRepository;
    private ExpResponseDataRepository: ExpResponseDataRepository;
    private UpdateCoreTablesService: UpdateCoreTablesService;
    private LobsterTransformationService: LobsterTransformationService;
    private VendorBoookingRepository: VendorBookingRepository;
    private AddressRepository: AddressRepository;
    private DataGenTransformationService: DataGenTransformationService;
    private genericUtil: GenericUtil;
    private fileUtil: FileUtil;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpTmsDataRepository = DI.get(ExpTmsDataRepository);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.UpdateCoreTablesService = DI.get(UpdateCoreTablesService);
        this.LobsterTransformationService = DI.get(LobsterTransformationService);
        this.AddressRepository = DI.get(AddressRepository);
        this.VendorBoookingRepository = DI.get(VendorBookingRepository);
        this.DataGenTransformationService = DI.get(DataGenTransformationService);
        this.genericUtil = DI.get(GenericUtil);
        this.fileUtil = DI.get(FileUtil);
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
        let message:any
        let customerOrderNumber:any
        try {
            this.logger.log("Request---------->/n/n",req)

            message =  JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body
            this.logger.log("Data after converting base64---->/n/n",message)
            customerOrderNumber = message.principalRef+"";
            const token = GenericUtil.generateRandomHash();
            //Creating the Data Object from exp_tms_data table and Persisting the Data
            var tmsDataobj = {
                status: "UNPROCESSED",
                shipment_Tracking_Number: "",
                message: message,
                customer_order_number: customerOrderNumber,
                token:token
            }
            //this.logger.log("Object", tmsDataobj)
            await this.ExpTmsDataRepository.create(tmsDataobj);

            
                
            //Remove the extraneous fields from message
            delete message["plannedShippingOffset"];
            delete message["plannedShippingDate"];
            delete message["sequence_timestamp"];
            delete message["vcid"];
            delete message["principalRef"];
            delete message["shipper_account_number"];
            delete message["trailToken"];
            //this.logger.log("Message after deleteing-------->/n/n",message);
            
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
            //Write the request to file
            console.log("MESSAGE------------------------------------------------------>",JSON.stringify(message));
            const fileName: string = GenericUtil.generateHash(JSON.stringify(message));
            const filePath = process.env.REQ_TO_TMS_FILE_PATH+ fileName + '.txt'
            this.fileUtil.writeToFile(filePath, JSON.stringify(message));
            this.logger.log(`filePath is -----------------------------> ${filePath}`);
            this.logger.log(`fileName is -----------------------------> ${fileName}`);

            //this.logger.log("OPTIONS---->\n\n",options)
            await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                var expres = {
                    statusCode: response.statusCode,
                    message: response.body,
                    shipmentTrackingNumber: JSON.parse(response.body).shipmentTrackingNumber,
                    status: "UNPROCESSED",
                    customer_order_number:customerOrderNumber,
                    req_file_path:filePath,
                    req_file_uuid:fileName
                }

                this.logger.log("expres----->\n\n",expres)
                //this.logger.log("Response-------->\n\n",Buffer.from(JSON.stringify({"body":expres})).toString("base64"))

                //Save expResponse in `exp_response_data` table along with shipment_Tracking_Number
                await this.ExpResponseDataRepository.create(expres)

                //Update Core Tables
                await this.UpdateCoreTablesService.updateTmsResCoreTables(expres)

                //Update exp_tms_data with shipment_Tracking_Number
                let whereObj = { "customer_order_number":customerOrderNumber}
                //this.logger.log("WhereOBJ---->\n\n",whereObj)
                await this.ExpTmsDataRepository.update(whereObj, {
                    shipment_Tracking_Number: JSON.parse(response.body).shipmentTrackingNumber,
                    status: "PROCESSED"
                })

                // Datagen service Sends TMS-Resp from LLP to Client2
                const updateObj = { status: "PROCESSED" }
                await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RESP_MSG!);
                // this.logger.log("AFTER DATAGEN RES TABLES---->",whereObj,updateObj)
                //await this.ExpResponseDataRepository.update( whereObj, updateObj );
                // this.logger.log("updateStatus----------->",updateStatus)
            });

            // let whereObj = { "customer_order_number":customerOrderNumber}
            // let updateObj = { status: "PROCESSED" }
            // this.logger.log("AFTER DATAGEN RES TABLES---->",whereObj,updateObj);
            // await this.ExpResponseDataRepository.update(whereObj,updateObj);
            return token

        } catch (error) {
            //resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            //Update processing_status of events table to ERROR
            console.log("Error----->",error)
            //await this.ExpResponseDataRepository.update({ "customer_order_number" : customerOrderNumber }, { "status": "ERROR", "error_reason": error });
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: error } });
        }

    }    

    /*
        DownStream Service to send TMS Response to LOBSTER System & Persisting the LOBSTER Response
    */
    async downStreamToLobsterSystem(req:any,res:any): Promise<any> {
        let baseMessage:any
        try {

            baseMessage =  JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body
            this.logger.log("Data after converting base64---->/n/n",baseMessage)
            var conMessage
            const token = GenericUtil.generateRandomHash();
            var expres = {
                statusCode: baseMessage.statusCode,
                message: baseMessage.message,
                shipmentTrackingNumber: baseMessage.shipmentTrackingNumber,
                status: "UNPROCESSED",
                customer_order_number:baseMessage.customer_order_number
            }
            //Update Core Tables

            var updateDocument = await this.UpdateCoreTablesService.updateTmsResCoreTables(expres)

            //Derive accountNumber to be sent to LOSTER system
            this.logger.log("baseMessage.customer_order_number-------->\n\n",baseMessage.customer_order_number)
            let vendorOrderItem = (await this.VendorBoookingRepository.get({ "customer_order_number": baseMessage.customer_order_number }));
            
            if (vendorOrderItem.length > 0) {
                var id = vendorOrderItem[0]["id"]
            }else {
                //Save Error Message to exp_response_data table
                await this.ExpResponseDataRepository.update({ "customer_order_number": baseMessage.customer_order_number }, { "status": "ERROR", "error_reason": `No Vendor Booking Found with customer_order_number=${baseMessage["customer_order_number"]}` });
                //continue;
            }

            let addressList = await this.AddressRepository.get({ "address_type": "CONSIGNOR", "customer_order_number": baseMessage.customer_order_number });
            let accountNumber;
            this.logger.log("Account List",addressList)
            this.logger.log("Account Number is from List",addressList[0]["address_id"])
            // this.logger.log("Estimated Date---->",JSON.parse(baseMessage.message).estimatedDeliveryDate.estimatedDeliveryDate)
            if (addressList.length > 0) {
                accountNumber = addressList[0]["address_id"];
            } else {
                accountNumber = "";
            }
            this.logger.log(`Account Number is ${accountNumber}`)
                    
            //Construct final Lobster POST message
            if (baseMessage.statusCode == 201) {
                var successMessage = {
                    "content": {
                        "accountNumber": accountNumber,
                        "HAWB": baseMessage.shipmentTrackingNumber,
                        "PrincipalreferenceNumber": baseMessage.customer_order_number,
                        "documents": JSON.parse(baseMessage.message).documents,
                        "estimatedDeliveryDate":  JSON.parse(baseMessage.message).estimatedDeliveryDate.estimatedDeliveryDate
                    }
                };
    
                this.logger.log("message----->\n\n",successMessage)
                conMessage = await this.LobsterTransformationService.lobData(successMessage);
            } else {
                //Removing extraneous fields in the error message
                var errorBody = JSON.parse(baseMessage.message)
                delete errorBody["instance"];
                delete errorBody["message"];
                var errorMessage = {
                    "content": {
                        "accountNumber": accountNumber,
                        "HAWB": baseMessage.shipmentTrackingNumber,
                        "PrincipalreferenceNumber": baseMessage.customer_order_number,
                        "documents": JSON.parse(baseMessage.message).documents,
                        "estimatedDeliveryDate":"null"
                    },
                    "error": errorBody
                };

                this.logger.log("errorMessage--->",errorMessage)
                conMessage = await this.LobsterTransformationService.lobData(errorMessage, true);
            }

            this.logger.log("conMessage---->", conMessage)
            const fileName: string = GenericUtil.generateHash(JSON.stringify(conMessage.tdata));
            const filePath = process.env.REQ_TO_LOBSTER_FILE_PATH+ fileName + '.txt'
            this.fileUtil.writeToFile(filePath, JSON.stringify(conMessage.tdata));
            this.logger.log(`filePath is ${filePath}`);
            var options = {
                'method': 'POST',
                'url': process.env.LOBSTER_POST_URL,
                'headers': {
                    'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify(conMessage.tdata)
            };

            

            // this.logger.log(`Lobster Options is ${JSON.stringify(options)}`);
            var result = await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                //Save response from Lobster system to exp_response table

                this.logger.log("response----->", response.body)
                var expResponse = await this.ExpResponseDataRepository.update({ "customer_order_number": baseMessage.customer_order_number }, { "status": response.body, "token":token, "req_file_path": filePath, "req_file_uuid": fileName }); //, "request": JSON.stringify(options)
                //this.logger.log("Response---->", expResponse)

            });
            return token
            //}
        } catch (error) {
            //Update processing_status of events table to ERROR
            console.log("Error----->",error)
            //await this.ExpResponseDataRepository.update({ "customer_order_number":baseMessage.customer_order_number }, { "status": "ERROR", "error_reason": error });
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: error } });
        }
    }    
    


}