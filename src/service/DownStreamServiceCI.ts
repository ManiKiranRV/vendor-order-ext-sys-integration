import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { any, resolve } from "bluebird";
import { GenericUtil } from "../util/GenericUtil";
import { FileUtil } from "../util/FileUtil";
import { Response } from "express";

var request = require('request');

//Commercial Invoice
import { ExpCommercialInvoiceDataRepository } from "../data/repository/ExpCommercialInvoiceDataRepository";
import { CommercialInvoiceMapping } from "../util/CommercialInvoiceMapping";
import { AddressValidation } from "../util/AddressValidation";
import { AdditionalChargesMapping } from "../util/AdditionalChargesMapping";

import { InvoiceDetailsRepository } from "../data/repository/InvoiceDetailsRepository";
import { LineItemsRepository } from "../data/repository/LineItemsRepository";
import { AddressRepository } from "../data/repository/AddressRepository";
import { AdditionalChargesRepository } from "../data/repository/AdditionalChargesRepository";
import { DocumentRepository } from "../data/repository/DocumentRepository";

import { DataGenTransformationService } from "../service/DataGenTransformationService";

var fs = require('fs');

//For Timestamp
import * as moment from 'moment';
var today = new Date();



export class DownStreamServiceCI {
    private logger: Logger;
    private DataGenTransformationService: DataGenTransformationService;
    private genericUtil: GenericUtil;
    private fileUtil: FileUtil;
    private ExpCommercialInvoiceDataRepository: ExpCommercialInvoiceDataRepository;
    private CommercialInvoiceMapping:CommercialInvoiceMapping;
    private AddressValidation:AddressValidation;
    private AdditionalChargesMapping:AdditionalChargesMapping;

    private InvoiceDetailsRepository:InvoiceDetailsRepository;
    private LineItemsRepository:LineItemsRepository;
    private AddressRepository: AddressRepository;
    private AdditionalChargesRepository:AdditionalChargesRepository;
    private DocumentRepository:DocumentRepository;


    constructor() {
        this.logger = DI.get(Logger);
        this.ExpCommercialInvoiceDataRepository = DI.get(ExpCommercialInvoiceDataRepository);
        this.DataGenTransformationService = DI.get(DataGenTransformationService);
        this.genericUtil = DI.get(GenericUtil);
        this.fileUtil = DI.get(FileUtil);
        this.CommercialInvoiceMapping = DI.get(CommercialInvoiceMapping);
        this.AddressValidation=DI.get(AddressValidation);
        this.AdditionalChargesMapping=DI.get(AdditionalChargesMapping);

        this.InvoiceDetailsRepository = DI.get(InvoiceDetailsRepository);
        this.LineItemsRepository = DI.get(LineItemsRepository);
        this.AddressRepository = DI.get(AddressRepository);
        this.AdditionalChargesRepository = DI.get(AdditionalChargesRepository);
        this.DocumentRepository = DI.get(DocumentRepository);

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
        let customer_order_number:any        
        let token:any
        let vcid:any
        let finalmessage:any
        try {

            message =  JSON.parse(Buffer.from(req, 'base64').toString('utf-8')).body //Uncomment when request is coming form BLESS
            this.logger.log("Data after converting base64 for Commercial Invoice---->/n/n",message)
            // message["content"]={"exportDeclaration":message.Declarations,"currency":message.currency,"unitOfMeasurement":message.unitOfMeasurement}
            token = GenericUtil.generateRandomHash(); 
            shipment_Tracking_Number = message.shipmenttrackingnumber
            this.logger.log("message.invoicenumber---------->",message.invoicenumber,shipment_Tracking_Number+"-"+message.invoicenumber)
            customer_order_number = shipment_Tracking_Number+"-"+message.invoicenumber

           
            var expCommercialInvoiceObj:any = {
                blessMessage:JSON.stringify(message),
                // message:JSON.stringify(message),
                shipment_Tracking_Number: shipment_Tracking_Number,
                customer_order_number : customer_order_number,
                token:token,
                status:"UNPROCESSED"
            }
                this.logger.log("expCommercialInvoiceObj----->\n\n",expCommercialInvoiceObj)

                //Save expCommercialInvoiceObj in `exp_commercial_invoice_data` table along with shipper_account_number
                await this.ExpCommercialInvoiceDataRepository.create(expCommercialInvoiceObj)



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
    
    async downStreamToTmsSystemUpdatedCI(req:any,flag:any,res:any): Promise<any> {

        let message:any
        // let shipment_Tracking_Number:any = req
        let sequence_timestamp:any
        let shipper_postalCode:any
        let receiver_postalCode:any 
        let customer_reference:any        
        let token:any
        let vcid:any
        let finalmessage:any
        try {

            let tmsList: any = []

            if (flag === "UI"){
                tmsList= [await this.ExpCommercialInvoiceDataRepository.getLatest({"customer_order_number":req})]
                
            }
            else{

                //Fetch the unprocessed customer_order's from exp_comm_invoice table
                tmsList = await this.ExpCommercialInvoiceDataRepository.get({"status":"UNPROCESSED"})
                          
            }

            if(tmsList.length > 0){

                //Map the customer_order_number
                let customerArray:any = await tmsList.map((x:any)=>x.customer_order_number)
                this.logger.log("customerArray---------->\n\n",customerArray)
                
                //Update the "UNPROCESSED" customer_order's to "IN_PROGRESS" in exp_com_inv Table & "Recieved" to "IN_PROGRESS" in Invoice table
                await this.ExpCommercialInvoiceDataRepository.updateLatest({ "customer_order_number":customerArray }, { "status": "IN_PROGRESS" });
                
                await this.InvoiceDetailsRepository.updateLatest({ "customerordernumber":customerArray }, { "uploadstatus": "IN_PROGRESS" })
    
                for (let tmsListItem of tmsList) {
    
                    
    
                    // To fetch the data from Invoice Table based on customer_order_number
                    let invoiceDetails:any = [await this.InvoiceDetailsRepository.getLatest({"customerordernumber":tmsListItem.customer_order_number})]
        
                    this.logger.log("invoiceDetails-------->",invoiceDetails)
        
                    // To fetch the data from Line_items Table based on customer_order_number
                    let lineItemsDetails:any = await this.LineItemsRepository.get({"customerordernumber":tmsListItem.customer_order_number})
        
                    //Passing the data to map the values in LineItems
                    let lineItemObj :any = await this.getLineItems(lineItemsDetails,res)
    
                    let data:any
                    let jsonObj:any
                    let vaildationResult:any
                    let invoiceStatusObj:any = {}
                    this.logger.log("Length---->",invoiceDetails.length,lineItemObj.length)
                    if(invoiceDetails.length > 0 && lineItemObj.length > 0 ){
                        
                        let org = invoiceDetails[0].org
                        data ={
                            "shipmentTrackingNumber" : invoiceDetails[0].hawb !== (null || undefined) ? invoiceDetails[0].hawb : "",
                            "line_item":lineItemObj !== (null || undefined) ? lineItemObj : "",
                            "org":org,
                            "invoice_date":invoiceDetails[0].invoicedate !== (null || undefined) ? invoiceDetails[0].invoicedate : "", //invoiceDetails[0].invoicedate
                            "invoice_number": invoiceDetails[0].invoicenumber !== (null || undefined) ? invoiceDetails[0].invoicenumber : "", //invoiceDetails[0].invoicenumber
                            "incoterm": invoiceDetails[0].incoterm !== (null || undefined) ? invoiceDetails[0].incoterm : "", //invoiceDetails[0].incoterm
                            "currency": invoiceDetails[0].declaredvaluecurrency !== (null || undefined) ? invoiceDetails[0].declaredvaluecurrency : "" //invoiceDetails[0].declaredvaluecurrency
                        }
                        jsonObj = await this.CommercialInvoiceMapping.getData(data,res)
                        // this.logger.log("jsonObj------->",jsonObj)
    
                        //Checking all madatory fields are there or not 
    
                        vaildationResult = await this.genericUtil.validateJsonObject(jsonObj)
    
                        this.logger.log("vaildationResult------>",vaildationResult)
    
                        // If all the mandatory fields are present then send the TMS Request 
                        if(vaildationResult === null){
                    
                            //If org === IBM the get the outputImageProperties and pass in the json

                            let outputImageProperties:any

                            if(org === process.env.ORG_NAME){
                                outputImageProperties = await this.CommercialInvoiceMapping.getOutputImageProperties()
                                this.logger.log("outputImageProperties---->",outputImageProperties)
                                jsonObj["outputImageProperties"] = outputImageProperties
                            }

                            //Fetch the data from AdditionalCharges by passing invoice_id
                            let additionalDetails:any = await this.AdditionalChargesRepository.get({"parent_id":invoiceDetails[0].id})
                            this.logger.log("additionalDetails length----->",additionalDetails.length)
                            
                            //If data exists then pass the data to AdditionalChargesMapping for transformation
                            if(additionalDetails.length>0){
                                let additionalCharges :any = await this.AdditionalChargesMapping.getAdditionalCharges(additionalDetails,org)
                                this.logger.log("additionalCharges---------->",additionalCharges)
                                jsonObj["content"]["exportDeclaration"][0]["additionalCharges"]=additionalCharges
                            }
                            // To fetch the data from adress Table based on customer_order_number
                            let addressDetails:any = await this.AddressRepository.get({"customer_order_number":tmsListItem.customer_order_number,"parent_id":invoiceDetails[0].id})

                            this.logger.log("addressDetails------>",addressDetails.length)

                            let tmsResponse:any
                            
                            //Check the address exist or not with customer_order_number in adress table - If exsist then check the contact details
                            if(addressDetails.length > 0){
                                //Send the address details to addressValidation function
                                let address :any = await this.AddressValidation.getDataAfterValidation(addressDetails,org)
                                if(address.status === "Success"){

                                    jsonObj["customerDetails"] = address.data
                                    this.logger.log("JSON THAT IS GOING TO EXP AFTER ADDING ADDRESS---->",jsonObj)

                                    // Send the jsonObject to TMS Request
                                    tmsResponse = await this.callTmsSystem(jsonObj,tmsListItem.customer_order_number)
        
                                    // this.logger.log("tmsResponse----->\n\n",tmsResponse)
                        
                                    // //Save expCommercialInvoiceObj in `exp_commercial_invoice_data` table along with shipper_account_number
                                    // await this.ExpCommercialInvoiceDataRepository.updateLatest({"customer_order_number":tmsListItem.customer_order_number},tmsResponse.expCommercialInvoiceObj)
                    
                                    // //Update the status in Invoice table 
        
                                    // await this.InvoiceDetailsRepository.updateLatest({"customerordernumber":tmsListItem.customer_order_number},tmsResponse.invoiceStatusObj)
                                
                                }else{
                                    //If mandatory fields are not there and address.status is Error then persist as Error in Tables with that customer_order_number
                                    await this.ExpCommercialInvoiceDataRepository.updateLatest({ "customer_order_number":tmsListItem.customer_order_number }, {"tms_req_message":jsonObj,"statusCode":null, "error":address.data,"tms_status": address.status,"status":"Error" });
                                
                                    //Update the status in Invoice table 
                                    await this.InvoiceDetailsRepository.updateLatest({"customerordernumber":tmsListItem.customer_order_number},{"uploadstatus":process.env.INVOICE_ERR_STATUS})
                                }
                            }else{

                                // Send the jsonObject to TMS Request
                                tmsResponse = await this.callTmsSystem(jsonObj,tmsListItem.customer_order_number)
    
                                // this.logger.log("tmsResponse----->\n\n",tmsResponse.expCommercialInvoiceObj)
                    
                                // //Save expCommercialInvoiceObj in `exp_commercial_invoice_data` table along with shipper_account_number
                                // await this.ExpCommercialInvoiceDataRepository.updateLatest({"customer_order_number":tmsListItem.customer_order_number},tmsResponse.expCommercialInvoiceObj)
                
                                // //Update the status in Invoice table 
    
                                // await this.InvoiceDetailsRepository.updateLatest({"customerordernumber":tmsListItem.customer_order_number},tmsResponse.invoiceStatusObj)
                                
                            }

                        }
                        else{
                            //If mandatory fileds are not there then persist as error
                            await this.ExpCommercialInvoiceDataRepository.updateLatest({ "customer_order_number":tmsListItem.customer_order_number }, {"tms_req_message":jsonObj,"statusCode":null, "error":JSON.stringify(vaildationResult),"tms_status": "Error","status":"Error" });
                            
                            //Update the status in Invoice table 
                            await this.InvoiceDetailsRepository.updateLatest({"customerordernumber":tmsListItem.customer_order_number},{"uploadstatus":process.env.INVOICE_ERR_STATUS})
    
                        }
    
                    }else{
    
                        //If data is not there in Tables with that customer_order_number
                        await this.ExpCommercialInvoiceDataRepository.updateLatest({ "customer_order_number":tmsListItem.customer_order_number }, {"tms_req_message":jsonObj,"statusCode":null, "error":"Mandatory Fields are missing","tms_status": "Error","status":"Error" });
                    
                        //Update the status in Invoice table 
                        await this.InvoiceDetailsRepository.updateLatest({"customerordernumber":tmsListItem.customer_order_number},{"uploadstatus":process.env.INVOICE_ERR_STATUS})
    
                    }
                }
            }
            else{
                return ({message: "No Data to send"})
            }
            return token

        } catch (error) {
            //Update processing_status of events table to ERROR
            this.logger.log("Error----->",error)
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: error } });
        }
        

    } 
    
    //Function to call TMS system

    async callTmsSystem(jsonObj:any,customer_order_number:any):Promise<any>{

        let token = GenericUtil.generateRandomHash(); 
        this.logger.log("Message which is going to TMS system-------->/n/n",jsonObj,JSON.stringify(jsonObj));
        let shipment_Tracking_Number = jsonObj.shipmentTrackingNumber
        let base64 = Buffer.from(JSON.stringify(jsonObj)).toString("base64")
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
        const filePath = process.env.REQ_TO_TMS_CI_FILE_PATH+ fileName + '.txt' // Server
        this.fileUtil.writeToFile(filePath, JSON.stringify(jsonObj));
        this.logger.log("filePath & fileName ----------------------------->",filePath, fileName);

        this.logger.log("OPTIONS that we are sending to TMS System---->\n\n",options)
        this.logger.log("Timestamp for RatesRequest before sending the request to TMS System--->",Date());

        let tmsresponse:any = await request(options, async (error: any, response: any) => {
            if (error) throw new Error(error);
            this.logger.log("Timestamp for RatesRequest after getting response from TMS System--->",Date());
            this.logger.log("Response from TMS----->",response,JSON.parse(response.body).additionalDetails)
            let expCommercialInvoiceObj:any ={}
            let invoiceStatusObj:any = {}

            if(response.statusCode === 200 || response.statusCode === 201){
                expCommercialInvoiceObj["tms_req_message"] = jsonObj,
                expCommercialInvoiceObj["error"] = null,
                expCommercialInvoiceObj["tms_status"] = null
                expCommercialInvoiceObj["status"] = "Success"
                expCommercialInvoiceObj["statusCode"] = response.statusCode
                expCommercialInvoiceObj["req_file_path"]=filePath
                expCommercialInvoiceObj["req_file_uuid"]=fileName
                expCommercialInvoiceObj["token"] = token
                invoiceStatusObj["uploadstatus"] = process.env.INVOICE_CON_STATUS
                this.logger.log("expCommercialInvoiceObj & invoiceStatus in If-Loop----->\n\n",expCommercialInvoiceObj,invoiceStatusObj)
                // resolve({"expCommercialInvoiceObj": expCommercialInvoiceObj, "invoiceStatusObj": invoiceStatusObj});
            }else{
                const errorDetails :any = JSON.parse(response.body)
                this.logger.log("errorDetails",errorDetails)
                if (errorDetails.hasOwnProperty("additionalDetails")){
                    expCommercialInvoiceObj["error"] = JSON.stringify(errorDetails.additionalDetails)
                }else{
                    expCommercialInvoiceObj["error"] = JSON.stringify(errorDetails.detail)
                }
                expCommercialInvoiceObj["tms_req_message"] = jsonObj
                expCommercialInvoiceObj["status"] = "Error"
                expCommercialInvoiceObj["tms_status"] = null
                expCommercialInvoiceObj["statusCode"] = response.statusCode
                expCommercialInvoiceObj["req_file_path"]=filePath
                expCommercialInvoiceObj["req_file_uuid"]=fileName
                expCommercialInvoiceObj["token"] = token
                invoiceStatusObj["uploadstatus"] = process.env.INVOICE_ERR_STATUS
                this.logger.log("expCommercialInvoiceObj & invoiceStatus in Else-Loop----->\n\n",expCommercialInvoiceObj,invoiceStatusObj)
                // resolve({"expCommercialInvoiceObj": expCommercialInvoiceObj, "invoiceStatusObj": invoiceStatusObj});
            }


            //Save expCommercialInvoiceObj in `exp_commercial_invoice_data` table along with shipper_account_number
            await this.ExpCommercialInvoiceDataRepository.updateLatest({"customer_order_number":customer_order_number},expCommercialInvoiceObj)

            //Update the status in Invoice table 

            await this.InvoiceDetailsRepository.updateLatest({"customerordernumber":customer_order_number},invoiceStatusObj)

            //Persist the tms_request in the document tables
            //construct object that will insert in document tables

            let documentObj : any = {
                "customerordernumber":customer_order_number,
                "shiptrackingnum":shipment_Tracking_Number,
                "typecode":"TMS_Request",
                "name":"TMS_Request",
                "content":base64,
                "label":"TMS_Request"
            }

            this.logger.log("documentObj----->",documentObj)
            //Insert the object into document table

            await this.DocumentRepository.create(documentObj)

            // Datagen service Sends TMS-Resp from LLP to Client2 ----> Inscope
            // finalmessage = await this.DataGenTransformationService.dataGenTransformation(process.env.DATAGEN_TMS_RATE_RESP_MSG!);
            // this.logger.log("Message after datagen transformation happened",finalmessage)
            // await this.downStreamToLobsterSystemRates(finalmessage)
        });
        this.logger.log("tmsresponse",tmsresponse)

    }


    // Function to Map the Values in Line Details 
    
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