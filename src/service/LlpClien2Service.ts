import { Logger } from "../logger/Logger";
import { DI } from '../di/DIContainer';
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { UpdateCoreTablesService } from "./UpdateCoreTablesService";


var fs = require('fs');

var request = require('request');

export class LlpClien2Service {
    private logger: Logger;

    private ExpResponseDataRepository: ExpResponseDataRepository;
    private UpdateCoreTablesService: UpdateCoreTablesService;

    constructor() {
        this.logger = DI.get(Logger);
        this.ExpResponseDataRepository = DI.get(ExpResponseDataRepository);
        this.UpdateCoreTablesService = DI.get(UpdateCoreTablesService);
    }


    //LLP-CLIENT2//

    async clientTmsResponse(): Promise<any> {

        console.log("Inside ClientTMS")
        return new Promise(async (resolve, reject) => {
            try {

                console.log("Test")

                var tmsResponseList = await this.ExpResponseDataRepository.get({'status':"UNPROCESSED"})
                console.log("tmsResponseList--->",tmsResponseList)
                for (let tmsReponseItem of tmsResponseList) {
                    //Loop through tmsDataList variable and get individual message i.e tmsDataItem["message"]
                    var message = {"tmsResponse":tmsReponseItem}
                    console.log("Message", message)
                    var options = {
                        'method': 'POST',
                        'url': process.env.CLIENT2_URL,
                        'headers': {
                            //'Authorization': req.rawHeaders[1],
                            'Content-Type': 'application/JSON'
                        },
                        body: JSON.stringify(message)
                    };
                    var result = await request(options, async (error: any, response: any) => {
                        if (error) throw new Error(error);
                        var expResponse = await this.ExpResponseDataRepository.update({ "parent_uuid": tmsReponseItem.parent_uuid }, { "status": "PROCESSED" });
                    });

                    //Update Core Tables

                    var dataObj = tmsReponseItem.dataValues

                    console.log("dataObj",dataObj)

                    var updateDocument = await this.UpdateCoreTablesService.updateTmsResCoreTables(dataObj)


                }

                resolve({ status: { code: 'Success'}})

            } catch (e) {
                resolve({ status: { code: 'FAILURE', message: "Error in FileFormat", error: e } })
            }
        })

    }

}