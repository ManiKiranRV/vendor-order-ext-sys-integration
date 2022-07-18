import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { QueryBuilder } from "../util/QueryBuilder";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";


var fs = require('fs');


export class ExpResponseDataService {
    private logger: Logger;
    private ExpResponseDataRepository: ExpResponseDataRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
    }


    async expResData(req: any, res?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                console.log('Request Body inside ExpResponseDataService', req)

                var status = req.res.statusCode
                var data = req.res.data
                var data1 = JSON.parse(data)
                var shipmentTrackingNumber = data1.shipmentTrackingNumber
                var obj
                if (status == 201){
                    obj = {
                        statusCode: status,
                        status:"UNPROCESSED",
                        shipmentTrackingNumber:shipmentTrackingNumber,
                        message: data
                    }
                    
                }                
                console.log("Object",obj)
                var result = await this.ExpResponseDataRepository.create(obj); 
                console.log("Result",result)                           
                resolve({ res: result })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })


    }

    async getexpResData(req: any, res?: any): Promise<any> {
        return new Promise(async (resolve, reject) => {
            let whereObj: any = {};
            try {
                console.log('Request Body inside ExpResponseDataService', req)
                whereObj['shipmentTrackingNumber'] = req;
                whereObj['status'] = "UNPROCESSED";
                let responseData: any = await this.ExpResponseDataRepository.get(whereObj);
                
                //console.log("Result",responseData)                           
                resolve(responseData)

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })
    }

}