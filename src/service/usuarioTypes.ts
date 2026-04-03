export type Usuario = {
  id: number
  name: string
  email: string
  company: {
    name: string
  }
  website: string
}

export type FormularioUsuario = {
  name: string
  email: string
  company: string
  website: string
}
