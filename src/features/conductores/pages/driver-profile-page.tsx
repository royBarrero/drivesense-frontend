import { ArrowLeft } from "lucide-react"
import { Link } from "react-router"

/** Marcador del perfil del conductor: su contenido llega con la HU-25. */
export function PerfilConductorPagina() {
  return (
    <>
      <title>Conductor · DriveSense</title>
      <Link
        to="/panel/conductores"
        className="inline-flex items-center gap-2 text-cuerpo font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-5" aria-hidden="true" />
        Volver a conductores
      </Link>
      <h1 className="mt-4 text-titulo-hero">Perfil del conductor</h1>
      <p className="mt-4 max-w-xl rounded-xl border border-dashed border-borde-fuerte bg-muted p-5 text-cuerpo text-muted-foreground">
        Próximamente: el DriveScore, el perfil de riesgo y el historial de eventos de este conductor.
      </p>
    </>
  )
}
