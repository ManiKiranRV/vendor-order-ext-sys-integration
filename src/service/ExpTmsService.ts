import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { AddressRepository } from "../data/repository/AddressRepository";
import { LobsterTransformationService } from "./LobsterTransformationService";
import { ExpResponseDataService } from "../service/ExpResponseDataService";
import { DocumentRepository } from "../data/repository/DocumentRepository";

import * as moment from 'moment';
var fs = require('fs');

var request = require('request');

export class ExpTmsService {
    private logger: Logger;
    private ExpTmsDataRepository: ExpTmsDataRepository;
    private ExpResponseDataRepository: ExpResponseDataRepository;
    private LobsterTransformationService: LobsterTransformationService;
    private ExpResponseDataService: ExpResponseDataService;
    private vendorBoookingRepository:VendorBookingRepository;
    private addressRepository:AddressRepository;
    private documentRepository:DocumentRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpTmsDataRepository = DI.get(ExpTmsDataRepository);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.LobsterTransformationService = DI.get(LobsterTransformationService);
        this.ExpResponseDataService = DI.get(ExpResponseDataService);
        this.addressRepository = DI.get(AddressRepository);
        this.vendorBoookingRepository = DI.get(VendorBookingRepository);
        this.documentRepository = DI.get(DocumentRepository);
    }


    //LLP-TMS & Persisting the TMS Response//
    async ExpDhl(): Promise<any> {

        return new Promise(async (resolve, reject) => {
            try {

                //Take data from exp_tms_data table and assign to tmsDataList variable
                var tmsDataList = await this.getAllExpTmsData()
                //console.log("tmsDataList",tmsDataList.res, tmsDataList.res.length)
                for (let i = 0; i <= tmsDataList.res.length; i++) {
                    //Loop through tmsDataList variable and get individual message i.e tmsDataItem["message"]
                    var message = tmsDataList.res[i].dataValues.message
                    //console.log("customerOrderNumber---------->",tmsDataList.res[i].dataValues.message.principalRef)
                    let customerOrderNumber = tmsDataList.res[i].dataValues.message.principalRef+"";
                    console.log("customerOrderNumber",customerOrderNumber)
                    //Remove the extraneous fields from message
                    delete message["plannedShippingOffset"];
                    delete message["plannedShippingDate"];
                    delete message["sequence_timestamp"];
                    delete message["vcid"];
                    delete message["principalRef"];
                    delete message["shipper_account_number"];
                    delete message["trailToken"];


                   // console.log("Message", JSON.stringify(message));
                    
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
                    let resultList: any = []
                    //console.log("OPTIONS---->",options)
                    var result = await request(options, async (error: any, response: any) => {
                        if (error) throw new Error(error);
                        //console.log("response--->",response.body)
                        console.log("shipmentTrackingNumber----->", JSON.parse(response.body).shipmentTrackingNumber)
                        // console.log(`Reponse from TMS system is ${response.body}`);
                        var expres = {
                            statusCode: response.statusCode,
                            message: response.body,
                            shipmentTrackingNumber: JSON.parse(response.body).shipmentTrackingNumber,
                            status: "UNPROCESSED",
                            parent_uuid:tmsDataList.res[i].dataValues.uuid,
                            customer_order_number:customerOrderNumber
                        }

                        console.log("expres----->",expres)

                        //Save expResponse in `exp_response_data` table along with shipment_Tracking_Number
                        var expResponse = await this.ExpResponseDataRepository.create(expres)

                        //Update Core Tables

                        var updateDocument = await this.updateTmsResCoreTables(expres)

                        //Update exp_tms_data with shipment_Tracking_Number
                        var whereObj = { "id": tmsDataList.res[i].dataValues.id }
                        var updateRes = await this.ExpTmsDataRepository.update(whereObj, {
                            shipment_Tracking_Number: JSON.parse(response.body).shipmentTrackingNumber,
                            status: "PROCESSED"
                        })

                    });

                }

                resolve({ status: { code: 'Success'}})

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })

    }

    //INNER FUNCTION FOR LLP-TMS//
    async getAllExpTmsData(): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let whereObj: any = {};
            try {
                //console.log('Request Body inside ExpTmsService', req)
                //whereObj['shipment_Tracking_Number'] = req;
                whereObj['status'] = "UNPROCESSED";
                let responseData: any = await this.ExpTmsDataRepository.get(whereObj);

                //console.log("Result", responseData)
                resolve({ res: responseData })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })
    }

    //UPDATE TMS RESPONE IN CORE TABLES//
    async updateTmsResCoreTables(req:any): Promise<any> {

        //console.log("Request Body in updateTmsResCoreTables---->",req)
        var jsonObj = JSON.parse(req.message)
        //console.log("Test----->",JSON.parse(req.message))
        var today = new Date();
        var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss") + ' UTC'+moment.utc(today).format("Z")
        var whereObj = { "customer_order_number":req.customer_order_number }
        console.log("req.customer_order_number",req.customer_order_number)
        //Update VendorBooking Table based on Error/Success status
        if(req.statusCode === 201){

            var vendorBookingObjSuc = await this.vendorBoookingRepository.update(whereObj,{
                "order_status": process.env.VEN_BOOKING_CON_STATUS,
                "hawb":req.shipmentTrackingNumber,
            })

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
            var vendorBookingObjErr = await this.vendorBoookingRepository.update(whereObj,{
                "order_status": process.env.VEN_BOOKING_ERR_STATUS,
                "response_error_code":jsonObj.status,
                "response_error_title":jsonObj.title,
                "response_error_detail":jsonObj.detail,
                "response_time_stamp":todayUTC
            })
        }


        
        


    }


    // To get TMS DATA

    async expTmsData(req: any, res?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Request Body inside ExpTmsService', req)

                var status = req.statusCode
                var data = req
                var obj = {
                    status: "UNPROCESSED",
                    shipment_Tracking_Number: "3732179850",
                    message: data
                }
                console.log("Object", obj)
                var result = await this.ExpTmsDataRepository.create(obj);
                console.log("Result", result)
                resolve({ status: { code: 'SUCCESS' }, res: result })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })


    }

    //NOT USED//
    async getexpTmsData(req: any, res?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let whereObj: any = {};
            try {
                //console.log('Request Body inside ExpTmsService', req)
                whereObj['uuid'] = req;
                console.log("Whereobj", whereObj)
                //whereObj['status'] = "UNPROCESSED";
                let responseData: any = await this.ExpTmsDataRepository.get(whereObj);

                //console.log("Result", responseData)
                resolve({ res: responseData })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })
    }

}