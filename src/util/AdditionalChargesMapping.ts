/*
    This is specific to Commercial Invoice
    **Mapping of Values to Commercial Invoice Template 
*/

import { GenericUtil } from "./GenericUtil";
import { DI } from '../di/DIContainer';
import { Logger } from '../logger/Logger';


export class AdditionalChargesMapping {

    private GenericUtil:GenericUtil;
    private logger: Logger;

    constructor() {
        this.GenericUtil = DI.get(GenericUtil);
        this.logger = DI.get(Logger);
    }

    //For Additional Charges Mapping
    async getAdditionalCharges(data:any,org:any){
        let additionalCharges:any =[]
        for (let chargeDetails of data){
            
            let chargeCode :any
            //if org == IBM only need to change uom mapping
            this.logger.log("ORG_NAME--->",org,process.env.ORG_NAME)
            if(org === process.env.ORG_NAME){
                chargeCode = await this.additionalChargTrans(chargeDetails.chargeDescription)
            }else{
                chargeCode = chargeDetails.chargeDescription
            }
            let obj={
                    "value": chargeDetails.chargeAmount,//lineDetails.number,
                    "typeCode":chargeCode
                }
                additionalCharges.push(obj)
        }
        // this.logger.log("lineItem--->",lineItem)
        return additionalCharges
    }

    //Mapping unitOfMeasurment from IBM to Express
    async additionalChargTrans(req:any){
        try {
            let filePath = process.env.JSONPATH+'chargeMapping.json';
            // this.logger.log("filePath---->",filePath)
            let jsonObject:any = await this.GenericUtil.readJsonFile(filePath)
            let key = req
            if (jsonObject.hasOwnProperty(key)) {
              return jsonObject[key];
            } else {
              return "other";
            }
          } catch (error) {
            console.error('Invalid JSON format:', error);
            return undefined;
          }
    }



}