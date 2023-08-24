/*
    This is specific to Commercial Invoice
    **Mapping of Values to Commercial Invoice Template 
*/

import { GenericUtil } from "./GenericUtil";
import { DI } from '../di/DIContainer';
import { Logger } from '../logger/Logger';


export class CommercialInvoiceMapping {

    private GenericUtil:GenericUtil;
    private logger: Logger;

    constructor() {
        this.GenericUtil = DI.get(GenericUtil);
        this.logger = DI.get(Logger);
    }

    //To construct the Main Json Structure
    async getData(data:any,res:any) {
        let lineItem:any = await this.lineItemsMapping(data.line_item,data.org)
        return (
            {
                "shipmentTrackingNumber": data.shipmentTrackingNumber,
                "content": {
                    "exportDeclaration": [
                        {
                            "lineItems": lineItem,
                            "invoice": {
                                "date": data.invoice_date,
                                "number": data.invoice_number,
                                "function": "both" //default
                            },
                            "incoterm": data.incoterm
                        }
                    ],
                    "currency": data.currency,
                    "unitOfMeasurement": "metric" //default
                }
            }

        )

    }

    //For LineItems Mapping
    async lineItemsMapping(data:any,org:any){
        try{

            let lineItem:any =[]
            for (let lineDetails of data){
                let randomStr:any
                let commodity_typeCode:any
                if((lineDetails.commodity_typeCode === null) || (lineDetails.commodity_typeCode === "") || (lineDetails.commodity_typeCode === undefined)){
                    commodity_typeCode = "outbound"
                }else{
                    commodity_typeCode = lineDetails.commodity_typeCode.toLowerCase()
                }
                let unitOfMeasurement :any
                //if org == IBM only need to change uom mapping
                this.logger.log("ORG_NAME--->",org,process.env.ORG_NAME)
                if(org === process.env.ORG_NAME){
                    unitOfMeasurement = await this.uomValidation(lineDetails.quantity_uom)
                }else{
                    unitOfMeasurement = lineDetails.quantity_uom
                }
                // this.logger.log("unitOfMeasurement---------->",unitOfMeasurement)
                // randomStr = Math.floor(Math.random() * 1001)
                let obj:any ={
                        "number": lineDetails.number,//randomStr//lineDetails.number,
                        "commodityCodes": [
                            {
                                "value": (parseFloat(lineDetails.commodity_value)).toString(),
                                "typeCode": commodity_typeCode //(lineDetails.commodity_typeCode !== (null || "" || undefined) ? lineDetails.commodity_typeCode : "outbound")
                            }
                        ],
                        "quantity": {
                            "unitOfMeasurement": unitOfMeasurement, //lineDetails.quantity_uom - Need to add mappings,
                            "value": parseFloat(lineDetails.quantity_value)
                        },
                        "price": parseFloat(lineDetails.price),
                        "description": lineDetails.description,
                        "weight": {
                            "netValue": parseFloat(lineDetails.weight_netValue)
                        },
                        "manufacturerCountry": lineDetails.manufacturerCountry
                }

                //checking for gross value 

                // this.logger.log("GROSS_VALUE-------->",lineDetails.weight_grossValue)
                if(((lineDetails.weight_grossValue !== null) || (lineDetails.weight_grossValue !== "") || (lineDetails.weight_grossValue !== undefined)) && (lineDetails.weight_grossValue > 0)){
                    this.logger.log("if-block grossValue----->",lineDetails.weight_grossValue)
                    obj["weight"]["grossValue"] = parseFloat(lineDetails.weight_grossValue)


                }

                //checking commodityCodes value if does not exist or less than 0 remove commodityCodes

                this.logger.log("objcommodityCodes.value------>",obj["commodityCodes"][0]["value"])

                if((obj["commodityCodes"][0]["value"] === null) || (obj["commodityCodes"][0]["value"] === "NaN") || (obj["commodityCodes"][0]["value"] <= 0) || (obj["commodityCodes"][0]["value"] === "") || (obj["commodityCodes"][0]["value"] === undefined)){
                    delete obj["commodityCodes"]
                }
                this.logger.log("objobjobjobjobjobjobj-------->",obj)
                lineItem.push(obj)

            }

            
            // this.logger.log("lineItem--->",lineItem)
            return lineItem
        }catch(error){
            this.logger.log("Error",error)
        }
    }

    //Mapping unitOfMeasurment from IBM to Express
    async uomValidation(req:any){
        try {
            let filePath = process.env.JSONPATH+'uomMapping.json';
            // this.logger.log("filePath---->",filePath)
            let jsonObject:any = await this.GenericUtil.readJsonFile(filePath)
            let key = req
            if (jsonObject.hasOwnProperty(key)) {
              return jsonObject[key];
            } else {
              return "PCS";
            }
          } catch (error) {
            console.error('Invalid JSON format:', error);
            return undefined;
          }
    }

    async getOutputImageProperties() {
        return ({  
                "imageOptions": [
                    {
                        "typeCode": "invoice",
                        "templateName": "COMMERCIAL_INVOICE_P_10",
                        "isRequested": true
                    }
                ]
        })

    }

}