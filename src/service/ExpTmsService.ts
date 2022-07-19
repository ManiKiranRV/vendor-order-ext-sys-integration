import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { AddressRepository } from "../data/repository/AddressRepository";

import { LobsterService } from "../service/LobsterService";
import { ExpResponseDataService } from "../service/ExpResponseDataService";

var fs = require('fs');

var request = require('request');

export class ExpTmsService {
    private logger: Logger;
    private ExpTmsDataRepository: ExpTmsDataRepository;
    private ExpResponseDataRepository: ExpResponseDataRepository;
    private LobsterService: LobsterService;
    private ExpResponseDataService: ExpResponseDataService;
    private vendorBoookingRepository:VendorBookingRepository;
    private addressRepository:AddressRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpTmsDataRepository = DI.get(ExpTmsDataRepository);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.LobsterService = DI.get(LobsterService);
        this.ExpResponseDataService = DI.get(ExpResponseDataService);
        this.addressRepository = DI.get(AddressRepository);
        this.vendorBoookingRepository = DI.get(VendorBookingRepository);
    }


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

    async ExpDhl(req: any, res: any): Promise<any> {

        return new Promise(async (resolve, reject) => {
            try {

                //Take data from exp_tms_data table and assign to tmsDataList variable
                var tmsDataList = await this.getAllExpTmsData(req, res)
                //console.log("tmsDataList",tmsDataList.res, tmsDataList.res.length)
                for (let i = 0; i <= tmsDataList.res.length; i++) {
                    //Loop through tmsDataList variable and get individual message i.e tmsDataItem["message"]
                    var message = tmsDataList.res[i].dataValues.message
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
                    //console.log("Message", message)
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
                        // console.log("response--->",response.body)
                        // console.log("response.body.shipmentTrackingNumber", JSON.parse(response.body).shipmentTrackingNumber)
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
                        var whereObj = { "id": tmsDataList.res[i].dataValues.id }
                        //Update exp_tms_data with shipment_Tracking_Number
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


    async postToLobsterSystem(req: any, res: any): Promise<any> {

        return new Promise(async (resolve, reject) => {
            try {
                //Get Response all UNPROCESSED Messages from exp_response_data table 
                let tmsResponseList: any = await this.ExpResponseDataRepository.get({ "status": "UNPROCESSED" })
                //Loop the UNPROCESSED rows and submit to LOBSTER SYSTEM
                for (let tmsReponseItem of tmsResponseList) {
                    console.log("tmsReponseItem.dataValues.parent_uuid",tmsReponseItem.dataValues.parent_uuid)
                    let uuid = tmsReponseItem.dataValues.parent_uuid
                    console.log("uuid",uuid)
                    var resp = JSON.parse(tmsReponseItem.dataValues.message);
                    //Derive accountNumber to be sent to LOSTER system
                    let vendorOrderItem = (await this.vendorBoookingRepository.get({"customer_order_number":tmsReponseItem["customer_order_number"]}))[0];
                    let addressList = await this.addressRepository.get({"address_type":"consignor","parent_id":vendorOrderItem["id"]});
                    let accountNumber;
                    
                    if(addressList.length > 0){
                        accountNumber = addressList[0]["address_id"];
                    }else{
                        accountNumber = "";
                    }
                    console.log(`Account Number is ${accountNumber}`)
                    
                    var message = {
                        "content":{
                            "accountNumber": accountNumber,
                            "HWAB": resp.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": tmsReponseItem["customer_order_number"],
                            "documents": resp.documents
                        }
                    };

                    //Construct final Loster POST message
                    var conMessage = await this.LobsterService.lobData(message, res);
                    console.log("conMessage",conMessage)
                
                    var options = {
                        'method': 'POST',
                        'url': process.env.LOBSTER_POST_URL,
                        'headers': {
                            'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                            'Content-Type': 'text/plain'
                        },
                       body: JSON.stringify(conMessage)
                    };

                    this.logger.log(`Lobster Options is ${JSON.stringify(options)}`);
                    var result = await request(options, async (error: any, response: any) => {
                        if (error) throw new Error(error);
                        //Save response from Lobster system to exp_response table
                        console.log("response----->",response.body)
                        var expResponse = await this.ExpResponseDataRepository.update({ "parent_uuid": tmsReponseItem.parent_uuid }, { "status": response.body });
                        //console.log("Response---->", expResponse)
                        
                    });
                    resolve ({ 'status': "Success" })
                }
            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })
    }

    async clientTmsResponse(req: any, res: any): Promise<any> {

        console.log("Inside ClientTMS")
        return new Promise(async (resolve, reject) => {
            try {

                console.log("Test")

                var tmsResponseList = await this.ExpResponseDataRepository.get({'status':"UNPROCESSED"})
                console.log("tmsResponseList--->",tmsResponseList)
                for (let tmsReponseItem of tmsResponseList) {
                    //Loop through tmsDataList variable and get individual message i.e tmsDataItem["message"]
                    var message = {"tmsResponse":tmsReponseItem}
                    console.log("Message", message)
                    var options = {
                        'method': 'POST',
                        'url': process.env.CLIENT2_URL,
                        'headers': {
                            //'Authorization': req.rawHeaders[1],
                            'Content-Type': 'application/JSON'
                        },
                        body: JSON.stringify(message)
                    };
                    //let resultList: any = []
                    var result = await request(options, async (error: any, response: any) => {
                        if (error) throw new Error(error);
                        console.log("response---->>>>>", response)
                        var expResponse = await this.ExpResponseDataRepository.update({ "parent_uuid": tmsReponseItem.parent_uuid }, { "status": "PROCESSED" });
                    });

                }

                resolve({ status: { code: 'Success'}})

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })

    }

    async getAllExpTmsData(req: any, res?: any): Promise<any> {
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