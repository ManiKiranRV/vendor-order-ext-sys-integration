import { Controller } from "./Controller";
import { Router, Request, Response } from "express";
import { DI } from '../di/DIContainer';
import { Logger } from "../logger/Logger";
import { NextFunction } from "connect";
import { AuthService } from "../service/AuthService"

import fs from "fs";
import { resolve } from "bluebird";

export class AuthController implements Controller {
    private logger: Logger = DI.get(Logger);
    private authService: AuthService;


    constructor() {
        this.logger = DI.get(Logger);
        this.authService = DI.get(AuthService);

    }

    getRouter(): Router {
        let router = Router();

        router.get('/generate-token', async (req: Request, res: Response, next: NextFunction) => {
            try {
                let token = await this.authService.generateJWTToken({"user":"uat-downstreamuser","password": "bless123$"});               
                console.log(`TOken in controller is ${token}`)
                res.json(token);
            } catch (error) {
                next(error);
            }
        });

        return router;
    }
}
