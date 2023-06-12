import { InvoiceDetails } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class InvoiceDetailsRepository extends BaseRepository {
   
    getModel():any{
        return InvoiceDetails;
    }
   
}