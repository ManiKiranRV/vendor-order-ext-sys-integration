import { Router } from "express";

export interface Controller {
    getRouter(): Router;
}