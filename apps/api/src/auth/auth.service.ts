import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "@cosmo/database";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as crypto from "crypto";
import { ConfigService } from "@nestjs/config";

// Definir tipo para los datos extendidos
type ExtendedUser = any;

// Funciones de hash alternativas usando crypto en lugar de bcrypt
function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function comparePassword(password: string, hashedPassword: string): boolean {
  const hashed = crypto.createHash("sha256").update(password).digest("hex");
  return hashed === hashedPassword;
}

@Injectable()
export class AuthService {
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

    const isPasswordValid = comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException("Email o contraseña incorrectos");
    }

    // No enviamos el passwordHash en la respuesta
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto) {
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
  }

  async register(registerDto: RegisterDto) {
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

    // Creamos el hash de la contraseña
    const passwordHash = hashPassword(registerDto.password);

    // Generamos un token de verificación
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date();
    verificationTokenExpiry.setHours(verificationTokenExpiry.getHours() + 24); // 24 horas de validez

    try {
      // Crear un usuario básico primero con los campos esenciales
      const user = new User();
      user.email = registerDto.email;
      user.passwordHash = passwordHash;
      user.firstName = registerDto.firstName;
      user.lastName = registerDto.lastName;
      user.companyName = registerDto.companyName || "";
      user.isAdmin = false;
      user.status = "active";

      // Guardar usuario básico
      const savedUser = await this.usersRepository.save(user);

      // Guardar los campos adicionales a través de SQL directo para evitar problemas de tipado
      const query = `
        UPDATE users 
        SET 
          "emailVerified" = $1,
          "verificationToken" = $2,
          "verificationTokenExpiry" = $3,
          "onboardingCompleted" = $4,
          "companyLegalName" = $5,
          "taxId" = $6,
          "companySize" = $7,
          "industry" = $8,
          "website" = $9,
          "country" = $10,
          "address" = $11,
          "sustainabilityLevel" = $12,
          "sustainabilityGoals" = $13,
          "certifications" = $14,
          "sustainabilityBudgetRange" = $15,
          "sustainabilityNotes" = $16
        WHERE id = $17
      `;

      // Preparar los valores para la actualización
      const values = [
        false, // emailVerified
        verificationToken,
        verificationTokenExpiry,
        false, // onboardingCompleted
        registerDto.companyLegalName || null,
        registerDto.taxId || null,
        registerDto.companySize || null,
        registerDto.industry || null,
        registerDto.website || null,
        registerDto.country || null,
        registerDto.address || null,
        registerDto.sustainabilityLevel || "beginner",
        registerDto.sustainabilityGoals || null,
        registerDto.certifications || null,
        registerDto.sustainabilityBudgetRange || null,
        registerDto.sustainabilityNotes || null,
        savedUser.id,
      ];

      // Ejecutar la consulta SQL directamente
      await this.usersRepository.query(query, values);

      // Recuperar el usuario actualizado
      const finalUser = await this.usersRepository.findOne({
        where: { id: savedUser.id },
      });

      if (!finalUser) {
        throw new Error(
          "No se pudo recuperar el usuario después de actualizar"
        );
      }

      // Aquí enviaríamos el email de verificación
      this.sendVerificationEmail(finalUser.email, verificationToken);

      // Retornamos el usuario creado (sin la contraseña)
      const { passwordHash: _, ...result } = finalUser;
      return result;
    } catch (error) {
      console.error("Error al crear usuario:", error);
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
      console.error("Error al verificar email:", error);
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
      console.error("Error al completar onboarding:", error);
      throw new BadRequestException("Error al completar onboarding");
    }
  }

  // Este método enviaría el email de verificación (implementación básica)
  private async sendVerificationEmail(email: string, token: string) {
    const verificationUrl = `${this.configService.get("FRONTEND_URL")}/auth/verify-email?token=${token}`;

    console.log(`
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
