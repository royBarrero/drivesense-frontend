/** Calificación del DriveScore: mismos rangos que la app y el backend (`calificar`). */
export type Calificacion = "excelente" | "muy_bueno" | "regular" | "riesgoso"

export function calificar(drivescore: number): Calificacion {
  if (drivescore >= 90) return "excelente"
  if (drivescore >= 75) return "muy_bueno"
  if (drivescore >= 60) return "regular"
  return "riesgoso"
}

export const NOMBRE_CALIFICACION: Record<Calificacion, string> = {
  excelente: "Excelente",
  muy_bueno: "Muy bueno",
  regular: "Regular",
  riesgoso: "Riesgoso",
}

/** Fondo y texto del distintivo del DriveScore (docs/diseno.md, 6.5). */
export const CLASE_CALIFICACION: Record<Calificacion, string> = {
  excelente: "bg-tinte-primario text-texto-exito",
  muy_bueno: "bg-tinte-secundario text-texto-evento-velocidad",
  regular: "bg-tinte-advertencia text-texto-evento-giro",
  riesgoso: "bg-tinte-peligro text-destructive",
}

/** Solo el color del texto, para la calificación escrita junto al número. */
export const TEXTO_CALIFICACION: Record<Calificacion, string> = {
  excelente: "text-texto-exito",
  muy_bueno: "text-texto-evento-velocidad",
  regular: "text-texto-evento-giro",
  riesgoso: "text-destructive",
}
