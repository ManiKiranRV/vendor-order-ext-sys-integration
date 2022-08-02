import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";
import { AddressRepository } from "../data/repository/AddressRepository";

import { LobsterTransformationService } from "./LobsterTransformationService";
import { EventsToLobsterRepository } from "../data/repository/EventsToLobsterRepository";
import { EventsRepository } from "../data/repository/EventsRepository";

var fs = require('fs');

var request = require('request');

export class LobsterService {
    private logger: Logger;
    private expResponseDataRepository: ExpResponseDataRepository;
    private lobsterTransformationService: LobsterTransformationService;
    private vendorBoookingRepository: VendorBookingRepository;
    private addressRepository: AddressRepository;
    private eventsToLobsterRepository: EventsToLobsterRepository;
    private eventsRepository: EventsRepository;

    constructor() {
        this.logger = DI.get(Logger);
        this.expResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.lobsterTransformationService = DI.get(LobsterTransformationService);
        this.addressRepository = DI.get(AddressRepository);
        this.vendorBoookingRepository = DI.get(VendorBookingRepository);
        this.eventsToLobsterRepository = DI.get(EventsToLobsterRepository);
        this.eventsRepository = DI.get(EventsRepository);
    }



    async postTmsResponseToLobster(): Promise<any> {

        return new Promise(async (resolve, reject) => {
            try {
                //Get all UNPROCESSED TMS Response Messages from exp_response_data table 
                let tmsResponseList: any = await this.expResponseDataRepository.get({ "status": "UNPROCESSED" })
                //Loop the UNPROCESSED rows and submit to LOBSTER SYSTEM
                for (let tmsReponseItem of tmsResponseList) {
                    var resp = JSON.parse(tmsReponseItem.dataValues.message)
                    var conMessage
                    var resp = JSON.parse(tmsReponseItem.dataValues.message);
                    //Derive accountNumber to be sent to LOSTER system
                    let vendorOrderItem = (await this.vendorBoookingRepository.get({ "customer_order_number": tmsReponseItem["customer_order_number"] }));
                    if (vendorOrderItem.length > 0) {
                        var id = vendorOrderItem[0]["id"]
                    } else {
                        //Save Error Message to exp_response_data table
                        await this.expResponseDataRepository.update({ "id": tmsReponseItem.id }, { "status": "ERROR", "error_reason": `No Vendor Booking Found with customer_order_number=${tmsReponseItem["customer_order_number"]}` });
                        continue;
                    }

                    let addressList = await this.addressRepository.get({ "address_type": "consignor", "parent_id": id });
                    let accountNumber;

                    if (addressList.length > 0) {
                        accountNumber = addressList[0]["address_id"];
                    } else {
                        accountNumber = "";
                    }
                    console.log(`Account Number is ${accountNumber}`)

                    var message = {
                        "content": {
                            "accountNumber": accountNumber,
                            "HAWB": resp.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": tmsReponseItem["customer_order_number"],
                            "documents": resp.documents
                        }
                    };

                    //Removing extraneous fields in the error message
                    var errorBody = JSON.parse(tmsReponseItem.dataValues.message)
                    delete errorBody["instance"];
                    delete errorBody["message"];
                    var errorMessage = {
                        "content": {
                            "accountNumber": accountNumber,
                            "HAWB": resp.shipmentTrackingNumber,
                            "PrincipalreferenceNumber": tmsReponseItem["customer_order_number"],
                            "documents": resp.documents
                        },
                        "error": errorBody
                    };

                    //Construct final Loster POST message
                    if (tmsReponseItem.dataValues.statusCode == 201) {
                        conMessage = await this.lobsterTransformationService.lobData(message);
                    } else {
                        conMessage = await this.lobsterTransformationService.lobData(errorMessage, true);
                    }

                    console.log("conMessage", conMessage)

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

                        console.log("response----->", response.body)
                        var expResponse = await this.expResponseDataRepository.update({ "id": tmsReponseItem.id }, { "status": response.body, "request": JSON.stringify(options) });
                        //console.log("Response---->", expResponse)

                    });
                    resolve({ 'status': "Success" })
                }
            } catch (error) {
                //Update processing_status of events table to ERROR
                await this.expResponseDataRepository.update({ "id": id }, { "status": "ERROR", "error_reason": error });
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: error } })
            }
        })
    }

    async postEventsToLobster(): Promise<any> {
        //Get Data from EVENTS_TO_LOBSTER View
        let evenntsDataToLobster = await this.eventsToLobsterRepository.get({});

        let transformedEventsData: any;
        let options: any;
        let eventsUpdateObj: any;
        let eventsUpdateWhereObj: any;
        for (let evenntsDataToLobsterItem of evenntsDataToLobster) {
            try {
                //Only Hawb should be enough as the events table will only contain the events that should be sent to LOBSTER System
                eventsUpdateWhereObj = { "hawb": evenntsDataToLobsterItem["hawb"] };
                eventsUpdateObj = { "processing_status": "SENT" }
                transformedEventsData = await this.lobsterTransformationService.transformEvents(evenntsDataToLobsterItem);
                options = {
                    'method': 'POST',
                    'url': process.env.LOBSTER_POST_URL,
                    'headers': {
                        'Authorization': 'Basic QkxFU1NfVEVTVDpUMCNmIWI4PTVR',
                        'Content-Type': 'text/plain'
                    },
                    body: JSON.stringify(transformedEventsData)
                };

                this.logger.log(`Lobster Options is ${JSON.stringify(options)}`);
                await request(options, async (error: any, response: any) => {
                    if (error) throw new Error(error);
                    //Update processing_status of events table to SENT
                    await this.eventsRepository.update(eventsUpdateWhereObj, eventsUpdateObj);
                });
            } catch (error) {
                //Update processing_status of events table to ERROR
                eventsUpdateObj = { "processing_status": "ERROR", "error_reason": error };
                await this.eventsRepository.update(eventsUpdateWhereObj, eventsUpdateObj);
            }
        }
    }



}