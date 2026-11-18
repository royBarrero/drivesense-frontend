import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"

import { AvisoError } from "@/components/error-banner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CampoFormulario } from "@/features/auth/components/form-field"
import { ErrorApi } from "@/lib/api-client"

import { registrarConductor } from "../api"
import type { ConductorCreado } from "../types"
import { esquemaNuevoConductor, type DatosConductorValidados, type DatosFormularioConductor } from "../validation"
import { CredencialTemporal } from "./temporary-credential"

const CAMPOS = ["nombre", "email", "telefono"] as const

/** Alta de un conductor de la flota; al crearlo muestra su contraseña temporal. */
export function DialogoRegistro({
  abierto,
  alCerrar,
  alRegistrar,
}: {
  abierto: boolean
  alCerrar: () => void
  /** Se llama al crear, para recargar el listado. */
  alRegistrar: () => void
}) {
  const [creado, setCreado] = useState<ConductorCreado | null>(null)

  const cerrar = () => {
    setCreado(null)
    alCerrar()
  }

  return (
    <Dialog open={abierto} onOpenChange={(abrir) => !abrir && cerrar()}>
      <DialogContent
        // Con la contraseña a la vista, un clic afuera no la debe cerrar por accidente
        onInteractOutside={(e) => creado && e.preventDefault()}
        onEscapeKeyDown={(e) => creado && e.preventDefault()}
        showCloseButton={!creado}
      >
        {creado ? (
          <>
            <DialogHeader>
              <DialogTitle>Conductor registrado</DialogTitle>
              <DialogDescription>Con estos datos entrará a la app de DriveSense.</DialogDescription>
            </DialogHeader>
            <CredencialTemporal
              nombre={creado.nombre}
              email={creado.email}
              contrasenia={creado.contrasenia_temporal}
              alTerminar={cerrar}
            />
          </>
        ) : (
          <FormularioConductor
            alCancelar={cerrar}
            alCrear={(conductor) => {
              setCreado(conductor)
              alRegistrar()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}

function FormularioConductor({
  alCancelar,
  alCrear,
}: {
  alCancelar: () => void
  alCrear: (conductor: ConductorCreado) => void
}) {
  const [errorGeneral, setErrorGeneral] = useState<string | null>(null)
  const [errorDePlan, setErrorDePlan] = useState(false)
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<DatosFormularioConductor, unknown, DatosConductorValidados>({
    resolver: zodResolver(esquemaNuevoConductor),
    mode: "onTouched",
    defaultValues: { nombre: "", email: "", telefono: "" },
  })

  const enviar = async (datos: DatosConductorValidados) => {
    setErrorGeneral(null)
    setErrorDePlan(false)
    try {
      alCrear(await registrarConductor(datos))
    } catch (e) {
      if (!(e instanceof ErrorApi)) {
        setErrorGeneral(ErrorApi.INESPERADO)
        return
      }
      if (e.codigo === 409) {
        // Correo repetido: va debajo del campo, con el mensaje del backend
        setError("email", { message: e.mensaje })
        return
      }
      const deCampo = e.errores.filter((x) => x.campo && (CAMPOS as readonly string[]).includes(x.campo))
      for (const x of deCampo) setError(x.campo as (typeof CAMPOS)[number], { message: x.mensaje })
      if (deCampo.length === 0) {
        setErrorGeneral(e.mensaje)
        setErrorDePlan(e.esDePlan)
      }
    }
  }

  return (
    <form onSubmit={handleSubmit(enviar)} noValidate className="flex flex-col gap-5">
      <DialogHeader>
        <DialogTitle>Registrar conductor</DialogTitle>
        <DialogDescription>
          Se creará su cuenta en tu empresa con una contraseña temporal que verás una sola vez.
        </DialogDescription>
      </DialogHeader>
      {errorGeneral && <AvisoError mensaje={errorGeneral} mejorarPlan={errorDePlan} />}
      <CampoFormulario control={control} nombre="nombre" etiqueta="Nombre completo" autoComplete="off" />
      <CampoFormulario control={control} nombre="email" etiqueta="Correo" tipo="email" autoComplete="off" />
      <CampoFormulario
        control={control}
        nombre="telefono"
        etiqueta="Teléfono"
        tipo="tel"
        autoComplete="off"
        ayuda="8 dígitos"
        filtrar={(valor) => valor.replace(/\D/g, "").slice(0, 8)}
      />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={alCancelar}>
          Cancelar
        </Button>
        <Button type="submit" aria-busy={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" aria-label="Registrando" />}
          Registrar conductor
        </Button>
      </DialogFooter>
    </form>
  )
}
