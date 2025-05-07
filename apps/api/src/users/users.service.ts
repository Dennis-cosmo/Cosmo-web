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

  // Aquí añadiríamos más métodos como:
  // - update para actualizar el perfil
  // - findAll para admin
  // - remove para eliminar usuarios
}
