import { BaseService } from "./BaseService";
import { Kafka, Consumer, Producer } from "kafkajs";
import { DI } from "../di/DIContainer";
import { Logger } from "../logger/Logger";
// import { DataProcess } from "./DataProcess";
// import { BookingResponseMapping } from "../util/BookingResponseMapping";
// import { AsnMapping } from "../util/AsnMapping";
// import { FsuMapping } from "../util/FsuMapping";
// import { DataGenTransformationService } from './DataGenTransformationService';
// import { GenericUtil } from "../util/GenericUtil";
// import { MawbMapping } from "../util/MawbMapping";
// import { HawbMapping } from "../util/HawbMapping";
// import { TempDataMapping } from "../util/TempDataMapping";
//import { ErroredMessagesRepository } from "../data/repository/ErroredMessagesRepository";
// import { TempDataRepository } from '../data/repository/TempDataRepository';
// import { MawbMainRepository } from "../data/repository/MawbMainRepository";
// import { WaybillLinkMapping } from "../util/WaybillLinkMapping";
import e from "express";



export class MessagingService implements BaseService {

//     private kafkav: Kafka = new Kafka({
//         clientId: process.env.KAFKA_CLIENT_ID,
//         brokers: ['kafka-2:29092', 'kafka-3:39092']
//     });

//     private kafkaanav: Kafka = new Kafka({
//         clientId: process.env.KAFKA_CLIENT_ID_ANASHIP,
//         brokers: ['kafka-ana-1:19092', 'kafka-ana-2:29092', 'kafka-ana-3:39092']
//     });

       private logger: Logger;
//     private dataProcessor: DataProcess;
//     //private erroredMessagesRepository:ErroredMessagesRepository;
//     private dataGenTransformationService: DataGenTransformationService;
//     private genericUtil:GenericUtil;
//     private tempDataRepository: TempDataRepository;
//     private mawbMainRepository: MawbMainRepository;

    constructor() {
        this.logger = DI.get(Logger);
        //this.dataProcessor = DI.get<DataProcess>(DataProcess);
        //this.erroredMessagesRepository = DI.get(ErroredMessagesRepository);
        // this.dataGenTransformationService = DI.get(DataGenTransformationService);
        // this.genericUtil = DI.get<GenericUtil>(GenericUtil);
        // this.tempDataRepository = DI.get(TempDataRepository);
        // this.mawbMainRepository = DI.get(MawbMainRepository);
    }




    ///////---Publishing to DATAGEN-------/////////

    async publishMessageToDataGen(message: any) {
        this.logger.log("Published DATAGEN Message =========", message);
        this.logger.log("Topic name",message.msgType);
        this.logger.log("payloads",message.payloads)
        //const producer: Producer = this.kafkav.producer();
        // await producer.connect();
        // await producer.send({
        //     topic: process.env.PUBLISH_TOPIC!,
        //     messages: [
        //         {
        //             value: JSON.stringify(message)
        //         }
        //     ]
        // });
        // this.logger.log("Message Published back to common output topic: ", process.env.PUBLISH_TOPIC!);
    }



}