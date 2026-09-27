import { useState } from "react"
import { useForm, useWatch, type FieldPath } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { Link, useNavigate } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { ErrorApi } from "@/lib/api-client"

import { SelectorTipoEmpresa } from "../components/company-type-selector"
import { BloqueOscuro } from "../components/dark-block"
import { CampoFormulario } from "../components/form-field"
import { DianaFuerzasG } from "../components/g-force-target"
import { RequisitosContrasenia } from "../components/password-requirements"
import { EncabezadoSitio } from "../components/site-header"
import { useSesion } from "../session-context"
import {
  esquemaRegistroEmpresa,
  MENSAJE_REQUISITOS,
  type DatosFormularioRegistro,
  type DatosRegistroValidados,
} from "../validation"

type Campo = FieldPath<DatosFormularioRegistro>

// Campos que puede nombrar un 422 del backend (misma ruta que en el formulario)
const CAMPOS_API: Campo[] = [
  "empresa.nombre",
  "empresa.tipo",
  "empresa.email_contacto",
  "empresa.telefono",
  "administrador.nombre",
  "administrador.email",
  "administrador.telefono",
  "administrador.contrasenia",
]

const soloDigitos = (valor: string) => valor.replace(/\D/g, "").slice(0, 8)

/** Registro de empresa y su administrador (HU-03). */
export function RegistroEmpresaPagina() {
  const { registrarEmpresa } = useSesion()
  const navegar = useNavigate()
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    setError,
    formState: { isValid, isSubmitting, touchedFields },
  } = useForm<DatosFormularioRegistro, unknown, DatosRegistroValidados>({
    resolver: zodResolver(esquemaRegistroEmpresa),
    mode: "onTouched",
    defaultValues: {
      empresa: { nombre: "", tipo: undefined, email_contacto: "", telefono: "" },
      administrador: { nombre: "", email: "", telefono: "", contrasenia: "", confirmacion: "" },
    },
  })
  const contrasenia = useWatch({ control, name: "administrador.contrasenia" })

  const enviar = handleSubmit(async ({ empresa, administrador }) => {
    setErrorGeneral(null)
    // La confirmación solo existe en el formulario; la API no la recibe
    const { nombre, email, telefono, contrasenia } = administrador
    try {
      await registrarEmpresa({ empresa, administrador: { nombre, email, telefono, contrasenia } })
      navegar("/panel", { replace: true })
    } catch (e) {
      const error = e instanceof ErrorApi ? e : new ErrorApi(ErrorApi.INESPERADO)
      if (error.codigo === 409) {
        setError("administrador.email", { type: "server", message: error.mensaje })
        return
      }
      if (error.errores.length === 0) {
        setErrorGeneral(error.mensaje)
        return
      }
      for (const f of error.errores) {
        const campo = CAMPOS_API.find((c) => c === f.campo)
        if (campo) setError(campo, { type: "server", message: f.mensaje })
        else setErrorGeneral(error.mensaje)
      }
    }
  })

  const limpiarAviso = () => setErrorGeneral(null)
  const comun = { control, alCambiar: limpiarAviso, deshabilitado: isSubmitting }

  return (
    <>
      <title>Registra tu empresa · DriveSense</title>

      <BloqueOscuro ilustracion={<DianaFuerzasG variante="reducida" />}>
        <EncabezadoSitio accion="iniciarSesion" />
        <div className="mx-auto max-w-220 px-5 pt-10 pb-28 text-center md:px-10">
          <h1 className="text-titulo-hero text-encabezado-texto">Registra tu empresa</h1>
          <p className="mx-auto mt-3 max-w-150 text-subtitulo-landing text-encabezado-texto-secundario">
            Crea la cuenta de tu empresa y empieza a monitorear a tus conductores.
          </p>
        </div>
      </BloqueOscuro>

      <main className="relative -mt-20 px-4 pb-16 md:px-10">
        <form
          onSubmit={enviar}
          noValidate
          className="mx-auto max-w-220 rounded-2xl border border-border bg-card px-5 py-6 shadow-tarjeta-elevada sm:px-8 sm:py-8"
        >
          {errorGeneral && (
            <div className="mb-6">
              <AvisoError mensaje={errorGeneral} />
            </div>
          )}

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
            <fieldset className="flex flex-col gap-4">
              <legend className="mb-4 text-subtitulo-grande">Datos de la empresa</legend>
              <CampoFormulario {...comun} nombre="empresa.nombre" etiqueta="Nombre de la empresa" autoComplete="organization" />
              <SelectorTipoEmpresa control={control} />
              <CampoFormulario {...comun} nombre="empresa.email_contacto" etiqueta="Correo de contacto" tipo="email" autoComplete="email" />
              <CampoFormulario
                {...comun}
                nombre="empresa.telefono"
                etiqueta="Teléfono"
                tipo="tel"
                ayuda="8 dígitos, sin código de país"
                filtrar={soloDigitos}
              />
            </fieldset>

            <fieldset className="flex flex-col gap-4">
              <legend className="mb-4 text-subtitulo-grande">Administrador</legend>
              <CampoFormulario {...comun} nombre="administrador.nombre" etiqueta="Nombre completo" autoComplete="name" />
              <CampoFormulario {...comun} nombre="administrador.email" etiqueta="Correo electrónico" tipo="email" autoComplete="email" />
              <CampoFormulario
                {...comun}
                nombre="administrador.telefono"
                etiqueta="Teléfono"
                tipo="tel"
                autoComplete="tel-national"
                ayuda="8 dígitos, sin código de país"
                filtrar={soloDigitos}
              />
              <CampoFormulario
                {...comun}
                nombre="administrador.contrasenia"
                etiqueta="Contraseña"
                tipo="password"
                autoComplete="new-password"
                // La confirmación se vuelve a validar cuando cambia la contraseña
                reglas={{ deps: ["administrador.confirmacion"] }}
                // Los requisitos pendientes ya se marcan en rojo en la lista
                ocultarMensaje={(m) => m === MENSAJE_REQUISITOS}
                debajo={
                  <RequisitosContrasenia
                    contrasenia={contrasenia}
                    resaltarPendientes={!!touchedFields.administrador?.contrasenia}
                  />
                }
              />
              <CampoFormulario
                {...comun}
                nombre="administrador.confirmacion"
                etiqueta="Confirmar contraseña"
                tipo="password"
                autoComplete="new-password"
              />
            </fieldset>
          </div>

          <div className="mt-8 flex flex-col items-center gap-3 border-t border-border pt-6">
            <Button type="submit" size="formulario" className="w-full sm:w-auto sm:min-w-80" disabled={!isValid} aria-busy={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" aria-label="Creando cuenta" /> : "Crear cuenta de empresa"}
            </Button>
            <p className="flex flex-wrap items-center justify-center text-cuerpo text-muted-foreground">
              ¿Ya tienes cuenta?
              <Button asChild variant="link" size="link">
                <Link to="/">Inicia sesión</Link>
              </Button>
            </p>
          </div>
        </form>
      </main>
    </>
  )
}
