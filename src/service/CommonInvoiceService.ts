import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { any, resolve } from "bluebird";


var request = require('request');

export class CommonInvoiceService {
    private logger: Logger;

    constructor() {
        this.logger = DI.get(Logger);
    }


    async invoicePostMethod(req:any,res:any): Promise<any> {
        try {

            var options = {
                'method': 'POST',
                'url': process.env.POST_INVOICE_URL,
                'headers': {
                    'Authorization': 'Basic ZGhsYmxlc3NibG9DSDpDJDJhTyExbkMhMmVWQDhr',
                    'Content-Type': 'application/json',
                    'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                },
                body: JSON.stringify(req)
            };
            let resultList: any = [];
            let response
            //console.log("OPTIONS---->",options)
            var result = await request(options, async (error: any, response: any) => {
                if (error) throw new Error(error);
                console.log("response--->",response.body)
                response = response.body

            });
            console.log("response--->",response)

            resolve({ status: { code: 'Success'},result})

        } catch (e) {
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
        }
    }

    async invoicePatchMethod(req:any,res:any): Promise<any> {
        try {

            var options = {
                'method': 'PATCH',
                'url': process.env.PATCH_INVOICE_URL+req.shipmentTrackingNumber+process.env.PATCH_INVOICE_URL1,
                'headers': {
                    'Authorization': 'Basic ZGhsYmxlc3NibG9DSDpDJDJhTyExbkMhMmVWQDhr',
                    'Content-Type': 'application/json',
                    'Cookie': 'BIGipServer~WSB~pl_wsb-express-cbj.dhl.com_443=293349575.64288.0000'
                },
                //body: JSON.stringify(req)
            };
            this.logger.log("OPTIONS IN PATCH METHOD---->",options)
            // let resultList: any = [];
            // let response
            //console.log("OPTIONS---->",options)
            var result =  await request(options, (error: any, response: any) => {
                if (error) throw new Error(error);
                
                console.log("response--->",response.body)
                return response.body

            });
            //console.log("result--->",result)
            //return result
            //console.log("result--->",result)            

        } catch (e) {
            resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
        }
    }    
 
}