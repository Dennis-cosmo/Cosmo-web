import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@cosmo/database";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as crypto from "crypto";
// Comentamos temporalmente argon2 hasta que Docker esté configurado correctamente
// import * as argon2 from "argon2";
import * as bcryptjs from "bcryptjs";
import { ConfigService } from "@nestjs/config";

// Definir tipo para los datos extendidos
type ExtendedUser = any;

// Valor fijo para identificar hash-sha256 legacy
const SHA256_PREFIX = "sha256:";
// Prefijo para identificar hashes bcrypt
const BCRYPT_PREFIX = "bcrypt:";

// Funciones de hash temporales para retrocompatibilidad
function hashPasswordSha256(password: string): string {
  return (
    SHA256_PREFIX + crypto.createHash("sha256").update(password).digest("hex")
  );
}

function comparePasswordSha256(
  password: string,
  hashedPassword: string
): boolean {
  if (!hashedPassword.startsWith(SHA256_PREFIX)) {
    return false;
  }
  const actualHash = hashedPassword.substring(SHA256_PREFIX.length);
  const hashed = crypto.createHash("sha256").update(password).digest("hex");
  return hashed === actualHash;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException("Email o contraseña incorrectos");
    }

    let isPasswordValid = false;
    const hashedPassword = user.passwordHash;

    try {
      // Primero verificar si es un hash SHA-256 antiguo
      if (hashedPassword.startsWith(SHA256_PREFIX)) {
        this.logger.log(
          `Detectado hash SHA-256 antiguo para el usuario ${user.id}`
        );
        isPasswordValid = comparePasswordSha256(password, hashedPassword);

        // Si la contraseña es válida, actualizar al nuevo formato
        if (isPasswordValid) {
          try {
            // Actualizar silenciosamente al nuevo formato
            await this.updatePasswordHash(user.id, password);
            this.logger.log(
              `Hash de contraseña actualizado para usuario ${user.id}`
            );
          } catch (error) {
            this.logger.error(
              `Error al actualizar hash: ${error instanceof Error ? error.message : String(error)}`
            );
            // No interrumpimos el flujo de login, solo registramos el error
          }
        }
      } else if (hashedPassword.startsWith(BCRYPT_PREFIX)) {
        // Verificar con bcryptjs
        const actualHash = hashedPassword.substring(BCRYPT_PREFIX.length);
        isPasswordValid = await bcryptjs.compare(password, actualHash);
      } else {
        // Asumimos que es un hash simple (temporal)
        try {
          // Intentar con hash simple como respaldo
          const simpleSha256 = crypto
            .createHash("sha256")
            .update(password)
            .digest("hex");
          isPasswordValid = hashedPassword === simpleSha256;

          // Si esta verificación es exitosa, actualizar al formato seguro
          if (isPasswordValid) {
            await this.updatePasswordHash(user.id, password);
          }
        } catch (error) {
          this.logger.error(
            `Error al verificar contraseña: ${error instanceof Error ? error.message : String(error)}`
          );
          isPasswordValid = false;
        }
      }

      if (!isPasswordValid) {
        throw new UnauthorizedException("Email o contraseña incorrectos");
      }

      // No enviamos el passwordHash en la respuesta
      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Error inesperado en autenticación: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new UnauthorizedException("Error en la autenticación");
    }
  }

  // Método para actualizar el hash de la contraseña al nuevo formato
  private async updatePasswordHash(
    userId: string,
    plainPassword: string
  ): Promise<void> {
    try {
      const newHash = await this.hashPassword(plainPassword);
      await this.usersRepository.update(userId, { passwordHash: newHash });
      this.logger.log(`Hash de contraseña actualizado para usuario ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error al actualizar hash de contraseña: ${error instanceof Error ? error.message : String(error)}`
      );
      // No lanzamos error para no interrumpir el flujo de login
    }
  }

  // Método seguro para crear hash
  private async hashPassword(password: string): Promise<string> {
    try {
      // Usar bcryptjs (más compatible)
      const salt = await bcryptjs.genSalt(12); // 12 rondas es un buen balance entre seguridad y rendimiento
      const hash = await bcryptjs.hash(password, salt);
      return BCRYPT_PREFIX + hash;
    } catch (bcryptError) {
      this.logger.error(
        `Error al hashear contraseña con bcryptjs: ${bcryptError instanceof Error ? bcryptError.message : String(bcryptError)}`
      );
      // Fallback a SHA-256 como último recurso, pero con prefijo para identificarlo
      return hashPasswordSha256(password);
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);

      const payload = {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      // Tratar al usuario como un objeto genérico para evitar problemas de tipo
      const extendedUser = user as ExtendedUser;

      return {
        accessToken: this.jwtService.sign(payload),
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin,
          onboardingCompleted: extendedUser.onboardingCompleted || false,
          companyName: user.companyName,
        },
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Error en login: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new UnauthorizedException("Error en el inicio de sesión");
    }
  }

  async register(registerDto: RegisterDto) {
    try {
      // Verificamos si el usuario ya existe
      const existingUser = await this.usersRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException("Este email ya está registrado");
      }

      // Verificamos la aceptación de términos
      if (registerDto.acceptTerms === false) {
        throw new BadRequestException(
          "Debes aceptar los términos y condiciones para registrarte"
        );
      }

      // Creamos el hash seguro de la contraseña
      let passwordHash;
      try {
        passwordHash = await this.hashPassword(registerDto.password);
      } catch (error) {
        this.logger.error(
          `Error al hashear contraseña: ${error instanceof Error ? error.message : String(error)}`
        );
        // En caso de error, usar SHA-256 como fallback
        passwordHash = hashPasswordSha256(registerDto.password);
      }

      // Generamos un token de verificación
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = new Date();
      verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 horas de validez

      try {
        // Crear un usuario básico como objeto y asignar propiedades
        // Usamos Record<string, any> para evitar errores de tipado estricto
        const user = new User();
        const userWithAllFields = user as User & Record<string, any>;

        // Asignar propiedades básicas
        userWithAllFields.email = registerDto.email;
        userWithAllFields.passwordHash = passwordHash;
        userWithAllFields.firstName = registerDto.firstName;
        userWithAllFields.lastName = registerDto.lastName;
        userWithAllFields.companyName = registerDto.companyName || "";
        userWithAllFields.isAdmin = false;
        userWithAllFields.status = "active";
        userWithAllFields.emailVerified = false;
        userWithAllFields.verificationToken = verificationToken;
        userWithAllFields.verificationTokenExpiry = verificationTokenExpiry;
        userWithAllFields.onboardingCompleted = false;

        // Asignar campos adicionales si están presentes
        if (registerDto.companyLegalName)
          userWithAllFields.companyLegalName = registerDto.companyLegalName;
        if (registerDto.taxId) userWithAllFields.taxId = registerDto.taxId;
        if (registerDto.companySize)
          userWithAllFields.companySize = registerDto.companySize;
        if (registerDto.industry)
          userWithAllFields.industry = registerDto.industry;
        if (registerDto.website)
          userWithAllFields.website = registerDto.website;
        if (registerDto.country)
          userWithAllFields.country = registerDto.country;
        if (registerDto.address)
          userWithAllFields.address = registerDto.address;
        if (registerDto.sustainabilityLevel)
          userWithAllFields.sustainabilityLevel =
            registerDto.sustainabilityLevel;
        if (registerDto.sustainabilityGoals)
          userWithAllFields.sustainabilityGoals =
            registerDto.sustainabilityGoals;
        if (registerDto.certifications)
          userWithAllFields.certifications = registerDto.certifications;
        if (registerDto.sustainabilityBudgetRange)
          userWithAllFields.sustainabilityBudgetRange =
            registerDto.sustainabilityBudgetRange;
        if (registerDto.sustainabilityNotes)
          userWithAllFields.sustainabilityNotes =
            registerDto.sustainabilityNotes;

        // Guardar usuario completo de una sola vez
        const savedUser = await this.usersRepository.save(userWithAllFields);

        // Aquí enviaríamos el email de verificación
        this.sendVerificationEmail(savedUser.email, verificationToken);

        // Retornamos el usuario creado (sin la contraseña)
        const { passwordHash: _, ...result } = savedUser;
        return result;
      } catch (typeormError) {
        // Capturar errores específicos de TypeORM
        this.logger.error(
          `Error específico de TypeORM: ${typeormError instanceof Error ? typeormError.message : String(typeormError)}`
        );

        // Si el error contiene "metadata", probablemente sea un problema con la entidad
        if (
          typeormError instanceof Error &&
          typeormError.message.includes("metadata")
        ) {
          throw new BadRequestException(
            `Error en la entidad User. Detalles: ${typeormError.message}`
          );
        }

        // Re-lanzar el error original
        throw typeormError;
      }
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      this.logger.error(
        `Error al crear usuario: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException(
        `Error al crear el usuario: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  }

  // Método para verificar el email del usuario
  async verifyEmail(token: string) {
    try {
      // Usar SQL directo para evitar problemas de tipo
      const [user] = await this.usersRepository.query(
        `SELECT * FROM users WHERE "verificationToken" = $1 LIMIT 1`,
        [token]
      );

      if (!user) {
        throw new BadRequestException("Token de verificación inválido");
      }

      // Verificar si ya está verificado
      if (user.emailVerified) {
        throw new BadRequestException("El email ya ha sido verificado");
      }

      // Verificamos que el token no haya expirado
      const now = new Date();
      if (
        user.verificationTokenExpiry &&
        new Date(user.verificationTokenExpiry) < now
      ) {
        throw new BadRequestException("El token de verificación ha expirado");
      }

      // Actualizar directamente con SQL para evitar problemas de tipo
      await this.usersRepository.query(
        `UPDATE users SET "emailVerified" = true, "verificationToken" = NULL, "verificationTokenExpiry" = NULL WHERE id = $1`,
        [user.id]
      );

      return { success: true, message: "Email verificado correctamente" };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      this.logger.error(
        `Error al verificar email: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Error al verificar email");
    }
  }

  // Método para completar el onboarding
  async completeOnboarding(userId: string, onboardingData: any) {
    try {
      const user = await this.usersRepository.findOne({
        where: { id: userId },
      });

      if (!user) {
        throw new BadRequestException("Usuario no encontrado");
      }

      // Construir la consulta SQL dinámica
      let query = `UPDATE users SET "onboardingCompleted" = true`;
      const values = [userId];
      let paramIndex = 2;

      // Añadir cada campo en onboardingData a la consulta
      Object.entries(onboardingData).forEach(([key, value]) => {
        query += `, "${key}" = $${paramIndex}`;
        values.push(value === undefined ? null : String(value));
        paramIndex++;
      });

      // Completar la consulta con la condición WHERE
      query += ` WHERE id = $1`;

      // Ejecutar la consulta
      await this.usersRepository.query(query, values);

      return { success: true, message: "Onboarding completado correctamente" };
    } catch (error) {
      this.logger.error(
        `Error al completar onboarding: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new BadRequestException("Error al completar onboarding");
    }
  }

  // Este método enviaría el email de verificación (implementación básica)
  private async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.configService.get("FRONTEND_URL")}/auth/verify-email?token=${token}`;

    this.logger.log(`
      ==========================================
      Email de verificación
      ------------------------------------------
      Para: ${email}
      Enlace: ${verificationUrl}
      ==========================================
    `);

    // Aquí se implementaría el envío real de emails
    // utilizando servicios como SendGrid, Mailgun, etc.
  }
}
