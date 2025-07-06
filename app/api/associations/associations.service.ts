import { prisma } from "../prisma";
import { CreateAssociationEntity, createAssociationSchema } from "./entity/create-association.entity";
import { AssociationEntity } from "./entity/association.entity";
import { UpdateAssociationEntity, updateAssociationSchema } from "./entity/update-association.entity";

export default class AssociationsService {

  /**
   * This function is used to retrieve all the associations of the database
   * 
   * @returns All the association entity of the database
   */
  static async findAll(): Promise<AssociationEntity[]> {
    const associations = await prisma.association.findMany({});
    return associations.map((association) => AssociationEntity.parse(
      association
    ));
  }

  /**
   * This function is used to create a association in the database
   * 
   * @param createAssociation The entity to create the association
   * @returns The created association
   */
  static async create(createAssociation: CreateAssociationEntity): Promise<AssociationEntity> {
    const association = await prisma.association.create({
      data: createAssociation,
    });
    return AssociationEntity.parse(association);
  }

  /**
 * This function is used to update a association in the database
 * 
 * @param createAssociation The entity to update the association, the id to update
 * the association is included in the object
 * @returns The updated association
 */
  static async update(updateAssociation: UpdateAssociationEntity): Promise<AssociationEntity> {
    const association = await prisma.association.update({
      where: { id: updateAssociation.id },
      data: updateAssociation,
    });
    return AssociationEntity.parse(association);
  }

  static async delete(id: string): Promise<AssociationEntity> {
    const association = await prisma.association.delete({
      where: { id: id },
    });
    return AssociationEntity.parse(association);
  }
}