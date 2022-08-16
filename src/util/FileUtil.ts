import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs'
import { Logger } from '../logger/Logger';
import { DI } from '../di/DIContainer';

export class FileUtil {
    private logger: Logger
    constructor() {
        this.logger = DI.get(Logger)
    }

    writeToFile(filePath: any, data: string) {
        try {
            fs.writeFile(filePath, data, { flag: 'w' }, e => {
                if (e) console.error(e)
                this.logger.log('Data written to File')
            })
        }
        catch (err) {
            this.logger.log(err);
        }
    }
}
