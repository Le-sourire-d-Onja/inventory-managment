import { prisma } from "../prisma";
import { CreateDonationEntity } from "./entity/create-donation.entity";
import { DonationEntity } from "./entity/donation.entity";
import { UpdateDonationEntity } from "./entity/update-donation.entity";

export default class DonationsService {

  /**
   * This function is used to retrieve all the donations of the database
   * 
   * @returns All the donation entity of the database
   */
  static async findAll(): Promise<DonationEntity[]> {
    const donations = await prisma.donation.findMany({
      include: {
        articles: true
      }
    });
    return donations.map((donation) => DonationEntity.parse(
      donation
    ));
  }

  /**
   * This function is used to create a donation in the database
   * 
   * @param createDonation The entity to create the donation
   * @returns The created donation
   */
  static async create(createDonation: CreateDonationEntity): Promise<DonationEntity> {
    const { articles, ...data } = createDonation;
    const donation = await prisma.donation.create({
      data: {
        ...data,
        articles: {
          createMany: {
            data: articles
          }
        }
      },
      include: {
        articles: true,
      }
    });
    return DonationEntity.parse(donation);
  }

  /**
 * This function is used to update a donation in the database
 * 
 * @param createDonation The entity to update the donation, the id to update
 * the donation is included in the object
 * @returns The updated donation
 */
  static async update(updateDonation: UpdateDonationEntity): Promise<DonationEntity> {
    const { articles, articlesIDToRemove, ...data } = updateDonation;
    const donation = await prisma.donation.update({
      where: { id: updateDonation.id },
      data: {
        ...data,
        articles: {
          deleteMany: articlesIDToRemove.map((articleIDToRemove) => ({ id: articleIDToRemove })),
          createMany: {
            data: articles.filter((article) => !("id" in article))
          },
          updateMany: articles.filter((article) => "id" in article).map((article) => ({
            where: { id: article.id },
            data: article
          })),
        }
      },
      include: {
        articles: true,
      }
    });
    return DonationEntity.parse(donation);
  }
}