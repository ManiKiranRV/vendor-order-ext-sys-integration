import { BaseService } from "./BaseService";
import { Kafka, Consumer, Producer } from "kafkajs";
import { DI } from "../di/DIContainer";
import { Logger } from "../logger/Logger";




export class MessagingService implements BaseService {

    private kafkav: Kafka = new Kafka({
        clientId: process.env.KAFKA_CLIENT_ID,
        brokers: ['kafka-1:19092', 'kafka-2:29092', 'kafka-3:39092', 'kafka-4:19092', 'kafka-5:29092']
    });

    private logger: Logger;

    constructor() {
        this.logger = DI.get(Logger);
    }


    ///////---Publishing to DATAGEN-------/////////

    async publishMessageToDataGen(messageList: any) {
        if (!Array.isArray(messageList)) {
            messageList = [messageList];
        }
        for (let message of messageList) {
            this.logger.log("================================START-DATAGEN MESSAGE PUBLISH==================", message);
            this.logger.log("Datagen Message ", message);
            this.logger.log("Topic name ", process.env.PUBLISH_TOPIC!);
            this.logger.log("payloads ", message.payloads);
            const producer: Producer = this.kafkav.producer();
            await producer.connect();
            let blessToken = await producer.send({
                topic: process.env.PUBLISH_TOPIC!,
                messages: [
                    {
                        value: JSON.stringify(message)
                    }
                ]
            });
            this.logger.log(`BLESS TOKEN is ${JSON.stringify(blessToken)}`);
            this.logger.log("================================STOP-DATAGEN MESSAGE PUBLISH==================");
        }
    }



}