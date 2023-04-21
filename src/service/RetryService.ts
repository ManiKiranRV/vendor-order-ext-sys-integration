import { Op } from "sequelize";
import { RetryRepository } from "../data/repository/RetryRepository";
import { DI } from "../di/DIContainer";
import { Logger } from "../logger/Logger";
import { VendorBookingRepository } from "../data/repository/VendorBookingRepository";

import * as moment from 'moment';
import { DocumentRepository } from "../data/repository/DocumentRepository";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";

export class RetryService {
    private logger: Logger
    private retryRepository: RetryRepository
    private vendorBookingRepository: VendorBookingRepository
    private expResponseDataRepository: ExpResponseDataRepository

    constructor() {
        this.logger = DI.get(Logger)
        this.retryRepository = DI.get(RetryRepository)
        this.vendorBookingRepository = DI.get(VendorBookingRepository)
        this.expResponseDataRepository = DI.get(ExpResponseDataRepository)

    }

    async vendorbookingRetryService() {
        // retry_count < 5, retry_status is null, msg_type = 'VENDOR_BOOKING'
        // build where condtion
        let retryWhereObj = {
            retry_count: { [Op.lte]: 5 },
            retry_status: { 
                [Op.eq]: null 
            },
            message_type: { [Op.eq]: 'VENDOR_BOOKING' }
        }
        let TO_BE_retried_records: any [] = await this.retryRepository.get(retryWhereObj)
        this.logger.log('current records: ', JSON.stringify(TO_BE_retried_records))
        TO_BE_retried_records = JSON.parse(JSON.stringify(TO_BE_retried_records))
        // get vendor_booking record by parent_id & update the order_status
        for (let record of TO_BE_retried_records) {
            let parentId = record['parent_id']
            let retryCount = record['retry_count']
            try {
                let expressMessage: any = await this.expResponseDataRepository.get({ id: parentId })
                expressMessage = expressMessage[0]
                this.logger.log('expressMessage: ', expressMessage)

                let customerOrderNumber = expressMessage.customer_order_number
                let hawb = expressMessage.shipmentTrackingNumber
                let responseTimestamp = String(expressMessage.updatedAt)

                this.logger.log('hawb: ', hawb, 'and customer Order Number: ', customerOrderNumber)
                // let today = new Date()
                // var todayUTC = moment.utc(today).format("YYYY-MM-DD HH:mm:ss") + ' UTC'+moment.utc(today).format("Z")
                let whereObj = { "customer_order_number": customerOrderNumber }
                if(expressMessage.statusCode == 201 || expressMessage.statusCode == 200) {
                    // Update VendorBooking Table
                    let vendorBookingUpdateObj = {
                        "order_status": process.env.VEN_BOOKING_CON_STATUS,
                        "hawb": hawb,
                        "response_time_stamp": responseTimestamp
                    }
                    this.logger.log("vendorBookingObj ---> ", vendorBookingUpdateObj)
                    await this.vendorBookingRepository.update(whereObj, vendorBookingUpdateObj)
                    // update retry_status to success 
                    .then(async() => {
                        await this.retryUpdate(parentId, retryCount, true)
                    })
                    // if fail to update, increase retry_count to 1
                    .catch(async(e) => {
                        this.logger.log('error: ', e)
                        await this.retryUpdate(parentId, retryCount, false)
                    })
                }
                else {
                    let jsonObj = expressMessage.message
                    let vendorBookingErrorObj = {
                        "order_status": process.env.VEN_BOOKING_ERR_STATUS,
                        "response_error_code": jsonObj.status,
                        "response_error_title": jsonObj.title,
                        "response_error_detail": (expressMessage.message.additionalDetails != undefined) ? jsonObj.detail + "," + "[" + jsonObj.additionalDetails + "]" : jsonObj.detail,
                        "response_time_stamp": responseTimestamp
                    }
                    this.logger.log("vendorBookingObj--->", vendorBookingErrorObj)
                    await this.vendorBookingRepository.update(whereObj, vendorBookingErrorObj)
                    .then(async() => {
                        await this.retryUpdate(parentId, retryCount, true)
                    })
                    // if fail to update, increase retry_count to 1
                    .catch(async(e) => {
                        this.logger.log('error: ', e)
                        await this.retryUpdate(parentId, retryCount, false)
                    })
                }
            }
            catch(e) {
                this.logger.log('error: ', e)
                await this.retryUpdate(parentId, retryCount, false)
            }
        }
        
        return TO_BE_retried_records
    }

    async retryUpdate(parentId: number, retryCount: number, success: boolean) {
        if (success) {
            this.retryRepository.update({ parent_id: parentId }, { retry_status: 'SUCCESS' })
        }
        else {
            let retryRecord: any = await this.retryRepository.get({ parent_id: parentId })
            if (retryRecord[0].retry_count == 4) {
                this.retryRepository.update({ parent_id: parentId }, { retry_count: retryCount + 1, retry_status: 'FAILED' })
            }
            else {
                this.retryRepository.update({ parent_id: parentId }, { retry_count: retryCount + 1 })
            }
        }
    }
}
