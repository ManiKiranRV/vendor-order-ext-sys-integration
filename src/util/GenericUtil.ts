import moment from 'moment';
import { Logger } from '../logger/Logger';
import { DI } from '../di/DIContainer';

export class GenericUtil {

    private logger: Logger;
    constructor() {
        this.logger = DI.get(Logger);
    }

    getFormattedDate(date: Date, format: string): string {
        return moment(date).format(format);
    }

    getDefaultFormattedDate(date: Date): string {
        return this.getFormattedDate(date, 'YYYY-MM-DD');
    }

    getDefaultLongFormattedDate(date: Date): string {
        return this.getFormattedDate(date, 'YYYY-MM-DD HH:mm:ss');
    }

    getLocalDateFromDefaultFormat(dateStr: string): Date {
        return this.getLocalDateFromString(dateStr, 'YYYY-MM-DD');
    }

    getLocalDateFromString(dateStr: string, format: string): Date {
        const date = moment(dateStr, format).toDate();
        return this.getLocalDate(date);
    }

    getLocalDate(date: Date): Date {
        return new Date(date.getTime() - (date.getTimezoneOffset() * 60000));
    }

    jsonToQueryString(json: any) {
        return '?' + 
            Object.keys(json).map(function(key) {
                return encodeURIComponent(key) + '=' +
                    encodeURIComponent(json[key]);
            }).join('&');
    }
}
