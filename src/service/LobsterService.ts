import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { AddressRepository } from "../data/repository/AddressRepository";

import { LobsterTransformationService } from "./LobsterTransformationService";

var fs = require('fs');

var request = require('request');

export class LobsterService {
    private logger: Logger;
    private ExpResponseDataRepository: ExpResponseDataRepository;
    private LobsterTransformationService: LobsterTransformationService;
    private vendorBoookingRepository:VendorBookingRepository;
    private addressRepository:AddressRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.LobsterTransformationService = DI.get(LobsterTransformationService);
        this.addressRepository = DI.get(AddressRepository);
        this.vendorBoookingRepository = DI.get(VendorBookingRepository);
    }


    //CLIENT2-LOBSTER-VendorOrder//

    async postToLobsterSystem( res?: any): Promise<any> {

        return new Promise(async (resolve, reject) => {
            try {
                //Get Response all UNPROCESSED Messages from exp_response_data table 
                let tmsResponseList: any = await this.ExpResponseDataRepository.get({ "status": "UNPROCESSED" })
                //Loop the UNPROCESSED rows and submit to LOBSTER SYSTEM
                for (let tmsReponseItem of tmsResponseList) {
                    console.log("tmsReponseItem.dataValues.parent_uuid",tmsReponseItem.dataValues.parent_uuid)
                    let uuid = tmsReponseItem.dataValues.parent_uuid
                    console.log("uuid",uuid)
                    var resp = JSON.parse(tmsReponseItem.dataValues.message)
                    var conMessage
                    var resp = JSON.parse(tmsReponseItem.dataValues.message);
                    //Derive accountNumber to be sent to LOSTER system
                    let vendorOrderItem = (await this.vendorBoookingRepository.get({"customer_order_number":tmsReponseItem["customer_order_number"]}))[0];
                    if (vendorOrderItem.length > 0){
                        var id = vendorOrderItem["id"]
                    }else{
                        //Save Error Message to exp_response_data table --> Need to Impliment
                        break
                    }
                    
                    let addressList = await this.addressRepository.get({"address_type":"consignor","parent_id":id});
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
                            "HAWB": resp.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": tmsReponseItem["customer_order_number"],
                            "documents": resp.documents
                        }
                    };
                    
                    //Removing few fields in the error message
                    var errorBody = JSON.parse(tmsReponseItem.dataValues.message)
                    delete errorBody["instance"];
                    delete errorBody["message"];
                    console.log("errorBody--------->",errorBody)
                    var errorMessage = {
                        "content":{
                            "accountNumber": accountNumber,
                            "HAWB": resp.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": tmsReponseItem["customer_order_number"],
                            "documents": resp.documents
                        },
                        "error": errorBody
                    };

                    //Construct final Loster POST message
                    if(tmsReponseItem.dataValues.statusCode == 201){
                        conMessage = await this.LobsterTransformationService.lobData(message, res);
                    }else{
                        conMessage = await this.LobsterTransformationService.lobData(errorMessage, res, true);
                    }
                    
                    console.log("conMessage",conMessage)
                
                    var options = {
                        'method': 'POST',
                        'url': process.env.LOBSTER_POST_URL,
                        'headers': {
                            'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                            'Content-Type': 'text/plain'
                        },
                       body: JSON.stringify(conMessage.tdata)
                    };

                    this.logger.log(`Lobster Options is ${JSON.stringify(options)}`);
                    var result = await request(options, async (error: any, response: any) => {
                        if (error) throw new Error(error);
                        //Save response from Lobster system to exp_response table
                        
                        console.log("response----->",response.body)
                        var expResponse = await this.ExpResponseDataRepository.update({ "parent_uuid": tmsReponseItem.parent_uuid }, { "status": response.body ,"request": JSON.stringify(options)});
                        //console.log("Response---->", expResponse)
                        
                    });
                    resolve ({ 'status': "Success" })
                }
            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })
    }

    async postEventToLobster(): Promise<any> {
        //Need to be developed 
    }

}