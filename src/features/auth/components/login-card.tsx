import { useState } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { ErrorApi } from "@/lib/api-client"
import { cn } from "@/lib/utils"

import { useSesion } from "../session-context"
import { esquemaLogin, type DatosLogin } from "../validation"
import { CampoFormulario } from "./form-field"

/** Inicio de sesión del administrador (HU-03). */
export function TarjetaAcceso({ className }: { className?: string }) {
  const { iniciarSesion } = useSesion()
  const navegar = useNavigate()
  /** 401, 403, sin conexión…: aviso arriba y ambos campos en rojo. */
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)

  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<DatosLogin, unknown, DatosLogin>({
    resolver: zodResolver(esquemaLogin),
    mode: "onTouched",
    defaultValues: { email: "", contrasenia: "" },
  })
  const [email, contrasenia] = useWatch({ control, name: ["email", "contrasenia"] })
  const completos = email.trim() !== "" && contrasenia !== ""

  const enviar = handleSubmit(async (datos) => {
    setErrorGeneral(null)
    try {
      await iniciarSesion(datos.email, datos.contrasenia)
      navegar("/panel", { replace: true })
    } catch (e) {
      const error = e instanceof ErrorApi ? e : new ErrorApi(ErrorApi.INESPERADO)
      const deCampo = error.errores.filter((f) => f.campo === "email" || f.campo === "contrasenia")
      if (deCampo.length > 0) {
        for (const f of deCampo) setError(f.campo as keyof DatosLogin, { type: "server", message: f.mensaje })
      } else {
        setErrorGeneral(error.mensaje)
      }
    }
  })

  const limpiarAviso = () => setErrorGeneral(null)

  return (
    <div className={cn("rounded-2xl border border-border bg-card px-6 py-8 shadow-tarjeta-elevada sm:px-8", className)}>
      <p className="text-etiqueta-grande text-texto-exito uppercase">Panel empresarial</p>
      <h2 className="mt-2 text-titulo-tarjeta">Inicia sesión</h2>
      <p className="mt-1 text-cuerpo text-muted-foreground">Accede con la cuenta de administrador de tu empresa.</p>

      <form onSubmit={enviar} noValidate className="mt-6 flex flex-col gap-4">
        {errorGeneral && <AvisoError mensaje={errorGeneral} />}
        <CampoFormulario
          control={control}
          nombre="email"
          etiqueta="Correo electrónico"
          tipo="email"
          autoComplete="email"
          conError={!!errorGeneral}
          alCambiar={limpiarAviso}
          deshabilitado={isSubmitting}
        />
        <CampoFormulario
          control={control}
          nombre="contrasenia"
          etiqueta="Contraseña"
          tipo="password"
          autoComplete="current-password"
          conError={!!errorGeneral}
          alCambiar={limpiarAviso}
          deshabilitado={isSubmitting}
        />
        <Button type="submit" size="formulario" className="mt-2 w-full" disabled={!completos} aria-busy={isSubmitting}>
          {isSubmitting ? <Loader2 className="animate-spin" aria-label="Iniciando sesión" /> : "Iniciar sesión"}
        </Button>
      </form>

      <p className="mt-5 text-center text-cuerpo-pequeno text-muted-foreground">
        ¿Eres conductor? Usa la app DriveSense para Android.
      </p>
    </div>
  )
}
