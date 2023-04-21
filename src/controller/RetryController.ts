import { Controller } from "./Controller";
import { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { Logger } from "../logger/Logger";
import { DI } from "../di/DIContainer";
import { ExpResponseDataRepository } from "../data/repository/ExpResponseDataRepository";
import { RetryService } from "../service/RetryService";
import { RetryRepository } from "../data/repository/RetryRepository";



var request = require('request');

export class RetryController implements Controller {
    private logger: Logger;
    private retryService: RetryService
    private retryRepository: RetryRepository
    private expResponseDataRepository: ExpResponseDataRepository

    constructor() {
        this.logger = DI.get(Logger);
        this.retryService = DI.get(RetryService)
        this.retryRepository = DI.get(RetryRepository)
        this.expResponseDataRepository = DI.get(ExpResponseDataRepository)
    }

    getRouter(): Router {
        const router = Router();

        router.post('/retry_booking', async (req, res) => {
            let resp: any = await this.retryService.vendorbookingRetryService()
            res.json({ status: 'success', result: resp })
        });
        
        router.post('/test_retry', async (req, res) => {
            let orderNumbers = req.body.orderNumbers
            for (let orderNo of orderNumbers) {
                let exp_response_data: any = await this.expResponseDataRepository.get({ "customer_order_number":  orderNo })
                let parentId = exp_response_data[0]['id']
                let retry_obj = {
                    parent_id: parentId,
                    message_type: 'VENDOR_BOOKING',
                    retry_count: 0,
                }
                await this.retryRepository.create(retry_obj)
            }
            res.json({ status: 'success' })
        });

        return router;
    }


}