import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { QueryBuilder } from "../util/QueryBuilder";

var transform = require("node-json-transform").transform;
import * as moment from 'moment';

export class LobsterTransformationService {
    private logger: Logger;


    constructor() {
        this.logger = DI.get(Logger);
    }


    async lobData(message: any, isError?: boolean): Promise<any> {
        return new Promise(async (resolve, reject) => {
            try {
                //console.log('Request Body inside LobsterTransformationService', req)    
                var baseMap = {
                    item: {
                        "header": "content",
                        "body": "content"
                    },
                    operate: [
                        {
                            run: function (val: any) {
                                var today = new Date();
                                var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss") + ' UTC' + moment.utc(today).format("Z")
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
                                        "estimatedDeliveryDate": message.content.estimatedDeliveryDate
                                    }
                                }
                                console.log("HEADER--->", _header)
                                return _header;
                            },
                            on: "header"
                        },
                        {
                            run: function (val: any) {
                                var body
                                if (isError) {

                                    body = {
                                        "Error": [message.error]

                                    }
                                } else {
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

                console.log("tdata----->\n\n",tdata)

                resolve({ tdata })

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })


    }

    async transformEvents(message: any, res?: any, isError?: boolean): Promise<any> {
       return new Promise(async (resolve, reject) => {
            try {                
                var baseMap = {
                    item: {
                        "header": "content",
                        "body": "content"
                    },
                    operate: [
                        {
                            run: function (val: any) {
                                var today = new Date();
                                var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss") + ' UTC' + moment.utc(today).format("Z")
                                var _header = {
                                    "Transmission": {
                                        "toEntity": "Kalmar",
                                        "fromEntity": "EXP",
                                        "datacreationDate": todayUTC//"2022-06-29 06:21:57 UTC+02:00"
                                    },
                                    "businessKeys": {
                                        "accountNumber": message.shipperId,
                                        "HAWB": message.hawb,
                                        "PrincipalreferenceNumber": message.customerOrderNumber,
                                    }
                                }
                                return _header;
                            },
                            on: "header"
                        },
                        {
                            run: function (val: any) {


                                var body = {
                                    "Events": message.events
                                }



                                return body;
                            },
                            on: "body"
                        }
                    ]
                };


                resolve(await transform(message, baseMap));

            } catch (e) {
                reject(e)
            }
        })


    }
}