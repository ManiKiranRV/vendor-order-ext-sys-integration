import { BaseResponse, ResponseStatus } from "./BaseResponse";

export class CreatedResponse extends BaseResponse {
    createId!: string;

    constructor(status: ResponseStatus, createdId: string) {
        super(status);
        this.createId = createdId;
    }
    
}

export class FetchResponse extends BaseResponse {
    messageResult: any;
    // totalRowsCount: number;
    // filteredRowsCount: number;
    // graphResult:any;

    constructor(status: ResponseStatus, messageResult: string) {
        super(status);
        this.messageResult = messageResult;
    //     this.totalRowsCount = totalRowsCount;
    //     this.filteredRowsCount = filteredRowsCount;
	// this.graphResult = graphResult;
    }
}

