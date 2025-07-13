import ArticleTypesService from "../article-types/article-types.service";
import { prisma } from "../../../lib/prisma";
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
        articles: {
          include: {
            type: true,
          }
        },
      }
    });
    return donations.map((donation) => DonationEntity.parse(
      donation
    ));
  }

  /**
   * This function is used to create a donation in the database
   * 
   * @param data The entity to create the donation
   * @returns The created donation
   */
  static async create(data: CreateDonationEntity): Promise<DonationEntity> {
    const articleTypes = await ArticleTypesService.findAll();

    const donation = await prisma.donation.create({
      data: {
        name: data.name,
        description: data.description,
        email: data.email,
        phone: data.phone,
        articles: {
          create: data.articles.map((article) => {
            const articleType = articleTypes.find((articleType) => articleType.id === article.typeID);
            const price = articleType?.price ?? 0;
            return {
              type: {
                connect: { id: article.typeID },
              },
              price: price * article.quantity,
              quantity: article.quantity
            }
          })
        }
      },
      include: {
        articles: {
          include: {
            type: true,
          }
        },
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
  static async update(data: UpdateDonationEntity): Promise<DonationEntity> {
    const articleTypes = await ArticleTypesService.findAll();

    const donation = await prisma.donation.update({
      where: { id: data.id },
      data: {
        name: data.name,
        description: data.description,
        email: data.email,
        phone: data.phone,
        articles: {
          deleteMany: {},
          create: data.articles.map((article) => {
            const articleType = articleTypes.find((articleType) => articleType.id === article.typeID);
            const price = articleType?.price ?? 0;
            return {
              type: {
                connect: { id: article.typeID },
              },
              price: price * article.quantity,
              quantity: article.quantity
            }
          })
        }
      },
      include: {
        articles: {
          include: {
            type: true,
          }
        },
      }
    });
    return DonationEntity.parse(donation);
  }

  /**
   * This function is used to delete a donation in the database
   * 
   * @param id The donation id to be deleted
   * @returns The deleted donation  
   */
  static async delete(id: string): Promise<DonationEntity> {
    const donation = await prisma.donation.delete({
      where: { id: id },
      include: {
        articles: {
          include: {
            type: true,
          }
        },
      }
    });
    return DonationEntity.parse(donation);
  }
}