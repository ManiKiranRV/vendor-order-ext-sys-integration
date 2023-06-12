
import { ExpCommercialInvoiceData } from "../entity/ExpCommercialInvoiceData";
import { BaseRepository } from "./BaseRepository";

export class ExpCommercialInvoiceDataRepository extends BaseRepository{
    getModel():any{
        return ExpCommercialInvoiceData;
    }
   
}