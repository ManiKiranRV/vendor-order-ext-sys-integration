import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { QueryBuilder } from "../util/QueryBuilder";

var transform = require("node-json-transform").transform;
import * as moment from 'moment';

export class LobsterService {
    private logger: Logger;

    constructor() {
        this.logger = DI.get(Logger);
    }


    async lobData(req: any, res?: any, isError?:boolean): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                //console.log('Request Body inside LobsterService', req)    
                var message = req
                var baseMap = {
                    item : {
                        "header": "content",
                        "body": "content"
                    },
                    operate: [
                        {
                            run: function(val: any) { 
                                var today = new Date();
                                var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss") + ' UTC'+moment.utc(today).format("Z")
                                var _header = {
                                    "Transmission": {
                                        "toEntity": "Kalmar",
                                        "fromEntity": "EXP",
                                        "datacreationDate": todayUTC//"2022-06-29 06:21:57 UTC+02:00"
                                    },
                                    "businessKeys": {
                                        "accountNumber": message.content.accountNumber,
                                        "HAWB": message.content.HAWB,
                                        "PrincipalreferenceNumber": message.content.PrincipalreferenceNumber,
                                    }
                                }
                                return _header; 
                            },
                            on: "header"
                        },
                        {
                            run: function(val: any) { 
                                var body
                                if(isError){
                                    
                                    body = {
                                        "Error": [message.error]
                                            
                                    }
                                }else{
                                    body = {
                                        "documents": message.content.documents
                                    }
                                }
                                
    
                                return body; 
                            },
                            on: "body"
                        }
                    ]
                };
                    
                //console.log("baseMap",baseMap)
    
                var tdata = transform(message, baseMap);

                //console.log("tdata",tdata)
                         
                resolve({ tdata })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })


    }

}