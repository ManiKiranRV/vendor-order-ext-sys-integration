import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";

var fs = require('fs');

var request = require('request');

export class ExpTmsService {
    private logger: Logger;
    private ExpTmsDataRepository: ExpTmsDataRepository;
    private ExpResponseDataRepository: ExpResponseDataRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpTmsDataRepository = DI.get(ExpTmsDataRepository);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
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
                    console.log("Message", message)
                    var options = {
                        'method': 'POST',
                        'url': process.env.POST_URL,
                        'headers': {
                            'Authorization': req.rawHeaders[1],
                            'Content-Type': 'application/json',
                            'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                        },
                        body: JSON.stringify(message)
                    };
                    let resultList: any = []
                    var result = await request(options, async (error: any, response: any) => {
                        if (error) throw new Error(error);
                        console.log("response.body.shipmentTrackingNumber", JSON.parse(response.body).shipmentTrackingNumber)
                        var expres = {
                            statusCode: response.statusCode,
                            message: response.body,
                            shipmentTrackingNumber: JSON.parse(response.body).shipmentTrackingNumber,
                            status: "UNPROCESSED"
                        }

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
        //Get Response all UNPROCESSED Messages from exp_response_data table 
        let tmsResponseList: any = await this.ExpResponseDataRepository.get({ "status": "UNPROCESSED" })
        //Loop the UNPROCESSED rows and submit to LOBSTER SYSTEM
        for (let tmsReponseItem of tmsResponseList) {
            var message = tmsReponseItem.message
            //Construct final Loster POST message

            console.log("Message", message)
            var options = {
                'method': 'POST',
                'url': process.env.LOBSTER_POST_URL,
                'headers': {
                    'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                    'Content-Type': 'text/plain'
                },
                body: JSON.stringify(message)
            };
            var result = await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                //Save response from Lobster system to exp_response table
                var expResponse = await this.ExpResponseDataRepository.update({ "id": tmsReponseItem.id }, { "status": response.body });
            });
        }
    }


    async getAllExpTmsData(req: any, res?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let whereObj: any = {};
            try {
                console.log('Request Body inside ExpTmsService', req)
                //whereObj['shipment_Tracking_Number'] = req;
                whereObj['status'] = "UNPROCESSED";
                let responseData: any = await this.ExpTmsDataRepository.get(whereObj);

                console.log("Result", responseData)
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
                console.log('Request Body inside ExpTmsService', req)
                whereObj['shipment_Tracking_Number'] = req;
                whereObj['status'] = "UNPROCESSED";
                let responseData: any = await this.ExpTmsDataRepository.get(whereObj);

                console.log("Result", responseData)
                resolve({ res: responseData })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })
    }

}