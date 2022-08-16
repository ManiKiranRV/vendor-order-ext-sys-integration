import jwt from 'jsonwebtoken';
import { BaseService } from '../service/BaseService';
import { Logger } from "../logger/Logger";
import { DI } from "../di/DIContainer";
import { NextFunction } from "connect";
import { Router, Request, Response } from "express";

// const config = require('../config/config.js');


export class VerifyJwtTokenService implements BaseService {

  private logger: Logger;

  constructor() {
    this.logger = DI.get(Logger);
  }

  async verifyToken(req: Request, res: Response, next: NextFunction) {

    let bearerHeader: any = req.headers['authorization'];
    console.log('auth', bearerHeader)
    let token: any = '';
    if (bearerHeader != undefined) {
      token = bearerHeader.split(" ")[1];
    }
    console.log('verifying jwt', token)
    if (!token) {
      return res.status(403).send({
        auth: false, message: 'No token provided.'
      });
    }

    let key: any = process.env.KEY;

    jwt.verify(token, key, (err: any, authData: any) => {
      if (err) {
        return res.status(403).send({
          auth: false,
          message: 'Invalid Token'
        });
      }
      authData
      next();
    });

  }

}

