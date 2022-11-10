import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { any, resolve } from "bluebird";
import { GenericUtil } from "../util/GenericUtil";
import { FileUtil } from "../util/FileUtil";
import { Response } from "express";
//import { NextFunction, Request } from "express-serve-static-core";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { UpdateCoreTablesService } from "./UpdateCoreTablesService";
var request = require('request');

import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { AddressRepository } from "../data/repository/AddressRepository";
import { LobsterTransformationService } from "./LobsterTransformationService";
import { DataGenTransformationService } from "../service/DataGenTransformationService";

//Rates

import { ExpRateTmsDataRepository } from "../data/repository/ExpRateTmsDataRepository";
import { ExpRateResponseDataRepository } from "../data/repository/ExpRateResponseDataRepository";


var fs = require('fs');

//For Timestamp
import * as moment from 'moment';
var today = new Date();
var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss.SSSZ") + ' UTC' + moment.utc(today).format("Z")


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

    private ExpRateTmsDataRepository: ExpRateTmsDataRepository;
    private ExpRateResponseDataRepository: ExpRateResponseDataRepository;

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

        this.ExpRateTmsDataRepository = DI.get(ExpRateTmsDataRepository);
        this.ExpRateResponseDataRepository = DI.get(ExpRateResponseDataRepository);
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
        let data:any
        let message:any
        let customerOrderNumber:any
        let plannedPickupDateAndTime:any
        let pickUpFlag:any
        let insertFalg:any
        try {
            this.logger.log("Request---------->/n/n",req)
            data = req.transformedMessage
            message =  JSON.parse(Buffer.from(data, 'base64').toString('utf-8')).body
            this.logger.log("Data after converting base64---->/n/n",message)
            customerOrderNumber = message["customerReferences"][0].value
            //console.log("Adding additional field------>",message["customerReferences"][0].value+"-"+message["consignorRef"])
            message["customerReferences"][0].value = message["customerReferences"][0].value+"-"+message["consignorRef"]
            this.logger.log("Data after adding additional Details---->/n/n",message)
            // customerOrderNumber = message.principalRef+"";/
            plannedPickupDateAndTime = message.plannedPickupDateAndTime
            console.log("plannedPickupDateAndTime--->",plannedPickupDateAndTime)
            pickUpFlag = message.pickup.isRequested
            const token = GenericUtil.generateRandomHash();
            //Creating the Data Object from exp_tms_data table and Persisting the Data
            var tmsDataobj = {
                status: "UNPROCESSED",
                shipment_Tracking_Number: "",
                message: message,
                customer_order_number: customerOrderNumber,
                uuid:req.id,
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
            // delete message["plannedShippingDateAndTime"]
            delete message["plannedPickupDateAndTime"]
            delete message["trailToken"];
            delete message["consignorRef"]
            this.logger.log("Message after deleteing-------->/n/n",message);
            
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

            this.logger.log("OPTIONS---->\n\n",options)
            console.log("Timestamp before sending to TMS System--->",todayUTC);
            await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                console.log("Timestamp after getting response from TMS System--->",todayUTC);
                this.logger.log("Response from TMS System--->",JSON.parse(response.body))
                this.logger.log("TMS Response Status COde---->",response.statusCode)
                let expres:any
                let dispatchConfirmationNumber:any
                // If response is success then 
                if (response.statusCode == 200 || response.statusCode == 201){
                    //Check pickup flag = true in TMS Request
                    this.logger.log("plannedPickupDateAndTime & Flag--->",plannedPickupDateAndTime,pickUpFlag)
                    if(pickUpFlag == true){
                        expres = {
                            statusCode: response.statusCode,
                            message: response.body,
                            shipmentTrackingNumber: JSON.parse(response.body).shipmentTrackingNumber,
                            status: "UNPROCESSED",
                            customer_order_number:customerOrderNumber,
                            req_file_path:filePath,
                            req_file_uuid:fileName,
                            msgTyp:"PICKUP"
                        }
                        console.log("If data is success and flag is true response object")
                        this.logger.log("expres----->\n\n",expres)
                        
                        //Save expResponse in `exp_response_data` table along with shipment_Tracking_Number
                        await this.ExpResponseDataRepository.create(expres)
                        dispatchConfirmationNumber = JSON.parse(response.body).dispatchConfirmationNumber
                        this.logger.log("dispatchConfirmationNumber---->",dispatchConfirmationNumber)
                        var pickupData = {
                            "plannedPickupDateAndTime":plannedPickupDateAndTime,
			                "originalShipperAccountNumber":message.accounts[0].number,
                            "accounts":message.accounts,
                            "customerDetails":message.customerDetails
                        }
                        this.logger.log("pickupData-------->",pickupData)
                        var pickupOptions = {
                            'method': 'PATCH',
                            'url': process.env.POST_URL_PICKUP+dispatchConfirmationNumber,
                            'headers': {
                                'Authorization': 'Basic ZGhsYmxlc3NibG9DSDpDJDJhTyExbkMhMmVWQDhr',
                                'Content-Type': 'application/json',
                                'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                            },
                            body : JSON.stringify(pickupData)
                        };
                        this.logger.log("pickupOptions------>",pickupOptions)
                        await request(pickupOptions, async (error: any, response: any) => {
                            if (error) throw new Error(error);
                            this.logger.log("Response from TMS System--->",JSON.parse(response.body))
                            this.logger.log("TMS Response Status COde---->",response.statusCode)
                            this.logger.log("customerOrderNumber inside pickup response---->",customerOrderNumber)
                            var updatePickupRes = {
                                statusCode: response.statusCode,
                                pickupResponse: response.body,
                            }
                            let whereObj = { "customer_order_number":customerOrderNumber}
                            this.logger.log("PICKUP OBJECT for exp_resp_data table",updatePickupRes)
                            //Save expResponse in `exp_response_data` table along with shipment_Tracking_Number
                            await this.ExpResponseDataRepository.update(whereObj,updatePickupRes)

                            //Update Core Tables
                            // await this.UpdateCoreTablesService.updateTmsResCoreTables(expres)

                            //Update exp_tms_data with shipment_Tracking_Number
                            // let whereObj = { "customer_order_number":customerOrderNumber}
                            await this.ExpTmsDataRepository.update(whereObj, {
                                shipment_Tracking_Number: JSON.parse(response.body).shipmentTrackingNumber,
                                status: "PROCESSED"
                            })

                            // Datagen service Sends TMS-Resp from LLP to Client2
                            const updateObj = { status: "PROCESSED" }
                            await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RESP_MSG!);
                
                        })
                    }
                    else{
                        expres = {
                            statusCode: response.statusCode,
                            message: response.body,
                            shipmentTrackingNumber: JSON.parse(response.body).shipmentTrackingNumber,
                            status: "UNPROCESSED",
                            customer_order_number:customerOrderNumber,
                            req_file_path:filePath,
                            req_file_uuid:fileName,
                            msgTyp:"BOOKING"
                        }
                        console.log("If data is success and flag is false response object")
                        this.logger.log("expres----->\n\n",expres)
                        
                        //Save expResponse in `exp_response_data` table along with shipment_Tracking_Number
                        await this.ExpResponseDataRepository.create(expres)

                        //Update Core Tables
                        await this.UpdateCoreTablesService.updateTmsResCoreTables(expres)

                        //Update exp_tms_data with shipment_Tracking_Number
                        let whereObj = { "customer_order_number":customerOrderNumber}
                        await this.ExpTmsDataRepository.update(whereObj, {
                            shipment_Tracking_Number: JSON.parse(response.body).shipmentTrackingNumber,
                            status: "PROCESSED"
                        })

                        // Datagen service Sends TMS-Resp from LLP to Client2
                        const updateObj = { status: "PROCESSED" }
                        await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RESP_MSG!);
                
                    }
                }else{
                    // If response is error then
                    expres = {
                        statusCode: response.statusCode,
                        message: response.body,
                        shipmentTrackingNumber: JSON.parse(response.body).shipmentTrackingNumber,
                        status: "UNPROCESSED",
                        customer_order_number:customerOrderNumber,
                        req_file_path:filePath,
                        req_file_uuid:fileName,
                        msgTyp:"BOOKING"
                    }
                    this.logger.log("expres----->\n\n",expres)

                    //Save expResponse in `exp_response_data` table along with shipment_Tracking_Number
                    await this.ExpResponseDataRepository.create(expres)

                    //Update Core Tables
                    await this.UpdateCoreTablesService.updateTmsResCoreTables(expres)

                    //Update exp_tms_data with shipment_Tracking_Number
                    let whereObj = { "customer_order_number":customerOrderNumber}
                    await this.ExpTmsDataRepository.update(whereObj, {
                        shipment_Tracking_Number: JSON.parse(response.body).shipmentTrackingNumber,
                        status: "PROCESSED"
                    })

                    // Datagen service Sends TMS-Resp from LLP to Client2
                    const updateObj = { status: "PROCESSED" }
                    await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RESP_MSG!);
                
                    
                }
                
                

                // this.logger.log("expres----->\n\n",expres)
                // //this.logger.log("Response-------->\n\n",Buffer.from(JSON.stringify({"body":expres})).toString("base64"))

                // //Save expResponse in `exp_response_data` table along with shipment_Tracking_Number
                // await this.ExpResponseDataRepository.create(expres)

                // //Update Core Tables
                // await this.UpdateCoreTablesService.updateTmsResCoreTables(expres)

                // //Update exp_tms_data with shipment_Tracking_Number
                // let whereObj = { "customer_order_number":customerOrderNumber}
                // //this.logger.log("WhereOBJ---->\n\n",whereObj)
                // await this.ExpTmsDataRepository.update(whereObj, {
                //     shipment_Tracking_Number: JSON.parse(response.body).shipmentTrackingNumber,
                //     status: "PROCESSED"
                // })

                // // Datagen service Sends TMS-Resp from LLP to Client2
                // const updateObj = { status: "PROCESSED" }
                // await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RESP_MSG!);
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
            console.log("Timestamp at Client2 side after Datagen happen--->",todayUTC);
            baseMessage =  JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body
            this.logger.log("Data after converting base64---->/n/n",baseMessage)
            let conMessage
            let expres
            let successMessage:any
            let errorMessage:any
            let options:any
            let customer_order_number:any
            const token = GenericUtil.generateRandomHash();
            console.log("baseMessage.msgTyp--->",baseMessage.msgTyp)
            if(baseMessage.msgTyp == "PICKUP"){
                // let whereObj:any = []
                // whereObj["status"]="UNPROCESSED" 
                // whereObj["msgTyp"]="PICKUP"
                // console.log("whereObj inside PICKUP condition",whereObj)
                // var tmsResponseList = await this.ExpResponseDataRepository.get(whereObj)  
                // console.log("Fetch data in downStreamToLobsterSystemRates------->",tmsResponseList)
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
                // for (let tmsReponseItem of tmsResponseList){
    
                    // console.log("tmsReponseItem-------->",tmsReponseItem)
    
                    let msgType = process.env.DATAGEN_TMS_RESP_MSG
                    let data = baseMessage.message
                    customer_order_number = baseMessage.customer_order_number
                    console.log("Message------>",data)
                    
                    //Construct final Lobster POST message
                    if (baseMessage.statusCode == 200) {
                        successMessage = { 
                            "pickUp":baseMessage.msgTyp, 
                            "msgType":msgType,                      
                            "content": {                            
                                "accountNumber": accountNumber,
                                "HAWB": baseMessage.shipmentTrackingNumber,
                                "PrincipalreferenceNumber": baseMessage.customer_order_number,
                                "documents": JSON.parse(baseMessage.message).documents,
                                "trackingUrl":  JSON.parse(baseMessage.message).trackingUrl,
                                "estimatedDeliveryDate":  JSON.parse(baseMessage.message).estimatedDeliveryDate.estimatedDeliveryDate,
                                "Updatepickup":  "Success"
                            }
                        };
            
                        this.logger.log("message----->\n\n",successMessage)
                        conMessage = await this.LobsterTransformationService.lobData(successMessage);
                    }else{
                        console.log("Error Details--->",JSON.parse(baseMessage.pickupResponse).detail)
                        var errorBody = JSON.parse(baseMessage.pickupResponse).detail
                        errorMessage = {
                            "msgType":msgType,
                            "content": {   
                                "pickUp":baseMessage.msgTyp,                          
                                "accountNumber": accountNumber,
                                "HAWB": baseMessage.shipmentTrackingNumber,
                                "PrincipalreferenceNumber": baseMessage.customer_order_number,
                                "documents": JSON.parse(baseMessage.message).documents,
                                "trackingUrl":  JSON.parse(baseMessage.message).trackingUrl,
                                "estimatedDeliveryDate":JSON.parse(baseMessage.message).estimatedDeliveryDate.estimatedDeliveryDate,
                                "Updatepickup":  "Error:"+errorBody
                            }    
                        };
            
                        this.logger.log("Error message----->\n\n",errorMessage)
                        conMessage = await this.LobsterTransformationService.lobData(errorMessage);
                    }
    
                    this.logger.log("conMessage---->", conMessage)
                    const fileName: string = GenericUtil.generateHash(JSON.stringify(conMessage.tdata));
                    const filePath = process.env.REQ_TO_LOBSTER_FILE_PATH+ fileName + '.txt'
                    this.fileUtil.writeToFile(filePath, JSON.stringify(conMessage.tdata));
                    this.logger.log(`filePath is ${filePath}`);
                    options = {
                        'method': 'POST',
                        'url': process.env.LOBSTER_POST_URL,
                        'headers': {
                            'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                            'Content-Type': 'text/plain'
                        },
                        // body: JSON.stringify(conMessage.tdata)
                        body: JSON.stringify(conMessage.tdata)
                    };
    
                    
    
                    this.logger.log(`Lobster Options is ${options}`);
                    console.log("Timestamp before sending request to Lobster system--->",todayUTC);
                    var result = await request(options, async (error: any, response: any) => {
                        if (error) throw new Error(error);
                        console.log("Timestamp after getting response from Lobster system--->",todayUTC);
                        //Save response from Lobster system to exp_response table
    
                        this.logger.log("response----->", response.body)
                        // var expResponse = await this.ExpResponseDataRepository.update({ "customer_order_number": baseMessage.customer_order_number }, { "status": response.body, "token":token, "req_file_path": filePath, "req_file_uuid": fileName }); //, "request": JSON.stringify(options)
                        const whereObj = { "customer_order_number":customer_order_number}
                        this.logger.log("AFTER DATAGEN RES TABLES---->",whereObj)
                        var expResponse =    await this.ExpResponseDataRepository.update(whereObj,{ "statusCode": response.body, "status": "PROCESSED", "req_file_path": filePath, "req_file_uuid": fileName});
                        // const whereObj = { "sequence_timestamp":sequence_timestamp}
                        // const updateObj = { "status": "PROCESSED"}
                        // this.logger.log("AFTER DATAGEN RES TABLES---->",whereObj,updateObj)
                        // var expResponse =    await this.ExpResponseDataRepository.update(whereObj,updateObj);
                        
                        //this.logger.log("Response---->", expResponse)
    
                    });
    
                    
                    
    
                // }                 
            }else{
                expres = {
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
                //this.logger.log(`Account Number is ${accountNumber}`)
                  this.logger.log("Tracking URL--->", JSON.parse(baseMessage.message).trackingUrl) 
                  let msgType = process.env.DATAGEN_TMS_RESP_MSG    
                //Construct final Lobster POST message
                if (baseMessage.statusCode == 201) {
                    successMessage = {  
                        "msgType":msgType,                      
                        "content": {                            
                            "accountNumber": accountNumber,
                            "HAWB": baseMessage.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": baseMessage.customer_order_number,
                            "documents": JSON.parse(baseMessage.message).documents,
                            "estimatedDeliveryDate":  JSON.parse(baseMessage.message).estimatedDeliveryDate.estimatedDeliveryDate,
                            "trackingUrl":  JSON.parse(baseMessage.message).trackingUrl
                        }
                    };
        
                    this.logger.log("message----->\n\n",successMessage)
                    conMessage = await this.LobsterTransformationService.lobData(successMessage);
                } else {
                    //Removing extraneous fields in the error message
                    var errorBody = JSON.parse(baseMessage.message)
                    delete errorBody["instance"];
                    delete errorBody["message"];
                    errorMessage = {
                        "msgType":msgType,
                        "content": {                            
                            "accountNumber": accountNumber,
                            "HAWB": baseMessage.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": baseMessage.customer_order_number,
                            "documents": JSON.parse(baseMessage.message).documents,
                            "estimatedDeliveryDate":"null",
                            "trackingUrl":"null"
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
                // this.logger.log(`filePath is ${filePath}`);
                options = {
                    'method': 'POST',
                    'url': process.env.LOBSTER_POST_URL,
                    'headers': {
                        'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify(conMessage.tdata)
                };
    
                
    
                // this.logger.log(`Lobster Options is ${JSON.stringify(options)}`);
                console.log("Timestamp before sending request to Lobster system--->",todayUTC);
                var result = await request(options, async (error: any, response: any) => {
                    if (error) throw new Error(error);
                    console.log("Timestamp after getting response from Lobster system--->",todayUTC);
                    //Save response from Lobster system to exp_response table
    
                    this.logger.log("response----->", response.body)
                    var expResponse = await this.ExpResponseDataRepository.update({ "customer_order_number": baseMessage.customer_order_number }, { "status": response.body, "token":token, "req_file_path": filePath, "req_file_uuid": fileName }); //, "request": JSON.stringify(options)
                    //this.logger.log("Response---->", expResponse)
    
                });
            }

            return token
            //}
        } catch (error) {
            //Update processing_status of events table to ERROR
            console.log("Error----->",error)
            //await this.ExpResponseDataRepository.update({ "customer_order_number":baseMessage.customer_order_number }, { "status": "ERROR", "error_reason": error });
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: error } });
        }
    }  
    
    /*
        DownStream Service to send Rates Message to TMS System(From LLP Node) & Persisting the exp_rate_response_data
    */   
    
    async downStreamToTmsSystemRates(req:any,res:any): Promise<any> {

        let message:any
        let shipper_account_number:any
        let sequence_timestamp:any
		let shipper_postalCode:any
        let receiver_postalCode:any 
        let customer_reference:any        
        let token:any
        let vcid:any
        try {
            this.logger.log("Request---------->/n/n",req)

            message =  JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body //Uncomment when request is coming form BLESS
            this.logger.log("Data after converting base64---->/n/n",message)

            //Delete

            // message = req

            // console.log("Data inside downStreamToTmsSystemRates----> ",message)
            
            token = GenericUtil.generateRandomHash(); 
            shipper_account_number = message.shipper_account_number
            sequence_timestamp = message.sequence_timestamp
            shipper_postalCode = message.shipper_postalCode
            receiver_postalCode = message.receiver_postalCode 
            customer_reference = message.jobNr
            vcid = shipper_account_number+sequence_timestamp
            //Creating the Data Object from exp_rate_tms_data and Persisting the Data
            var tmsRatesDataobj = {
                status: "UNPROCESSED",
                shipper_account_number: shipper_account_number,
                sequence_timestamp : sequence_timestamp,
                shipper_postalCode : shipper_postalCode,
                receiver_postalCode : receiver_postalCode,
                message: message,
                // customer_order_number: customer_order_number,
                token:token,
                vcid:vcid
            }
            this.logger.log("exp_rate_tms_data Object", tmsRatesDataobj)
            await this.ExpRateTmsDataRepository.create(tmsRatesDataobj);

            
                
            //Remove the extraneous fields from message
            delete message["sequence_timestamp"];
            delete message["shipper_account_number"];
            delete message["shipper_postalCode"];
            // delete message["vcid"];
            delete message["receiver_postalCode"];
            delete message["jobNr"];
            this.logger.log("Message after deleteing-------->/n/n",message);
            
            //Creating the Data Object from tms data and calling TMS URL
            var options = {
                'method': 'POST',
                'url': process.env.POST_RATES_URL,
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
            const filePath = process.env.REQ_TO_TMS_RATES_FILE_PATH+ fileName + '.txt' // Server
            // const filePath = process.env.REQ_TO_TMS_RATES_FILE_PATH1+ fileName + '.txt' // Local
            this.fileUtil.writeToFile(filePath, JSON.stringify(message));
            this.logger.log(`filePath is -----------------------------> ${filePath}`);
            this.logger.log(`fileName is -----------------------------> ${fileName}`);

            //this.logger.log("OPTIONS---->\n\n",options)
            console.log("Timestamp before sending to TMS System--->",todayUTC);
            await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                console.log("Timestamp after getting response from TMS System--->",todayUTC);
                console.log("Response from TMS----->",response)
                var expRatesRes = {
                    message: response.body,
                    shipper_account_number: shipper_account_number,
                    sequence_timestamp : sequence_timestamp,
                    shipper_postalCode : shipper_postalCode,
                    receiver_postalCode : receiver_postalCode,
                    customer_reference : customer_reference,
                    token:token,
                    vcid:vcid,
                    statusCode: response.statusCode,
                    status: "UNPROCESSED",
                    req_file_path:filePath,
                    req_file_uuid:fileName
                }

                this.logger.log("expRatesRes----->\n\n",expRatesRes)
                //this.logger.log("Response-------->\n\n",Buffer.from(JSON.stringify({"body":expres})).toString("base64"))

                //Save expRatesRes in `exp_taes_response_data` table along with shipper_account_number
                await this.ExpRateResponseDataRepository.create(expRatesRes)

                // //Update Core Tables
                // await this.UpdateCoreTablesService.updateTmsResCoreTables(expres)

                //Update exp_tms_data with shipper_account_number
                let whereObj = { "sequence_timestamp":sequence_timestamp}
                this.logger.log("WhereOBJ---->\n\n",whereObj)
                await this.ExpRateTmsDataRepository.update(whereObj, {
                    // shipper_account_number:shipper_account_number,
                    // shipment_Tracking_Number: JSON.parse(response.body).shipmentTrackingNumber,
                    status: "PROCESSED"
                })

                // Datagen service Sends TMS-Resp from LLP to Client2
                await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RATE_RESP_MSG!);
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
        DownStream Service to send TMS Rates Response to LOBSTER System & Persisting the LOBSTER Response
    */
    async downStreamToLobsterSystemRates(req:any,res:any): Promise<any> {
        let baseMessage:any
        try {
            console.log("Timestamp at Client2 side after Datagen happen--->",todayUTC);
            // baseMessage =  JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body
            // this.logger.log("Data after converting base64---->/n/n",baseMessage)
            // var tmsRatesDataobj = {
            //     status: "UNPROCESSED",
            //     shipper_account_number: baseMessage.shipper_account_number,
            //     sequence_timestamp : baseMessage.sequence_timestamp,
            //     shipper_postalCode : baseMessage.shipper_postalCode,
            //     receiver_postalCode : baseMessage.receiver_postalCode,
            //     message: baseMessage.message,
            //     // customer_order_number: customer_order_number,
            //     // token:token,
            //     vcid:baseMessage.vcid
            // }
            // this.logger.log("exp_rate_tms_data Object", tmsRatesDataobj)
            // Presist the data into Response table
            // await this.ExpRateTmsDataRepository.create(tmsRatesDataobj);
            var conMessage
            const token = GenericUtil.generateRandomHash();
            // Fetch UNPROCESSED data from exp_rates_response_data table
            var tmsRatesResponseList = await this.ExpRateResponseDataRepository.get({ 'status': "UNPROCESSED" })  
            console.log("Fetch data in downStreamToLobsterSystemRates------->",tmsRatesResponseList)
            
            for (let tmsRatesReponseItem of tmsRatesResponseList){

                console.log("tmsRatesReponseItem-------->",tmsRatesReponseItem)

                let msgType = process.env.DATAGEN_TMS_RATE_RESP_MSG
                let data = tmsRatesReponseItem.dataValues.message
                let sequence_timestamp = tmsRatesReponseItem.dataValues.sequence_timestamp
                let customer_reference = tmsRatesReponseItem.dataValues.customer_reference
                console.log("Message------>",data)

                //Construct final Lobster POST message
                if (tmsRatesReponseItem.statusCode == 200) {
                    var successMessage = {
                        "msgType" : msgType,
                        "customer_reference":customer_reference,
                        "data" : data
                    };
        
                    this.logger.log("message----->\n\n",successMessage)
                    conMessage = await this.LobsterTransformationService.lobData(successMessage);
                }else{
                    var errorMessage = {
                        "msgType" : msgType,
                        "customer_reference":customer_reference,
                        "data" : data
                    };
        
                    this.logger.log("message----->\n\n",errorMessage)
                    conMessage = await this.LobsterTransformationService.lobData(errorMessage);
                }

                this.logger.log("conMessage---->", conMessage)
                const fileName: string = GenericUtil.generateHash(JSON.stringify(conMessage.tdata));
                const filePath = process.env.REQ_TO_LOBSTER_RATES_FILE_PATH+ fileName + '.txt'
                this.fileUtil.writeToFile(filePath, JSON.stringify(conMessage.tdata));
                this.logger.log(`filePath is ${filePath}`);
                var options = {
                    'method': 'POST',
                    'url': process.env.LOBSTER_POST_URL,
                    'headers': {
                        'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                        'Content-Type': 'text/plain'
                    },
                    // body: JSON.stringify(conMessage.tdata)
                    body: JSON.stringify(conMessage.tdata)
                };

                

                this.logger.log(`Lobster Options is ${options}`);
                console.log("Timestamp before sending request to Lobster system--->",todayUTC);
                var result = await request(options, async (error: any, response: any) => {
                    if (error) throw new Error(error);
                    console.log("Timestamp after getting response from Lobster system--->",todayUTC);
                    //Save response from Lobster system to exp_response table

                    this.logger.log("response----->", response.body)
                    // var expResponse = await this.ExpResponseDataRepository.update({ "customer_order_number": baseMessage.customer_order_number }, { "status": response.body, "token":token, "req_file_path": filePath, "req_file_uuid": fileName }); //, "request": JSON.stringify(options)
                    const whereObj = { "sequence_timestamp":sequence_timestamp}
                    this.logger.log("AFTER DATAGEN RES TABLES---->",whereObj)
                    var expResponse =    await this.ExpRateResponseDataRepository.update(whereObj,{ "statusCode": response.body, "status": "PROCESSED", "req_file_path": filePath, "req_file_uuid": fileName});
                    // const whereObj = { "sequence_timestamp":sequence_timestamp}
                    // const updateObj = { "status": "PROCESSED"}
                    // this.logger.log("AFTER DATAGEN RES TABLES---->",whereObj,updateObj)
                    // var expResponse =    await this.ExpRateResponseDataRepository.update(whereObj,updateObj);
                    
                    //this.logger.log("Response---->", expResponse)

                });

                
                

            } 
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