import { BaseService } from "./BaseService";

export class UtilityService implements BaseService {
    
    isJsonString(val: string): boolean {
        try {
            JSON.parse(val);
        } catch (e) {
            return false;
        }
        return true;
    }

    //---------------------------Generatin vcid-----------------------//
    async genVcid(sender:any, receiver:any, appId:any): Promise<string> {

        const {createHash} = require('crypto');
        var timeInMillSec = new Date().getTime();

        //generate random string
        var randomStr           = '';
        var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        var charactersLength = characters.length;
        for ( var i = 0; i < 20; i++ ) {
        randomStr += characters.charAt(Math.floor(Math.random() * 
        charactersLength));
            }
        
        var vcIdStr = sender+"#"+appId+"#"+timeInMillSec+"#"+randomStr;
        const hash = createHash('sha256');
        hash.write(JSON.stringify(vcIdStr)); 
        vcIdStr = hash.digest('hex'); 

        return vcIdStr;
    }
}