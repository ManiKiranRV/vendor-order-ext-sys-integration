import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { any, resolve } from "bluebird";
import { GenericUtil } from "../util/GenericUtil";
import { FileUtil } from "../util/FileUtil";
import { Response } from "express";
//import { NextFunction, Request } from "express-serve-static-core";
import { ExpCommercialInvoiceDataRepository } from "../data/repository/ExpCommercialInvoiceDataRepository";
import { UpdateCoreTablesService } from "./UpdateCoreTablesService";
var request = require('request');

import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { AddressRepository } from "../data/repository/AddressRepository";
import { LobsterTransformationService } from "./LobsterTransformationService";
import { DataGenTransformationService } from "./DataGenTransformationService";
import { CommercialInvoiceMapping } from "../util/CommercialInvoiceMapping";

//Rates

import { ExpRateTmsDataRepository } from "../data/repository/ExpRateTmsDataRepository";
import { ExpRateResponseDataRepository } from "../data/repository/ExpRateResponseDataRepository";
import { InvoiceDetailsRepository } from "../data/repository/InvoiceDetailsRepository";
import { LineItemsRepository } from "../data/repository/LineItemsRepository";


var fs = require('fs');

//For Timestamp
import * as moment from 'moment';
import { RetryRepository } from "../data/repository/RetryRepository";
var today = new Date();



export class DownStreamService {
    private logger: Logger;
    private ExpTmsDataRepository: ExpTmsDataRepository;
    private ExpCommercialInvoiceDataRepository: ExpCommercialInvoiceDataRepository;
    private UpdateCoreTablesService: UpdateCoreTablesService;
    private LobsterTransformationService: LobsterTransformationService;
    private VendorBookingRepository: VendorBookingRepository;
    private AddressRepository: AddressRepository;
    private DataGenTransformationService: DataGenTransformationService;
    private genericUtil: GenericUtil;
    private fileUtil: FileUtil;
    private CommercialInvoiceMapping:CommercialInvoiceMapping;

    private ExpRateTmsDataRepository: ExpRateTmsDataRepository;
    private ExpRateResponseDataRepository: ExpRateResponseDataRepository;
    private retryRepository: RetryRepository
    private InvoiceDetailsRepository:InvoiceDetailsRepository;
    private LineItemsRepository:LineItemsRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpTmsDataRepository = DI.get(ExpTmsDataRepository);
        this.ExpCommercialInvoiceDataRepository = DI.get(ExpCommercialInvoiceDataRepository);
        this.UpdateCoreTablesService = DI.get(UpdateCoreTablesService);
        this.LobsterTransformationService = DI.get(LobsterTransformationService);
        this.AddressRepository = DI.get(AddressRepository);
        this.VendorBookingRepository = DI.get(VendorBookingRepository);
        this.DataGenTransformationService = DI.get(DataGenTransformationService);
        this.genericUtil = DI.get(GenericUtil);
        this.fileUtil = DI.get(FileUtil);
        this.CommercialInvoiceMapping = DI.get(CommercialInvoiceMapping);

        this.ExpRateTmsDataRepository = DI.get(ExpRateTmsDataRepository);
        this.ExpRateResponseDataRepository = DI.get(ExpRateResponseDataRepository);
        this.retryRepository = DI.get(RetryRepository);
        this.InvoiceDetailsRepository = DI.get(InvoiceDetailsRepository);
        this.LineItemsRepository = DI.get(LineItemsRepository);
    }

  

    /*
        DownStream Service to send Commerial Invoice Message to TMS System(From LLP Node) & Persisting the exp_commercial_invoice_response_data
    */   
    
    async downStreamToTmsSystemCommercialInvoice(req:any,res:any): Promise<any> {

        let message:any
        let shipment_Tracking_Number:any
        let sequence_timestamp:any
        let shipper_postalCode:any
        let receiver_postalCode:any 
        let customer_reference:any        
        let token:any
        let vcid:any
        let finalmessage:any
        try {

            message =  JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body //Uncomment when request is coming form BLESS
            this.logger.log("Data after converting base64 for Rates---->/n/n",message)
            message["content"]={"exportDeclaration":message.Declarations,"currency":message.currency,"unitOfMeasurement":message.unitOfMeasurement}
            token = GenericUtil.generateRandomHash(); 
            shipment_Tracking_Number = message.shipmentTrackingNumber
            // sequence_timestamp = message.sequence_timestamp 
            // customer_reference = message.jobNr
            // vcid = shipper_account_number+sequence_timestamp
                
            //Remove the extraneous fields from message
            delete message["sequence_timestamp"];
            delete message["TrackingNumber"];
            delete message["base64"];
            delete message["plannedShipDate"];
            delete message["Declarations"];
            delete message["account"];
            delete message["exceptions"];
            delete message["invoicenumber"]
            delete message["unitOfMeasurement"];
            delete message["currency"];
            // delete message["customerDetails"]  //Comment to get the error

            this.logger.log("Message after deleting the fields which is going to TMS system-------->/n/n",message,JSON.stringify(message));
            
            //Creating the Data Object from tms data and calling TMS URL
            var options = {
                'method': 'POST',
                'url': process.env.POST_URL_CI,
                'headers': {
                    'Authorization': 'Basic ZGhsZXhwcmVzc2ZpOkMhNGtNJDd2QSE2eA==',
                    'Content-Type': 'application/json',
                    'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                },
                body: JSON.stringify(message)
            };
            //Write the request to file
            const fileName: string = GenericUtil.generateHash(JSON.stringify(message));
            const filePath = process.env.REQ_TO_TMS_RATES_FILE_PATH+ fileName + '.txt' // Server
            // const filePath = process.env.REQ_TO_TMS_RATES_FILE_PATH1+ fileName + '.txt' // Local
            this.fileUtil.writeToFile(filePath, JSON.stringify(message));
            this.logger.log("filePath & fileName ----------------------------->",filePath, fileName);

            this.logger.log("OPTIONS that we are sending to TMS System---->\n\n",options)
            this.logger.log("Timestamp for RatesRequest before sending the request to TMS System--->",Date());
            await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                this.logger.log("Timestamp for RatesRequest after getting response from TMS System--->",Date());
                this.logger.log("Response from TMS----->",response.body,JSON.parse(response.body).additionalDetails)
                var expCommercialInvoiceObj:any = {
                    blessMessage:JSON.stringify(JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body),
                    message:JSON.stringify(message),
                    shipment_Tracking_Number: shipment_Tracking_Number,
                    customer_reference : customer_reference,
                    token:token,
                    statusCode: response.statusCode,
                    // status: "UNPROCESSED",
                    req_file_path:filePath,
                    req_file_uuid:fileName
                }

                if(response.statusCode === 200 || response.statusCode === 201){
                    expCommercialInvoiceObj["error"] = "",
                    expCommercialInvoiceObj["status"] = "Success"
                }else{
                    expCommercialInvoiceObj["error"] = JSON.stringify(JSON.parse(response.body).additionalDetails),
                    expCommercialInvoiceObj["status"] = "Error"
                }
                this.logger.log("expCommercialInvoiceObj----->\n\n",expCommercialInvoiceObj)

                //Save expCommercialInvoiceObj in `exp_commercial_invoice_data` table along with shipper_account_number
                await this.ExpCommercialInvoiceDataRepository.create(expCommercialInvoiceObj)

                // Datagen service Sends TMS-Resp from LLP to Client2
                // finalmessage = await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RATE_RESP_MSG!);
                // this.logger.log("Message after datagen transformation happened",finalmessage)
                // await this.downStreamToLobsterSystemRates(finalmessage)
            });

            return token

        } catch (error) {
            //Update processing_status of events table to ERROR
            this.logger.log("Error----->",error)
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: error } });
        }
        

    } 

    /*
        DownStream Service to send Updated Commerial Invoice Message to TMS System(From LLP Node) & Persisting the exp_commercial_invoice_response_data
    */   
    
    async downStreamToTmsSystemUpdatedCI(req:any,res:any): Promise<any> {

        let message:any
        let shipment_Tracking_Number:any = req
        let sequence_timestamp:any
        let shipper_postalCode:any
        let receiver_postalCode:any 
        let customer_reference:any        
        let token:any
        let vcid:any
        let finalmessage:any
        try {

            let invoiceDetails:any = await this.InvoiceDetailsRepository.get({"hawb":req})

            this.logger.log("invoiceDetails-------->",invoiceDetails)

            let lineItemsDetails:any = await this.LineItemsRepository.get({"customerordernumber":req})

            let lineItemObj :any = await this.getLineItems(lineItemsDetails,res)

            let data:any
            if(invoiceDetails.length > 0 && lineItemObj.length > 0 ){
                

                data ={
                    "shipmentTrackingNumber" : req,
                    "line_item":lineItemObj,
                    "invoice_date":invoiceDetails[0].invoicedate,
                    "invoice_number": invoiceDetails[0].invoicenumber,
                    "incoterm": invoiceDetails[0].incoterm,
                    "currency": invoiceDetails[0].declaredvaluecurrency
                }  
            }

            let jsonObj:any = await this.CommercialInvoiceMapping.getData(data,res)

            this.logger.log("jsonObj------->",jsonObj)
            
            token = GenericUtil.generateRandomHash(); 
            // shipment_Tracking_Number = message.shipmentTrackingNumber

                
 
            this.logger.log("Message which is going to TMS system-------->/n/n",jsonObj,JSON.stringify(jsonObj));
            
            //Creating the Data Object from tms data and calling TMS URL
            var options = {
                'method': 'POST',
                'url': process.env.POST_URL_CI,
                'headers': {
                    'Authorization': 'Basic ZGhsZXhwcmVzc2ZpOkMhNGtNJDd2QSE2eA==',
                    'Content-Type': 'application/json',
                    'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                },
                body: JSON.stringify(jsonObj)
            };
            //Write the request to file
            const fileName: string = GenericUtil.generateHash(JSON.stringify(jsonObj));
            const filePath = process.env.REQ_TO_TMS_RATES_FILE_PATH+ fileName + '.txt' // Server
            // const filePath = process.env.REQ_TO_TMS_RATES_FILE_PATH1+ fileName + '.txt' // Local
            this.fileUtil.writeToFile(filePath, JSON.stringify(jsonObj));
            this.logger.log("filePath & fileName ----------------------------->",filePath, fileName);

            this.logger.log("OPTIONS that we are sending to TMS System---->\n\n",options)
            this.logger.log("Timestamp for RatesRequest before sending the request to TMS System--->",Date());
            await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                this.logger.log("Timestamp for RatesRequest after getting response from TMS System--->",Date());
                this.logger.log("Response from TMS----->",response.body,JSON.parse(response.body).additionalDetails)
                var expCommercialInvoiceObj:any ={}

                if(response.statusCode === 200 || response.statusCode === 201){
                    expCommercialInvoiceObj["error"] = "",
                    expCommercialInvoiceObj["status"] = "Success"
                    expCommercialInvoiceObj["statusCode"] = response.statusCode
                    expCommercialInvoiceObj["req_file_path"]=filePath
                    expCommercialInvoiceObj["req_file_uuid"]=fileName
                    expCommercialInvoiceObj["token"] = token
                }else{
                    expCommercialInvoiceObj["error"] = JSON.stringify(JSON.parse(response.body).additionalDetails),
                    expCommercialInvoiceObj["status"] = "Error"
                    expCommercialInvoiceObj["statusCode"] = response.statusCode
                    expCommercialInvoiceObj["req_file_path"]=filePath
                    expCommercialInvoiceObj["req_file_uuid"]=fileName
                    expCommercialInvoiceObj["token"] = token
                }
                this.logger.log("expCommercialInvoiceObj----->\n\n",expCommercialInvoiceObj)

                //Save expCommercialInvoiceObj in `exp_commercial_invoice_data` table along with shipper_account_number
                await this.ExpCommercialInvoiceDataRepository.update({"shipment_Tracking_Number":shipment_Tracking_Number},expCommercialInvoiceObj)

                // Datagen service Sends TMS-Resp from LLP to Client2
                // finalmessage = await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RATE_RESP_MSG!);
                // this.logger.log("Message after datagen transformation happened",finalmessage)
                // await this.downStreamToLobsterSystemRates(finalmessage)
            });

            return token

        } catch (error) {
            //Update processing_status of events table to ERROR
            this.logger.log("Error----->",error)
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: error } });
        }
        

    }    
    
    async getLineItems(req:any,res:any) :Promise<any>{
        try{

            let lineItemObj:any =[]
            if(req.length > 0 ){               
                for(let lineitem of req){
    
                    let obj= {
                        "number": lineitem.serial_number,
                        "commodity_value": lineitem.commodityhscode,
                        "commodity_typeCode": lineitem.commoditytype,
                        "quantity_uom":lineitem.quantity_uom,
                        "quantity_value": lineitem.quantity_value,
                        "price": lineitem.price,
                        "description": lineitem.description,
                        "weight_netValue": lineitem.net_value,
                        "manufacturerCountry": lineitem.manufacturercountry
                    }
                    lineItemObj.push(obj)
                }
            }
            this.logger.log("lineItemObj---->",lineItemObj)
            return lineItemObj
        }catch(error){
            this.logger.log("error",error)
        }
    }

}