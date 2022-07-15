import { Controller } from "./Controller";
import { Router } from "express";

export class BaseController implements Controller {
    getRouter(): Router {
        const router = Router();
        router.get('/', (req, res) => {
            res.json({status: 'ok', message: 'base controller path /'});
        });
        return router;
    }
}