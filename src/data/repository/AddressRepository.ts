import { Address } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class AddressRepository extends BaseRepository {
   
    getModel():any{
        return Address;
    }
   
}