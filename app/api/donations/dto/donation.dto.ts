import { DonationEntity } from "../entity/donation.entity";

export class DonationDto extends DonationEntity {

  static parse(obj: any): DonationDto {
    return new DonationDto(obj.id, obj.name, new Date(obj.createdAt), new Date(obj.updatedAt), obj.description, obj.email, obj.phone);
  }
}