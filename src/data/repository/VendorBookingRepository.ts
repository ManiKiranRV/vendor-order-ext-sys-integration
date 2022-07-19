import { VendorBooking } from "../entity/init-models";
import { BaseRepository } from "./BaseRepository";

export class VendorBookingRepository extends BaseRepository {
   
    getModel():any{
        return VendorBooking;
    }
   
}