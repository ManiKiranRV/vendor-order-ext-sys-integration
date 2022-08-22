///import { ForwardingRepository } from "../data/repository/ForwardingRepository";
import { DI } from "../di/DIContainer";
import { Logger } from "../logger/Logger";
import { AuthService } from "./AuthService";
import { BaseService } from "./BaseService";
import { UtilityService } from './UtilityService';
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
//import { MawbMainRepository } from '../data/repository/MawbMainRepository';
import { MessagingService } from "./MessagingService"
import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";

export class DataGenTransformationService implements BaseService {

    private logger: Logger;
    private authService: AuthService;
    private utilityService: UtilityService;
    private ExpResponseDataRepository: ExpResponseDataRepository;
    private MessagingService: MessagingService;
    private vendorBookingRepository:VendorBookingRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.authService = DI.get(AuthService);
        this.utilityService = DI.get(UtilityService);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.MessagingService = DI.get(MessagingService);
        this.vendorBookingRepository = DI.get(VendorBookingRepository);
        
    }

    async dataGenTransformation(msgType: string): Promise<any> {
        let fianlPublishMessage;
        if (msgType === process.env.DATAGEN_TMS_RESP_MSG) {
            fianlPublishMessage = await this.expTmsLlpClient2(msgType)
        }//Similary use cases to implement other DatagenMessage 
        console.log("fianlPublishMessage--------->", fianlPublishMessage)
        //Sending the Final Datagen messages Array to Message Service
       await this.MessagingService.publishMessageToDataGen(fianlPublishMessage);
    }

    //Transformation service to build TMS RESPONSE data which is intended to send from LLP to CLIENT2
    async expTmsLlpClient2(msgType: any): Promise<any> {

        var tmsResponseList = await this.ExpResponseDataRepository.get({ 'status': "UNPROCESSED" })
        //console.log("Unprocessed responses--->",tmsResponseList)
        console.log("msgType------->", msgType)

        //BLESS Datagen variables
        let messagePrimary: any = process.env.DATAGEN_TMS_RESP_PRIMARY_RECEIVER;
        let issuer = process.env.DATAGEN_TMS_RESP_SENDER;
        let BLESS_datagen_appId = process.env.DATAGEN_TMS_RESP_APP_ID;

        let fianlPublishMessage: any = [];
        let objJsonB64;
        let vendBkngItem;
        try {
            for (let tmsReponseItem of tmsResponseList) {
                //Update the status in the response table of LLP to IN-PROGRESS. So that no other process picks the same record
                //let tmsReponseItem = tmsResponseList[0]
                this.logger.log("customer_order_number-------->",tmsReponseItem["customer_order_number"])
                //await this.ExpResponseDataRepository.update({ "customer_order_number":tmsReponseItem["customer_order_number"] }, { "status": "IN-PROGRESS" });
                
                vendBkngItem = await this.vendorBookingRepository.get({"customer_order_number":tmsReponseItem["customer_order_number"]})
                let objJsonStr = JSON.parse(JSON.stringify(tmsReponseItem));
                //Adding Bless Identity Fields
                objJsonStr['msgType'] = msgType;
                objJsonStr["CustomerOrderNumber"] = vendBkngItem[0]["customer_order_number"];
                objJsonStr["PlannedShippingDateTime"] =  vendBkngItem[0]["planned_shipping_date_and_time"];
                objJsonStr["ShipmentCreationDateTime"] = vendBkngItem[0]["shipment_creation_date_time"];

                //console.log("objJsonStr------->", objJsonStr)
                //Converting the response[i] to base64 formate

                objJsonB64 = Buffer.from(JSON.stringify({"body":objJsonStr})).toString("base64");
                //console.log("objJsonB64------->", objJsonB64)
                let publishMessage: any = {};
                var vcId = await this.utilityService.genVcid(issuer, messagePrimary, BLESS_datagen_appId);

                //console.log("vcId----->", vcId)
                publishMessage['receivers'] = {};
                publishMessage['id'] = vcId;
                publishMessage['msgType'] = process.env.DATAGEN_TMS_RESP_MSG
                publishMessage['audience'] = process.env.DATAGEN_TMS_RESP_AUDIENCE;
                publishMessage['receivers']['primary'] = [messagePrimary];
                publishMessage['receivers']['secondary'] = [];
                publishMessage['primary'] = true;
                publishMessage['applicationId'] = BLESS_datagen_appId;
                publishMessage['sender'] = issuer;
                publishMessage['issueTimeFLag'] = true;
                publishMessage['payloads'] = [objJsonB64];

                fianlPublishMessage.push(publishMessage);

                //Update the status in the response table of LLP 
                // this.logger.log("BEFORE UPDATE RES TABLE",tmsReponseItem["customer_order_number"])
                const whereObj = { "customer_order_number":tmsReponseItem["customer_order_number"]}
                const updateObj = { status: "PROCESSED" }
                this.logger.log("AFTER DATAGEN RES TABLES---->",whereObj,updateObj)
                await this.ExpResponseDataRepository.update(whereObj,updateObj);
            }
            //console.log("fianlPublishMessage------->", fianlPublishMessage)
            return fianlPublishMessage
        }
        catch (error) {

        }
    }


}






