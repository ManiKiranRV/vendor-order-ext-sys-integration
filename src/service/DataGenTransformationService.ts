///import { ForwardingRepository } from "../data/repository/ForwardingRepository";
import { DI } from "../di/DIContainer";
import { Logger } from "../logger/Logger";
import { AuthService } from "./AuthService";
import { BaseService } from "./BaseService";
import { UtilityService } from './UtilityService';
//import { MawbMainRepository } from '../data/repository/MawbMainRepository';

export class DataGenTransformationService implements BaseService {

    private logger: Logger;
    private authService: AuthService;
    private utilityService: UtilityService;
   // private mawbMainRepository: MawbMainRepository;
    //private forwardingRepository: ForwardingRepository;
    
    constructor() {
        this.logger = DI.get(Logger);
        this.authService = DI.get(AuthService);
        this.utilityService = DI.get(UtilityService);
       // this.mawbMainRepository = DI.get(MawbMainRepository);
       // this.forwardingRepository = DI.get(ForwardingRepository);  
    }

    async dataGenTransformation(inData:any, value:any):Promise<Object[]>{ 
        let finalMessage:any = {}
        let inputData  = inData;
        let msgType = inputData.body.msgType;
        let mawbMainResponse:any = {}
        let messagePrimary:any = "";
        if(process.env.MSG_TYPE1?.includes(msgType)){
            // mawbMainResponse = await this.mawbMainRepository.getLatest({ MasterAirwayBillNumber: inputData['body']['bookingDetails']['fwbSerialNumber']});
            // if(mawbMainResponse !==null && mawbMainResponse !==undefined && mawbMainResponse !=={}){
            //     if(mawbMainResponse['ForwarderCourier'] == 'DGF'){
            //         messagePrimary = "DHL-DGF";
            //         msgType = msgType.split("_")[0]+"_"+"DGF";
            //         this.logger.log("messageType in DataGen:",process.env[`${msgType}`]);
            //         msgType = process.env[`${msgType}`];
            //     }else if(mawbMainResponse['ForwarderCourier'] == 'DHLE'){
            //         messagePrimary = "DHL-EXP";
            //         msgType = msgType.split("_")[0]+"_"+"EXP";
            //         this.logger.log("messageType in DataGen:",process.env[`${msgType}`]);
            //         msgType = process.env[`${msgType}`];
            //     }
              
            // }
            //else return finalMessage;
        }else if(process.env.MSG_TYPE3?.includes(msgType)){
            // mawbMainResponse = await this.mawbMainRepository.getLatest({ MasterAirwayBillNumber: inputData['body']['awbDetails']['fwbSerialNumber']});
            // if(mawbMainResponse !==null && mawbMainResponse !==undefined && mawbMainResponse !=={}){
            //     if(mawbMainResponse['ForwarderCourier'] == 'DGF'){
            //         messagePrimary = "DHL-DGF";
            //         msgType = msgType.split("_")[0]+"_"+"DGF";
            //         this.logger.log("messageType in DataGen:",process.env[`${msgType}`]);
            //         msgType = process.env[`${msgType}`];
            //     }else if(mawbMainResponse['ForwarderCourier'] == 'DHLE'){
            //         messagePrimary = "DHL-EXP";
            //         msgType = msgType.split("_")[0]+"_"+"EXP";
            //         this.logger.log("messageType in DataGen:",process.env[`${msgType}`]);
            //         msgType = process.env[`${msgType}`];
            //     }
              
            // }
            //else return finalMessage;
        }
        else if(msgType == "WAYBILL_LINK"){
            messagePrimary = "CLIENT-2";
            console.log('value',value);
        }

        
    
        inputData['body']['msgType'] = msgType;
        value['sender'] = process.env.CLIENT3_TRF_UP;
        this.logger.log("inputResponse::", JSON.stringify(inputData))
        let objJsonStr = JSON.stringify(inputData);
        let objJsonB64 = Buffer.from(objJsonStr).toString("base64");
        let issuer = value.sender;
         
        let BLESS_datagen_appId = "CLIENT-3-TRANSAIR";
        var vcId  = await this.utilityService.genVcid(issuer,messagePrimary,BLESS_datagen_appId); 
        this.logger.log("VcId for DataGen: ", vcId);
        
        
        let publishMessage: any = {};
        publishMessage['receivers'] = {};
        publishMessage['id'] = vcId;
        publishMessage['msgType'] = msgType
        publishMessage['audience'] = "CLIENT-3";
        publishMessage['receivers']['primary'] =[messagePrimary];
        publishMessage['receivers']['secondary'] =[];
        publishMessage['primary'] = true;
        publishMessage['applicationId'] = BLESS_datagen_appId;
        publishMessage['sender'] = issuer;
        publishMessage['issueTimeFLag'] = true;
        publishMessage['payloads'] = [objJsonB64];
        this.logger.log("message before publish to DataGen: ",publishMessage);
        finalMessage['publishMessage'] = publishMessage;
        return finalMessage;
      }
      
      
}


