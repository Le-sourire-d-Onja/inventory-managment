import { prisma } from "../prisma";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { AssociationDto } from "./dto/association.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";

export default class AssociationsService {

  /**
   * This function is used to retrieve all the associations of the database
   *
   * @returns All the association entity of the database
   */
  static async findAll(): Promise<AssociationDto[]> {
    const associations = await prisma.association.findMany({});
    return associations.map((association) => AssociationDto.parse(
      association
    ));
  }

  /**
   * This function is used to create a association in the database
   *
   * @param createAssociation The entity to create the association
   * @returns The created association
   */
  static async create(createAssociation: CreateAssociationDto): Promise<AssociationDto> {
    const association = await prisma.association.create({
      data: createAssociation,
    });
    return AssociationDto.parse(association);
  }

  /**
 * This function is used to update a association in the database
 * 
 * @param createAssociation The entity to update the association, the id to update
 * the association is included in the object
 * @returns The updated association
 */
  static async update(updateAssociation: UpdateAssociationDto): Promise<AssociationDto> {
    const association = await prisma.association.update({
      where: { id: updateAssociation.id },
      data: updateAssociation,
    });
    return AssociationDto.parse(association);
  }

  static async delete(id: string): Promise<AssociationDto> {
    const association = await prisma.association.delete({
      where: { id: id },
    });
    return AssociationDto.parse(association);
  }
}