import { AdditionalCharges } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class AdditionalChargesRepository extends BaseRepository {
   
    getModel():any{
        return AdditionalCharges;
    }
   
}