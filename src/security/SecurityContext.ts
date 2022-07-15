import { DI } from "../di/DIContainer";
// import { RequestEnvironment } from "../config/RequestEnvironment";
import { Logger } from "../logger/Logger";
// import { MemoryStore } from "express-session";
import Keycloak = require("keycloak-connect");

// const memoryStore = DI.get<MemoryStore>(MemoryStore);
// const keycloak: Keycloak = DI.get(Keycloak, { store: memoryStore });

export class SecurityContext {

    constructor(private logger: Logger) {
        this.logger = DI.get<Logger>(Logger);
        
    }

    session(): Session | undefined {
        // const REQ_ENV = RequestEnvironment.get();
        // let sessionData: any = {}
        // if (REQ_ENV.REQUEST !== undefined && REQ_ENV.REQUEST !== null) {
        //     sessionData = (<any>REQ_ENV.REQUEST)['kauth'];
        //     // this.logger.log('Session Data', sessionData['grant']);//name email azp
        //     const name = sessionData['grant']['access_token']['content']['name'];
        //     const email = sessionData['grant']['access_token']['content']['email'];
        //     const org = sessionData['grant']['access_token']['content']['azp'];
        //     this.logger.log('Session', email, name, org, org);
        //     return new Session(email, name, org, org, []);
        // } else {
        //     this.logger.log('Session data not retrieved');
        //     return undefined;
        // }
        // return new Session('865', 'Paul', 'DEALER_01', 'PRESTIGE AUTOMOBILES CO.', ['BUYER']);
        return undefined;
    }

}

export class Session {
    private userId: string;
    private userName: string;
    private organizationId: string;
    private organizationName: string;
    private roles: string[];

    constructor(userId: string, userName: string, organizationId: string, organizationName: string, roles: string[]) {
        this.userId = userId;
        this.userName = userName;
        this.organizationId = organizationId;
        this.organizationName = organizationName;
        this.roles = roles;
    }
}
