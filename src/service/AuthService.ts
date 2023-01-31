import { BaseService } from "./BaseService";
import { exec } from "child_process";
import { DI } from '../di/DIContainer';
import jwt from 'jsonwebtoken';
import { Logger } from "../logger/Logger";
import { NextFunction } from "connect";
import { Router, Request, Response } from "express";
import { resolve } from "bluebird";

export class AuthService implements BaseService {

  constructor() {
  }

  async generateJWTToken(user: any): Promise<any> {
    console.log(`GENRATING TOKEN`);
    let key: any = process.env.KEY;

    let token: any = jwt.sign(user, key, {
      expiresIn: '365d'
    });
    console.log(`Token is ${token}`);
    return token;

    resolve(new Promise(async (resolve, reject) => {
      let key: any = process.env.KEY;

      let token: any = jwt.sign(user, key, {
        expiresIn: 86400
      });

      resolve({ user: user, accessToken: token });
    }))
  }

  static async verifyToken(req: Request, res: Response, next: NextFunction) {

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
