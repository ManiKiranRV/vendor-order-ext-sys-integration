import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { DocumentRepository } from "../data/repository/DocumentRepository";

import * as moment from 'moment';
var fs = require('fs');

var request = require('request');

export class UpdateCoreTablesService {
    private logger: Logger;
    private vendorBoookingRepository:VendorBookingRepository;

    private documentRepository:DocumentRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.vendorBoookingRepository = DI.get(VendorBookingRepository);
        this.documentRepository = DI.get(DocumentRepository);
    }


    //UPDATE TMS RESPONE IN CORE TABLES//
    async updateTmsResCoreTables(req:any): Promise<any> {

        try{

        
            //this.logger.log("Request Body in updateTmsResCoreTables---->",req)
            var jsonObj = JSON.parse(req.message)
            this.logger.log("Test----->",JSON.parse(req.message))
            var today = new Date();
            var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss") + ' UTC'+moment.utc(today).format("Z")
            var whereObj = { "customer_order_number":req.customer_order_number }
            this.logger.log("req.customer_order_number",req.statusCode, req.customer_order_number,req.shipmentTrackingNumber)
            var vendorBookingObj
            //Update VendorBooking Table based on Error/Success status
            if(req.statusCode == 201 || req.statusCode == 200){
                
                vendorBookingObj = {
                    "order_status": process.env.VEN_BOOKING_CON_STATUS,
                    "hawb":req.shipmentTrackingNumber,
                    "response_time_stamp":todayUTC
                }
                this.logger.log("vendorBookingObj--->",vendorBookingObj)
                var vendorBookingObjSuc = await this.vendorBoookingRepository.update(whereObj,vendorBookingObj)

                //Update Documents Table

                // let docList :any
                this.logger.log("jsonObj.documents---->",jsonObj.documents)
                // let doc = jsonObj.documents
                for(let docList of jsonObj.documents){
                    // if document type is "lable"
                    this.logger.log("docList.typeCode------>",docList.typeCode)
                    if(docList.typeCode === "label"){

                        var documentsObj = {
                            customerordernumber: req.customer_order_number,
                            shiptrackingnum: req.shipmentTrackingNumber,
                            typecode: docList.typeCode,
                            label: docList.content
                        }
                        this.logger.log("DOCUMENT---->",documentsObj)

                        await this.documentRepository.create(documentsObj)
                    }
                    // if document type is "invoice"
                    else if(docList.typeCode === "invoice"){
                        var invoideDocumentsObj = {
                            customerordernumber: req.customer_order_number,
                            shiptrackingnum: req.shipmentTrackingNumber,
                            typecode: docList.typeCode,
                            label: docList.content
                        }
                        this.logger.log("INVOICE DOCUMENT OBJ---->",invoideDocumentsObj)

                        await this.documentRepository.create(invoideDocumentsObj)
                    }
                }

            }else{

                vendorBookingObj = {
                    "order_status": process.env.VEN_BOOKING_ERR_STATUS,
                    "response_error_code":jsonObj.status,
                    "response_error_title":jsonObj.title,
                    "response_error_detail":(jsonObj.additionalDetails != undefined)?jsonObj.detail+","+"["+jsonObj.additionalDetails+"]":jsonObj.detail,
                    "response_time_stamp":todayUTC
                }
                this.logger.log("vendorBookingObj--->",vendorBookingObj)
                var vendorBookingObjErr = await this.vendorBoookingRepository.update(whereObj,vendorBookingObj)
            }
        }catch(error){
            this.logger.log("Error in Updatetables---->",error)
            throw error
        }

    }

}