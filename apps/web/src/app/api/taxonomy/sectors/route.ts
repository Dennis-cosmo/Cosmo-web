import { NextResponse } from "next/server";
import axios from "axios";

// Datos estáticos de sectores (fallback para cuando la API externa no está disponible)
const fallbackSectors = [
  { id: 21, name: "Construcción y actividades inmobiliarias" },
  { id: 4, name: "Energía" },
  { id: 2, name: "Protección y restauración medioambiental" },
  { id: 1, name: "Silvicultura" },
  { id: 8, name: "Información y comunicación" },
  { id: 3, name: "Manufactura" },
  { id: 9, name: "Actividades profesionales, científicas y técnicas" },
  { id: 6, name: "Transporte" },
  { id: 5, name: "Suministro de agua, saneamiento, gestión de residuos" },
];

export async function GET() {
  try {
    // Llamar al endpoint de sectores desde el servidor (sin problemas CORS)
    const response = await axios.get(
      "https://webgate.ec.europa.eu/sft/api/v1/en/sectors/objective/41"
    );

    // Formatear los sectores para garantizar que tengan el formato esperado
    const formattedSectors = response.data.map((sector: any) => ({
      id: sector.id,
      name: sector.name, // Puedes traducir aquí los nombres si lo deseas
      originalName: sector.name,
    }));

    // Devolver los datos al frontend
    return NextResponse.json(formattedSectors);
  } catch (error) {
    console.error("Error al obtener sectores de taxonomía:", error);
    // Si falla, usar datos de respaldo
    return NextResponse.json(fallbackSectors);
  }
}
