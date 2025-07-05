import { prisma } from "../prisma";
import { DonationEntity } from "./entity/donation.entity";

export default class DonationsService {
  static async findAll(): Promise<DonationEntity[]> {
    const donations = await prisma.donation.findMany({});
    return donations.map((donation) => new DonationEntity(
      donation.id, donation.name, donation.createdAt, donation.updatedAt, donation.description, donation.email, donation.phone
    ));
  }
}