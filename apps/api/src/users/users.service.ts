import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@cosmo/database";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async findOneById(id: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`Usuario con ID ${id} no encontrado`);
    }

    // Crear un nuevo objeto sin el passwordHash para evitar exponerlo
    const result = { ...user };
    delete result.passwordHash;

    return result;
  }

  async getUserProfile(id: string): Promise<any> {
    const user = await this.findOneById(id);

    // Procesar las actividades económicas para el dashboard
    const taxonomyActivities =
      user.euTaxonomyActivities?.map((activity) => {
        return {
          name:
            activity.name +
            (activity.naceCodes?.length
              ? `: ${activity.naceCodes.join(", ")}`
              : ""),
          sectorName: activity.sectorName || "",
          naceCodes: activity.naceCodes || [],
          sectorId: activity.sectorId,
          id: activity.id,
          // Datos simulados para mantener la estructura existente del dashboard
          opEx: "$0",
          capEx: "$0",
          turnover: "$0",
          criteria: [
            {
              label: "Taxonomía EU",
              color: "bg-eco-green/20 border-eco-green text-eco-green",
            },
          ],
          minimumSafeguards: ["OECD"],
          article: "SFDR: Article 8",
        };
      }) || [];

    return {
      ...user,
      taxonomyActivities,
    };
  }

  // Aquí añadiríamos más métodos como:
  // - update para actualizar el perfil
  // - findAll para admin
  // - remove para eliminar usuarios
}
