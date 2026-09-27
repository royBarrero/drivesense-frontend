import { ArrowRight, Smartphone } from "lucide-react"
import { Link } from "react-router"

import { Button } from "@/components/ui/button"

import { SeccionesPublico } from "../components/audience-sections"
import { BloqueOscuro } from "../components/dark-block"
import { TarjetasCaracteristicas } from "../components/feature-cards"
import { DianaFuerzasG } from "../components/g-force-target"
import { TarjetaAcceso } from "../components/login-card"
import { VistaPreviaPanel } from "../components/panel-preview"
import { EncabezadoSitio } from "../components/site-header"

/** Landing con el inicio de sesión del administrador (HU-03). */
export function LandingPagina() {
  return (
    <>
      <title>DriveSense · Panel empresarial</title>

      <BloqueOscuro
        className="lg:min-h-160"
        ilustracion={
          <>
            <DianaFuerzasG variante="completa" className="hidden lg:block" />
            <DianaFuerzasG variante="reducida" className="lg:hidden" />
          </>
        }
      >
        <EncabezadoSitio accion="registrar" />

        {/* Móvil y tablet: una columna, la tarjeta debajo del titular.
            Escritorio: dos columnas y la tarjeta sobresale por el borde inferior. */}
        <div className="mx-auto grid max-w-contenido grid-cols-1 gap-10 px-5 pt-10 pb-10 md:px-10 md:pt-14 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-12 lg:px-16 lg:pt-16 lg:pb-0">
          <div className="max-w-190 lg:self-center lg:pb-16">
            <p className="inline-flex min-h-8 items-center gap-2 rounded-full bg-encabezado-acento/12 px-3 text-etiqueta-grande text-encabezado-acento">
              <Smartphone className="size-4" aria-hidden="true" />
              Sin hardware adicional
            </p>
            <h1 className="mt-5 text-titulo-landing-movil text-encabezado-texto lg:text-titulo-landing">
              La telemetría de tu flota, en el teléfono de cada conductor.
            </h1>
            <p className="mt-5 max-w-150 text-subtitulo-landing text-encabezado-texto-secundario">
              Mide frenadas, aceleraciones, giros y velocidad con los sensores del smartphone, y revisa el
              DriveScore de cada conductor desde un solo panel.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="sobreOscuro" size="lg">
                <Link to="/registro">
                  Registrar empresa
                  <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              <Button asChild variant="contornoOscuro" size="lg">
                <a href="#como-funciona">Ver cómo funciona</a>
              </Button>
            </div>
          </div>

          <TarjetaAcceso className="w-full lg:-mb-8 lg:w-105" />
        </div>
      </BloqueOscuro>

      <main className="mx-auto flex max-w-contenido flex-col gap-16 px-5 pt-14 pb-20 md:px-10 lg:gap-20 lg:px-16 lg:pt-24">
        <section id="como-funciona" aria-labelledby="como-funciona-titulo" className="scroll-mt-6">
          <p className="text-etiqueta-grande text-texto-exito uppercase">Cómo funciona</p>
          <h2 id="como-funciona-titulo" className="mt-2 max-w-150 text-titulo">
            Cada conductor usa la app; tú ves su desempeño en el panel.
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
            <VistaPreviaPanel />
            <TarjetasCaracteristicas />
          </div>
        </section>

        <SeccionesPublico />
      </main>
    </>
  )
}
