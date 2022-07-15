export class BaseResponse {
    status: ResponseStatus = new ResponseStatus(ResponseCode.WARNING, 'Response Status Not Changed');

    constructor(status?: ResponseStatus) {
        this.status = status !== undefined && status !== null ? status : this.status;
    }
}

export class ResponseStatus {
    code: ResponseCode;
    message: string;

    constructor(code: ResponseCode, message: string) {
        this.code = code;
        this.message = message;
    }
}

export enum ResponseCode {
    SUCCESS = 'SUCCESS', WARNING = 'WARNING', FAILURE = 'FAILURE'
}