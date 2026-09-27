export type TipoEmpresa = "flota" | "aseguradora"

export interface EmpresaResumen {
  id: number
  nombre: string
  tipo: TipoEmpresa
}

/** Usuario autenticado, tal como lo devuelve `UsuarioSalida` del backend. */
export interface UsuarioAdmin {
  id: number
  nombre: string
  email: string
  telefono: string
  rol: "conductor" | "admin_empresa"
  debe_cambiar_contrasenia: boolean
  empresa: EmpresaResumen | null
}

/** Respuesta de login y registro. */
export interface Sesion {
  access_token: string
  token_type: string
  usuario: UsuarioAdmin
}

export interface DatosRegistroEmpresa {
  empresa: {
    nombre: string
    tipo: TipoEmpresa
    email_contacto: string
    telefono: string
  }
  administrador: {
    nombre: string
    email: string
    telefono: string
    contrasenia: string
  }
}
