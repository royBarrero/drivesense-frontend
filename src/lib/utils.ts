import { createCn } from "cn/config"

// Tamaños de texto y sombras propios del tema (src/index.css). Sin registrarlos,
// cn confunde `text-cuerpo` con un color y lo elimina al combinarlo con `text-foreground`.
const TAMANOS_TEXTO = [
  "telemetria-xl",
  "telemetria",
  "puntaje",
  "numero-metrica",
  "titulo-landing",
  "titulo-landing-movil",
  "subtitulo-landing",
  "titulo-hero",
  "titulo",
  "titulo-tarjeta",
  "marca",
  "subtitulo-grande",
  "subtitulo",
  "boton",
  "cuerpo",
  "cuerpo-pequeno",
  "etiqueta-campo",
  "ayuda",
  "etiqueta-grande",
  "etiqueta",
]

const SOMBRAS = ["tarjeta", "tarjeta-elevada", "boton-primario", "resplandor"]

export const cn = createCn({
  extend: {
    classGroups: {
      "font-size": [{ text: TAMANOS_TEXTO }],
      shadow: [{ shadow: SOMBRAS }],
    },
  },
})
