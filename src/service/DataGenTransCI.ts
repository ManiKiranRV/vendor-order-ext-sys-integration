///import { ForwardingRepository } from "../data/repository/ForwardingRepository";
import { DI } from "../di/DIContainer";
import { Logger } from "../logger/Logger";
import { BaseService } from "./BaseService";
import { UtilityService } from './UtilityService';
import { MessagingService } from "./MessagingService"
import { ExpCommercialInvoiceDataRepository } from "../data/repository/ExpCommercialInvoiceDataRepository";



var today = new Date();
// var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss.SSSZ") + ' UTC' + moment.utc(today).format("Z")
export class DataGenTransCI implements BaseService {
    private logger: Logger;
    private utilityService: UtilityService;
    private MessagingService: MessagingService;
    private ExpCommercialInvoiceDataRepository :ExpCommercialInvoiceDataRepository;
    // private DownStreamService:DownStreamService;

    constructor() {
        this.logger = DI.get(Logger);
        this.utilityService = DI.get(UtilityService);
        this.ExpCommercialInvoiceDataRepository = DI.get(ExpCommercialInvoiceDataRepository);
        this.MessagingService = DI.get(MessagingService);
    
    }

    async dataGenTransformation(msgType: string): Promise<any> {
        let fianlPublishMessage;
        //Similary use cases to implement other DatagenMessage 
        if (msgType === process.env.DATAGEN_TMS_RESP_EXP_IBM_MSG) {
            fianlPublishMessage = await this.tmsRespLlpExp(msgType)
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
    async tmsRespLlpExp(msgType: any): Promise<any> {

        this.logger.log("Checking for msgType------->", msgType)

        //BLESS Datagen variables
        let messagePrimary: any = process.env.DATAGEN_TMS_RESP_EXP_IBM_PRIMARY_RECEIVER;
        let issuer = process.env.DATAGEN_TMS_RESP_EXP_IBM_SENDER;
        let BLESS_datagen_appId = process.env.DATAGEN_TMS_RESP_EXP_IBM_APP_ID;

        let fianlPublishMessage: any = [];
        let objJsonB64;
        let vendBkngItem;
        try {
            if (msgType === process.env.DATAGEN_TMS_RESP_EXP_IBM_MSG) {
                // Fetch UNPROCESSED data from exp_response_data table
                let x:any
                let tmsResponseList:Array<any> = await this.ExpCommercialInvoiceDataRepository.get({ 'org':"IBM",'exp_status': "UNPROCESSED" })
                //Update the status in the response table of LLP to IN-PROGRESS. So that no other process picks the same record
                let customerArray:any = await tmsResponseList.map(x=>x.customer_order_number)
                this.logger.log("customerArray---------->\n\n",customerArray)
                await this.ExpCommercialInvoiceDataRepository.update({ "customer_order_number":customerArray }, { "exp_status": "IN_PROGRESS" });
                for (let tmsReponseItem of tmsResponseList) {
                    let objJsonStr = JSON.parse(JSON.stringify(tmsReponseItem));
                    //Adding Bless Identity Fields
                    objJsonStr['msgType'] = msgType;
                    objJsonStr["CustomerOrderNumber"] = tmsReponseItem.customer_order_number;
                    this.logger.log("objJsonStr------->", objJsonStr)
                    
                    //Converting the response[i] to base64 formate

                    objJsonB64 = Buffer.from(JSON.stringify({ "body": objJsonStr })).toString("base64");
                    //this.logger.log("objJsonB64------->", objJsonB64)
                    let publishMessage: any = {};
                    var vcId = await this.utilityService.genVcid(issuer, messagePrimary, BLESS_datagen_appId);

                    //this.logger.log("vcId----->", vcId)
                    publishMessage['receivers'] = {};
                    publishMessage['id'] = vcId;
                    publishMessage['msgType'] = process.env.DATAGEN_TMS_RESP_EXP_IBM_MSG
                    publishMessage['audience'] = process.env.DATAGEN_TMS_RESP_EXP_IBM_AUDIENCE;
                    publishMessage['receivers']['primary'] = [messagePrimary];
                    publishMessage['receivers']['secondary'] = [];
                    publishMessage['primary'] = true;
                    publishMessage['applicationId'] = BLESS_datagen_appId;
                    publishMessage['sender'] = issuer;
                    publishMessage['issueTimeFLag'] = true;
                    publishMessage['payloads'] = [objJsonB64];

                    this.logger.log("publishMessage------------>",publishMessage)

                    fianlPublishMessage.push(publishMessage);
                    this.logger.log("Timestamp before Datagen in LLP---->", Date());
                    //Update the status in the response table of LLP 
                    // this.logger.log("BEFORE UPDATE RES TABLE",tmsReponseItem["customer_order_number"])
                    const whereObj = { "customer_order_number": tmsReponseItem["customer_order_number"] }
                    const updateObj = { "vcid": vcId, "exp_status":"PROCESSED"}
                    this.logger.log("Updating the Response Table after constructing the datagen object---->", whereObj, updateObj)
                    await this.ExpCommercialInvoiceDataRepository.update(whereObj, updateObj)
                }
            } 

            //this.logger.log("fianlPublishMessage------->", fianlPublishMessage)
            return fianlPublishMessage
        }
        catch (error) {

        }
    }

}






