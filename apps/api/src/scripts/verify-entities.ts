import "reflect-metadata";
import { getMetadataArgsStorage } from "typeorm";
import { User, Expense, Report } from "@cosmo/database";

// Verificar metadatos
console.log("Verificando metadatos de entidades:");

// Obtener el almacén de metadatos
const metadataArgsStorage = getMetadataArgsStorage();

// Verificar entidades
const entities = metadataArgsStorage.tables;

console.log("Entidades encontradas:", entities.length);
entities.forEach((entity) => {
  const targetName =
    typeof entity.target === "function"
      ? entity.target.name
      : String(entity.target);
  console.log("Entidad:", entity.name, "Clase:", targetName);
});

// Verificar específicamente User
const userEntity = entities.find((entity) => {
  const targetName =
    typeof entity.target === "function"
      ? entity.target.name
      : String(entity.target);
  return entity.target === User || targetName === "User";
});

if (userEntity) {
  console.log("Entidad User encontrada:", userEntity);
} else {
  console.log("¡ALERTA! La entidad User no está registrada en TypeORM");

  // Verificar si la clase User tiene decoradores
  console.log("User importado:", User);
  console.log("User es decorado:", Reflect.getMetadataKeys(User).length > 0);

  // Intentar registrar manualmente
  console.log("Intentando registrar manualmente...");
}

// Verificar Expense
const expenseEntity = entities.find((entity) => {
  const targetName =
    typeof entity.target === "function"
      ? entity.target.name
      : String(entity.target);
  return entity.target === Expense || targetName === "Expense";
});
console.log("Entidad Expense encontrada:", !!expenseEntity);

// Verificar Report
const reportEntity = entities.find((entity) => {
  const targetName =
    typeof entity.target === "function"
      ? entity.target.name
      : String(entity.target);
  return entity.target === Report || targetName === "Report";
});
console.log("Entidad Report encontrada:", !!reportEntity);
