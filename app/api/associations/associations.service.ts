import { prisma } from "../prisma";
import { CreateAssociationDto } from "./dto/create-association.dto";
import { AssociationDto } from "./dto/association.dto";
import { AssociationExportDto } from "./dto/association-export.dto";
import { UpdateAssociationDto } from "./dto/update-association.dto";
import { associationExportInclude } from "./entity/association.entity";

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
   * This function is used to retrieve one association with everything needed
   * for its workbook export: its demands and their currently attached
   * containers and contents.
   *
   * @param id The id of the association
   * @returns The export entity, or null if the association doesn't exist
   */
  static async findForExport(id: string): Promise<AssociationExportDto | null> {
    const association = await prisma.association.findUnique({
      where: { id },
      include: associationExportInclude,
    });
    return association ? AssociationExportDto.parse(association) : null;
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