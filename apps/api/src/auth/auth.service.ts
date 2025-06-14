import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import type { Repository } from "typeorm";
import { User } from "@cosmo/database";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as crypto from "crypto";
// Comentamos temporalmente argon2 hasta que Docker esté configurado correctamente
// import * as argon2 from "argon2";
import * as bcryptjs from "bcryptjs";
import { ConfigService } from "@nestjs/config";
import { createHash } from "crypto";

// Definir tipo para los datos extendidos
type ExtendedUser = any;

// Valor fijo para identificar hash-sha256 legacy
const SHA256_PREFIX = "sha256$";
// Prefijo para identificar hashes bcrypt
const BCRYPT_PREFIX = "$2b$";

// Funciones de hash temporales para retrocompatibilidad
function hashPasswordSha256(password: string): string {
  const hash = createHash("sha256").update(password).digest("hex");
  return `${SHA256_PREFIX}${hash}`;
}

function comparePasswordSha256(
  password: string,
  hashedPassword: string
): boolean {
  if (!hashedPassword || !hashedPassword.startsWith(SHA256_PREFIX)) {
    return false;
  }
  const actualHash = hashedPassword.substring(SHA256_PREFIX.length);
  const hashed = createHash("sha256").update(password).digest("hex");
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
    try {
      // Normalizar el email
      const normalizedEmail = email.toLowerCase().trim();
      this.logger.log(`Intentando autenticar usuario: ${normalizedEmail}`);

      this.logger.debug(`Buscando usuario con email: ${normalizedEmail}`);
      const user = await this.usersRepository.findOne({
        where: { email: normalizedEmail },
      });
      this.logger.debug(`Usuario encontrado: ${JSON.stringify(user, null, 2)}`);

      if (!user) {
        this.logger.warn(
          `Intento de login fallido para email inexistente: ${normalizedEmail}`
        );
        // Usar un tiempo constante para evitar timing attacks
        await bcryptjs.compare(password, "$2a$12$" + "a".repeat(53));
        throw new UnauthorizedException("Email o contraseña incorrectos");
      }

      this.logger.log(`Usuario encontrado: ${normalizedEmail}, ID: ${user.id}`);
      this.logger.log(`Hash almacenado: ${user.passwordHash}`);

      // Verificar si el usuario está activo
      if (user.status !== "active") {
        this.logger.warn(
          `Intento de login para cuenta ${user.status}: ${normalizedEmail}`
        );
        throw new UnauthorizedException(
          user.status === "suspended"
            ? "Tu cuenta ha sido suspendida. Contacta con soporte."
            : "Tu cuenta no está activa."
        );
      }

      let isPasswordValid = false;
      const hashedPassword = user.passwordHash;

      // Comprobar formato del hash
      if (hashedPassword.startsWith(SHA256_PREFIX)) {
        // Formato antiguo SHA-256 con prefijo
        this.logger.log(
          `Detectado hash SHA-256 antiguo para usuario ${user.id}`
        );
        isPasswordValid = comparePasswordSha256(password, hashedPassword);

        // Actualizar al nuevo formato si la contraseña es válida
        if (isPasswordValid) {
          await this.updatePasswordHash(user.id, password);
          this.logger.log(`Hash actualizado a bcrypt para usuario ${user.id}`);
        }
      } else if (
        hashedPassword.startsWith("$2a$") ||
        hashedPassword.startsWith("$2b$") ||
        hashedPassword.startsWith("$2y$")
      ) {
        // Formato bcrypt estándar con cualquier prefijo válido
        this.logger.log(
          `Comprobando con formato bcrypt estándar (prefijo: ${hashedPassword.substring(0, 4)})`
        );
        try {
          isPasswordValid = await bcryptjs.compare(password, hashedPassword);
          this.logger.log(
            `Resultado bcrypt estándar: ${isPasswordValid ? "VÁLIDO" : "INVÁLIDO"}`
          );
        } catch (error) {
          this.logger.error(
            `Error en bcrypt.compare: ${error instanceof Error ? error.message : String(error)}`
          );
          isPasswordValid = false;
        }
      } else if (hashedPassword.startsWith(BCRYPT_PREFIX)) {
        // Formato con prefijo bcrypt: (LEGACY - Por compatibilidad)
        try {
          const actualHash = hashedPassword.substring(BCRYPT_PREFIX.length);
          this.logger.log(`Quitando prefijo bcrypt: para usuario ${user.id}`);
          this.logger.log(`Hash original: ${hashedPassword}`);
          this.logger.log(`Hash sin prefijo: ${actualHash}`);

          isPasswordValid = await bcryptjs.compare(password, actualHash);
          this.logger.log(
            `Resultado de validación: ${isPasswordValid ? "VÁLIDO" : "INVÁLIDO"}`
          );

          // Actualizar al formato estándar si la autenticación es exitosa
          if (isPasswordValid) {
            await this.usersRepository.update(user.id, {
              passwordHash: actualHash,
            });
            this.logger.log(
              `Prefijo bcrypt: eliminado para usuario ${user.id}`
            );
          }
        } catch (error) {
          this.logger.error(
            `Error al verificar hash con prefijo bcrypt:: ${error instanceof Error ? error.message : String(error)}`
          );
          isPasswordValid = false;
        }
      } else {
        // Último recurso: probar si es un hash simple SHA-256 sin prefijo
        this.logger.log(`Probando formato hash desconocido o sin prefijo`);

        // Primero intentar bcrypt en caso de que el hash sea bcrypt pero no se reconozca por el formato
        try {
          isPasswordValid = await bcryptjs.compare(password, hashedPassword);
          this.logger.log(
            `Intento directo con bcrypt: ${isPasswordValid ? "VÁLIDO" : "INVÁLIDO"}`
          );
        } catch (error) {
          this.logger.log(
            `Error al intentar comparar con bcrypt, probando SHA-256: ${error instanceof Error ? error.message : String(error)}`
          );
          isPasswordValid = false;
        }

        // Si bcrypt falla, intentar con SHA-256
        if (!isPasswordValid) {
          const simpleSha256 = createHash("sha256")
            .update(password)
            .digest("hex");
          isPasswordValid = hashedPassword === simpleSha256;
          this.logger.log(
            `Intento con SHA-256 simple: ${isPasswordValid ? "VÁLIDO" : "INVÁLIDO"}`
          );

          // Actualizar si la autenticación es exitosa
          if (isPasswordValid) {
            await this.updatePasswordHash(user.id, password);
            this.logger.log(
              `Hash SHA-256 sin prefijo actualizado a bcrypt para usuario ${user.id}`
            );
          }
        }
      }

      if (!isPasswordValid) {
        this.logger.warn(
          `Contraseña inválida para usuario: ${normalizedEmail}`
        );
        throw new UnauthorizedException("Email o contraseña incorrectos");
      }

      // Login exitoso
      this.logger.log(`Login exitoso para usuario: ${normalizedEmail}`);
      const { passwordHash, ...result } = user;
      return result;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error(
        `Error en autenticación: ${error instanceof Error ? error.message : String(error)}`
      );
      throw new UnauthorizedException("Error en la autenticación");
    }
  }

  private async updatePasswordHash(
    userId: string,
    plainPassword: string
  ): Promise<void> {
    try {
      // Generar hash bcrypt sin prefijo (estándar)
      const salt = await bcryptjs.genSalt(12);
      const hash = await bcryptjs.hash(plainPassword, salt);
      await this.usersRepository.update(userId, { passwordHash: hash });
      this.logger.log(`Hash de contraseña actualizado para usuario ${userId}`);
    } catch (error) {
      this.logger.error(
        `Error al actualizar hash: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  }

  async login(loginDto: LoginDto) {
    try {
      const user = await this.validateUser(loginDto.email, loginDto.password);

      // Crear token JWT
      const payload = {
        sub: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      };

      const expiresIn =
        this.configService.get<string>("JWT_EXPIRATION") || "7d";
      const accessToken = this.jwtService.sign(payload, { expiresIn });

      // Devolver información mínima necesaria
      const extendedUser = user as ExtendedUser;
      return {
        accessToken,
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

      // Crear hash bcrypt estándar (sin prefijo)
      let passwordHash;
      try {
        const salt = await bcryptjs.genSalt(12);
        passwordHash = await bcryptjs.hash(registerDto.password, salt);
      } catch (error) {
        this.logger.error(
          `Error al hashear contraseña: ${error instanceof Error ? error.message : String(error)}`
        );
        // En caso de error, usar SHA-256 como fallback (aún con prefijo para identificarlo)
        passwordHash = hashPasswordSha256(registerDto.password);
      }

      // Generar token de verificación
      const verificationToken = crypto.randomBytes(32).toString("hex");
      const verificationTokenExpiry = new Date();
      verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24);

      // Crear y guardar el usuario
      try {
        // Procesar arrays correctamente
        const sustainabilityGoals = Array.isArray(
          registerDto.sustainabilityGoals
        )
          ? registerDto.sustainabilityGoals
          : [];

        const certifications = Array.isArray(registerDto.certifications)
          ? registerDto.certifications
          : [];

        // Crear usuario
        const user = new User();
        const userWithAllFields = user as User & Record<string, any>;

        // Propiedades básicas
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

        // Campos de la taxonomía EU
        if (Array.isArray(registerDto.euTaxonomySectorIds)) {
          userWithAllFields.euTaxonomySectorIds =
            registerDto.euTaxonomySectorIds;
        }

        if (Array.isArray(registerDto.euTaxonomySectorNames)) {
          userWithAllFields.euTaxonomySectorNames =
            registerDto.euTaxonomySectorNames;
        }

        if (
          Array.isArray(registerDto.euTaxonomyActivities) &&
          registerDto.euTaxonomyActivities.length > 0
        ) {
          // Asegurarse de no exceder el límite de 3 actividades
          const limitedActivities = registerDto.euTaxonomyActivities.slice(
            0,
            3
          );

          // Asegurarnos de que cada actividad tiene la información completa (incluyendo naceCodes)
          const processedActivities = limitedActivities.map((activity) => ({
            id: activity.id,
            name: activity.name,
            sectorId: activity.sectorId,
            sectorName:
              activity.sectorName ||
              registerDto.euTaxonomySectorNames?.find(
                (name, index) =>
                  registerDto.euTaxonomySectorIds?.[index] === activity.sectorId
              ) ||
              "",
            naceCodes: Array.isArray(activity.naceCodes)
              ? activity.naceCodes
              : [],
          }));

          userWithAllFields.euTaxonomyActivities = processedActivities;

          this.logger.debug(
            `Guardando ${processedActivities.length} actividades económicas para el usuario ${registerDto.email}`
          );
        }

        // Campos de sostenibilidad
        if (registerDto.sustainabilityLevel) {
          userWithAllFields.sustainabilityLevel =
            registerDto.sustainabilityLevel;
        }

        // Asignar arrays procesados
        userWithAllFields.sustainabilityGoals = sustainabilityGoals;
        userWithAllFields.certifications = certifications;

        if (registerDto.sustainabilityBudgetRange) {
          userWithAllFields.sustainabilityBudgetRange =
            registerDto.sustainabilityBudgetRange;
        }

        if (registerDto.sustainabilityNotes) {
          userWithAllFields.sustainabilityNotes =
            registerDto.sustainabilityNotes;
        }

        // Guardar usuario
        const savedUser = await this.usersRepository.save(userWithAllFields);

        // Loguear el hash guardado para depuración
        this.logger.log(
          `Usuario registrado con éxito. Email: ${savedUser.email}, ID: ${savedUser.id}`
        );
        this.logger.log(`Hash de contraseña guardado: ${passwordHash}`);

        // Enviar email de verificación
        this.sendVerificationEmail(savedUser.email, verificationToken);

        // Devolver el usuario creado (sin la contraseña)
        const { passwordHash: _, ...result } = savedUser;
        return result;
      } catch (typeormError) {
        if (
          typeormError instanceof Error &&
          typeormError.message.includes("metadata")
        ) {
          throw new BadRequestException(
            `Error en la entidad User. Detalles: ${typeormError.message}`
          );
        }
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
