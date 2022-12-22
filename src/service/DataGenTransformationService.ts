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
import { ExpTmsDataRepository } from "../data/repository/ExpTmsDataRepository";
import { ExpRateResponseDataRepository } from "../data/repository/ExpRateResponseDataRepository";
// import { DownStreamService } from "./DownStreamService";
import { GenericUtil } from "../util/GenericUtil";

//For Timestamp
import * as moment from 'moment';
var today = new Date();
// var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss.SSSZ") + ' UTC' + moment.utc(today).format("Z")
export class DataGenTransformationService implements BaseService {

    private logger: Logger;
    private authService: AuthService;
    private utilityService: UtilityService;
    private ExpResponseDataRepository: ExpResponseDataRepository;
    private MessagingService: MessagingService;
    private vendorBookingRepository: VendorBookingRepository;
    private ExpRateResponseDataRepository: ExpRateResponseDataRepository;
    private ExpTmsDataRepository :ExpTmsDataRepository;
    // private DownStreamService:DownStreamService;

    constructor() {
        this.logger = DI.get(Logger);
        this.authService = DI.get(AuthService);
        this.utilityService = DI.get(UtilityService);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.MessagingService = DI.get(MessagingService);
        this.vendorBookingRepository = DI.get(VendorBookingRepository);
        this.ExpRateResponseDataRepository = DI.get(ExpRateResponseDataRepository);
        this.ExpTmsDataRepository = DI.get(ExpTmsDataRepository)
        // this.DownStreamService = DI.get(DownStreamService)
    }

    async dataGenTransformation(msgType: string): Promise<any> {
        let fianlPublishMessage;
        //Similary use cases to implement other DatagenMessage 
        if (msgType === process.env.DATAGEN_TMS_RESP_MSG) {
            fianlPublishMessage = await this.expTmsLlpClient2(msgType)
        } else if (msgType === process.env.DATAGEN_TMS_RATE_RESP_MSG) {
            fianlPublishMessage = await this.expTmsLlpClient2(msgType)
        }

        this.logger.log("fianlPublishMessage that is going into Publish Message--------->", fianlPublishMessage)
        //Sending the Final Datagen messages Array to Message Service
        await this.MessagingService.publishMessageToDataGen(fianlPublishMessage);
        //Sending data to Lobster directly without datagen publish

        // await this.DownStreamService.downStreamToLobsterSystem(fianlPublishMessage.payloads);
        this.logger.log("Final message Payload that is returning", fianlPublishMessage)
        return fianlPublishMessage
    }

    //Transformation service to build TMS RESPONSE data which is intended to send from LLP to CLIENT2
    async expTmsLlpClient2(msgType: any): Promise<any> {

        this.logger.log("Checking for msgType------->", msgType)

        //BLESS Datagen variables
        let messagePrimary: any = process.env.DATAGEN_TMS_RESP_PRIMARY_RECEIVER;
        let issuer = process.env.DATAGEN_TMS_RESP_SENDER;
        let BLESS_datagen_appId = process.env.DATAGEN_TMS_RESP_APP_ID;

        let fianlPublishMessage: any = [];
        let objJsonB64;
        let vendBkngItem;
        try {
            if (msgType === process.env.DATAGEN_TMS_RESP_MSG) {
                // Fetch UNPROCESSED data from exp_response_data table
                var tmsResponseList = await this.ExpResponseDataRepository.get({ 'status': "UNPROCESSED" })
                for (let tmsReponseItem of tmsResponseList) {
                    //Update the status in the response table of LLP to IN-PROGRESS. So that no other process picks the same record
                    //let tmsReponseItem = tmsResponseList[0]
                    this.logger.log("customer_order_number-------->", tmsReponseItem["customer_order_number"])

                    //await this.ExpResponseDataRepository.update({ "customer_order_number":tmsReponseItem["customer_order_number"] }, { "status": "IN-PROGRESS" });

                    vendBkngItem = await this.ExpTmsDataRepository.get({ "customer_order_number": tmsReponseItem["customer_order_number"] })
                    this.logger.log("vendBkngItem--->",vendBkngItem)
                    this.logger.log("Message---->",vendBkngItem[0].message.plannedShippingDateAndTime)
                    
                    // const delay = ms => new Promise(res => setTimeout(res, ms));
                    
                    // Re-try mechanism
                    // if(vendBkngItem.length == 0){
                    //     this.logger.log("Entered into if-condition if lenght is 0")
                        
                    //     await GenericUtil.delay(2000);
                    //     vendBkngItem = await this.vendorBookingRepository.get({ "customer_order_number": tmsReponseItem["customer_order_number"] })
                    // }
                    if (vendBkngItem.length > 0) {

                        let objJsonStr = JSON.parse(JSON.stringify(tmsReponseItem));
                        //Adding Bless Identity Fields
                        objJsonStr['msgType'] = msgType;
                        objJsonStr["CustomerOrderNumber"] = vendBkngItem[0]["customer_order_number"];
                        objJsonStr["PlannedShippingDateTime"] = vendBkngItem[0].message.plannedShippingDateAndTime;
                        objJsonStr["ShipmentCreationDateTime"] = vendBkngItem[0].message.plannedShippingDateAndTime;

                        console.log("objJsonStr------->", objJsonStr)
                        //Converting the response[i] to base64 formate

                        objJsonB64 = Buffer.from(JSON.stringify({ "body": objJsonStr })).toString("base64");
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
                        console.log("Timestamp before Datagen in LLP---->", Date());
                        //Update the status in the response table of LLP 
                        // this.logger.log("BEFORE UPDATE RES TABLE",tmsReponseItem["customer_order_number"])
                        const whereObj = { "customer_order_number": tmsReponseItem["customer_order_number"] }
                        const updateObj = { "parent_uuid": vcId }
                        this.logger.log("Updating the Response Table after constructing the datagen object---->", whereObj, updateObj)
                        await this.ExpResponseDataRepository.update(whereObj, updateObj);
                    } else {
                        //Save Error Message to exp_response_data table
                        await this.ExpResponseDataRepository.update({ "customer_order_number": tmsReponseItem["customer_order_number"] }, { "status": "ERROR", "error_reason": `No Vendor Booking Found with customer_order_number=${tmsReponseItem["customer_order_number"]}` });
                        //continue;
                    }

                }
            } else if (msgType === process.env.DATAGEN_TMS_RATE_RESP_MSG) {
                // Fetch UNPROCESSED data from exp_rates_response_data table
                var tmsRatesResponseList = await this.ExpRateResponseDataRepository.get({ 'status': "UNPROCESSED" })
                for (let tmsRatesReponseItem of tmsRatesResponseList) {

                    this.logger.log("customer_order_number inside Rate Datagen -------->", tmsRatesReponseItem["customer_order_number"])

                    let objJsonStr = JSON.parse(JSON.stringify(tmsRatesReponseItem));
                    //Adding Bless Identity Fields
                    objJsonStr['msgType'] = msgType;
                    objJsonStr["shipper_account_number"] = tmsRatesReponseItem["shipper_account_number"]
                    objJsonStr["sequence_timestamp"] = tmsRatesReponseItem["sequence_timestamp"],
                        objJsonStr["shipper_postalCode"] = tmsRatesReponseItem["shipper_postalCode"],
                        objJsonStr["receiver_postalCode"] = tmsRatesReponseItem["receiver_postalCode"],
                        // objJsonStr["customer_order_number"] = tmsRatesReponseItem["customer_order_number"];

                        console.log("objJsonStr------->", objJsonStr)

                    //Converting the response[i] to base64 format

                    objJsonB64 = Buffer.from(JSON.stringify({ "body": objJsonStr })).toString("base64");
                    console.log("objJsonB64------->", objJsonB64)
                    let publishMessage: any = {};
                    let vcId = await this.utilityService.genVcid(issuer, messagePrimary, BLESS_datagen_appId);

                    // let vcId = tmsRatesReponseItem["vcid"]
                    //console.log("vcId----->", vcId)
                    publishMessage['receivers'] = {};
                    publishMessage['id'] = vcId;
                    publishMessage['msgType'] = process.env.DATAGEN_TMS_RATE_RESP_MSG
                    publishMessage['audience'] = process.env.DATAGEN_TMS_RESP_AUDIENCE;
                    publishMessage['receivers']['primary'] = [messagePrimary];
                    publishMessage['receivers']['secondary'] = [];
                    publishMessage['primary'] = true;
                    publishMessage['applicationId'] = BLESS_datagen_appId;
                    publishMessage['sender'] = issuer;
                    publishMessage['issueTimeFLag'] = true;
                    publishMessage['payloads'] = [objJsonB64];

                    fianlPublishMessage.push(publishMessage);
                    console.log("Timestamp before Datagen in LLP---->", Date());
                    //Update the status in the response table of LLP 
                    // this.logger.log("BEFORE UPDATE RES TABLE",tmsRatesReponseItem["customer_order_number"])
                    const whereObj = { "customer_reference": tmsRatesReponseItem["customer_reference"] }
                    const updateObj = { "vcid": vcId }
                    this.logger.log("Updating the RatesResponse Table after constructing the datagen object---->", whereObj, updateObj)
                    await this.ExpRateResponseDataRepository.update(whereObj, updateObj);
                }
            }

            //console.log("fianlPublishMessage------->", fianlPublishMessage)
            return fianlPublishMessage
        }
        catch (error) {

        }
    }

}






