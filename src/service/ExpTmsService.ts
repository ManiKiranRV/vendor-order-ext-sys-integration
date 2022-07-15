import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";

var fs = require('fs');

var request = require('request');

export class ExpTmsService {
    private logger: Logger;
    private ExpTmsDataRepository: ExpTmsDataRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpTmsDataRepository = DI.get(ExpTmsDataRepository);
    }


    async expTmsData(req: any, res?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Request Body inside ExpTmsService', req)

                var status = req.statusCode
                var data = req
                var obj = {
                    status: "UNPROCESSED",
                    shipment_Tracking_Number:"3732179850",
                    message: data
                }
                console.log("Object",obj)
                var result = await this.ExpTmsDataRepository.create(obj); 
                console.log("Result",result)                           
                resolve({ status: { code: 'SUCCESS'},res: result })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })


    }

    async ExpDhl(req:any, res:any ): Promise<any> {

        return new Promise(async (resolve, reject) => {
            try {
                var options = {
                    'method': 'POST',
                    'url': process.env.POST_URL,
                    'headers': {
                    'Authorization': req.rawHeaders[1],
                    'Content-Type': 'application/json',
                    'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                    },
                    body: JSON.stringify(req.body)
                
                };
                res = await request(options, function (error:any, response:any) {
                    if (error) throw new Error(error);
                    response = {
                        statusCode:response.statusCode,
                        data:response.body
                    }
                    console.log("Response after constructing", response)
                    resolve({ res: response })
                });
            

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
                
                console.log("Result",responseData)                           
                resolve({ res: responseData })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })
    }

}