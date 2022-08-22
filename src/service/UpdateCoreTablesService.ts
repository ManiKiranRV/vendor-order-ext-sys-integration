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

        
            //console.log("Request Body in updateTmsResCoreTables---->",req)
            var jsonObj = JSON.parse(req.message)
            console.log("Test----->",JSON.parse(req.message))
            var today = new Date();
            var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss") + ' UTC'+moment.utc(today).format("Z")
            var whereObj = { "customer_order_number":req.customer_order_number }
            console.log("req.customer_order_number",req.statusCode, req.customer_order_number,req.shipmentTrackingNumber)
            var vendorBookingObj
            //Update VendorBooking Table based on Error/Success status
            if(req.statusCode == 201){
                
                vendorBookingObj = {
                    "order_status": process.env.VEN_BOOKING_CON_STATUS,
                    "hawb":req.shipmentTrackingNumber,
                    "response_time_stamp":todayUTC
                }
                console.log("vendorBookingObj--->",vendorBookingObj)
                var vendorBookingObjSuc = await this.vendorBoookingRepository.update(whereObj,vendorBookingObj)

                //Update Documents Table

                var documentsObj = {
                    customerordernumber: req.customer_order_number,
                    shiptrackingnum: req.shipmentTrackingNumber,
                    typecode: jsonObj.documents[0].typeCode,
                    label: jsonObj.documents[0].content
                }
                console.log("DOCUMENT---->",documentsObj)

                    await this.documentRepository.create(documentsObj)
                

            }else{

                vendorBookingObj = {
                    "order_status": process.env.VEN_BOOKING_ERR_STATUS,
                    "response_error_code":jsonObj.status,
                    "response_error_title":jsonObj.title,
                    "response_error_detail":(jsonObj.additionalDetails != undefined)?jsonObj.detail+","+"["+jsonObj.additionalDetails+"]":jsonObj.detail,
                    "response_time_stamp":todayUTC
                }
                console.log("vendorBookingObj--->",vendorBookingObj)
                var vendorBookingObjErr = await this.vendorBoookingRepository.update(whereObj,vendorBookingObj)
            }
        }catch(error){
            console.log("Error in Updatetables---->",error)
            throw error
        }

    }

}