import ArticleTypesService from "../article-types/article-types.service";
import { prisma } from "../prisma";
import { CreateDonationDto } from "./dto/create-donation.dto";
import { DonationDto } from "./dto/donation.dto";
import { UpdateDonationDto } from "./dto/update-donation.entity";
import { donationInclude } from "./entity/donation.entity";

export default class DonationsService {

  /**
   * This function is used to retrieve all the donations of the database
   *
   * @returns All the donation entity of the database
   */
  static async findAll(): Promise<DonationDto[]> {
    const donations = await prisma.donation.findMany({
      include: donationInclude
    });
    return donations.map((donation) => DonationDto.parse(
      donation
    ));
  }

  /**
   * This function is used to create a donation in the database
   *
   * @param data The entity to create the donation
   * @returns The created donation
   */
  static async create(data: CreateDonationDto): Promise<DonationDto> {
    const donation = await prisma.donation.create({
      data: {
        description: data.description,
        articles: {
          create: data.articles.map((article) => {
            return {
              type: {
                connect: { id: article.type_id },
              },
              quantity: article.quantity
            }
          })
        }
      },
      include: donationInclude
    });
    return DonationDto.parse(donation);
  }

  /**
 * This function is used to update a donation in the database
 * 
 * @param createDonation The entity to update the donation, the id to update
 * the donation is included in the object
 * @returns The updated donation
 */
  static async update(data: UpdateDonationDto): Promise<DonationDto> {

    const donation = await prisma.donation.update({
      where: { id: data.id },
      data: {
        description: data.description,
        articles: {
          deleteMany: {},
          create: data.articles.map((article) => {
            return {
              type: {
                connect: { id: article.type_id },
              },
              quantity: article.quantity
            }
          })
        }
      },
      include: donationInclude
    });
    return DonationDto.parse(donation);
  }

  /**
   * This function is used to delete a donation in the database
   * 
   * @param id The donation id to be deleted
   * @returns The deleted donation  
   */
  static async delete(id: string): Promise<DonationDto> {
    const donation = await prisma.donation.delete({
      where: { id: id },
      include: donationInclude
    });
    return DonationDto.parse(donation);
  }
}