///import { ForwardingRepository } from "../data/repository/ForwardingRepository";
import { DI } from "../di/DIContainer";
import { Logger } from "../logger/Logger";
import { AuthService } from "./AuthService";
import { BaseService } from "./BaseService";
import { UtilityService } from './UtilityService';
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
//import { MawbMainRepository } from '../data/repository/MawbMainRepository';
import { MessagingService } from "./MessagingService"

export class DataGenTransformationService implements BaseService {

    private logger: Logger;
    private authService: AuthService;
    private utilityService: UtilityService;
    private ExpResponseDataRepository: ExpResponseDataRepository;
    private MessagingService: MessagingService;
   // private mawbMainRepository: MawbMainRepository;
    //private forwardingRepository: ForwardingRepository;
    
    constructor() {
        this.logger = DI.get(Logger);
        this.authService = DI.get(AuthService);
        this.utilityService = DI.get(UtilityService);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.MessagingService = DI.get(MessagingService);
       // this.mawbMainRepository = DI.get(MawbMainRepository);
       // this.forwardingRepository = DI.get(ForwardingRepository);  
    }

    async dataGenTransformation(inData?:any, value?:any):Promise<any>{ 


        // let finalMessage:any = {}
        // let inputData  = inData;
        let msgType = "vnd_exp"              //inputData.body.msgType;
        // let mawbMainResponse:any = {}

        
        // Fetch the records from response table "UNPROCESSED"
        
        var fianlPublishMessage = await this.expTmsLlpClient2(msgType)
        console.log("fianlPublishMessage--------->",fianlPublishMessage)
        //Sending the Final Publish message to Message Service
        var publishResult = await this.MessagingService.publishMessageToDataGen(fianlPublishMessage)

    }

    async expTmsLlpClient2(msgType:any): Promise<any> {

        var tmsResponseList = await this.ExpResponseDataRepository.get({'status':"UNPROCESSED"})
        console.log("msgType------->",msgType)
        
        let messagePrimary:any = "";
        let issuer = ""
        let BLESS_datagen_appId = ""

        let fianlPublishMessage: any = [];
        let objJsonB64
        
        //Looping the array of JSONs
        for(let tmsReponseItem of tmsResponseList){
   
            let objJsonStr = JSON.parse(JSON.stringify(tmsReponseItem));
            //Adding Bless Identity Fields
            objJsonStr['msgType'] = msgType
            // Need to derive
            // objJsonStr['plannedShippingDateAndTime'] = ""
            // objJsonStr['shipperAccountNumber'] = ""
            // objJsonStr['principalRef'] = ""
            console.log("objJsonStr------->",objJsonStr)
            //Converting the response[i] to base64 formate
            
            objJsonB64 = Buffer.from(JSON.stringify(objJsonStr)).toString("base64");
            console.log("objJsonB64------->",objJsonB64)
            let publishMessage: any = {};
            var vcId  = await this.utilityService.genVcid(issuer,messagePrimary,BLESS_datagen_appId);

            console.log("vcId----->",vcId)
            publishMessage['receivers'] = {};
            publishMessage['id'] = vcId;
            publishMessage['msgType'] = "vnd_exp"
            publishMessage['audience'] = "CLIENT-2";
            publishMessage['receivers']['primary'] =[messagePrimary];
            publishMessage['receivers']['secondary'] =[];
            publishMessage['primary'] = true;
            publishMessage['applicationId'] = BLESS_datagen_appId;
            publishMessage['sender'] = issuer;
            publishMessage['issueTimeFLag'] = true;
            publishMessage['payloads'] = [objJsonB64];

            fianlPublishMessage.push(publishMessage);

            //Update the status in the response table of LLP 
            var expResponse = await this.ExpResponseDataRepository.update({ "parent_uuid": tmsReponseItem.parent_uuid }, { "status": "PROCESSED" });
        }
        console.log("fianlPublishMessage------->",fianlPublishMessage)
        return fianlPublishMessage
    }
   
    
   }
    
 
      



