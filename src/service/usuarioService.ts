import axios from 'axios'
import type { FormularioUsuario, Usuario } from './usuarioTypes'

const api = axios.create({
  baseURL: 'https://jsonplaceholder.typicode.com',
})

function normalizarUsuario(payload: FormularioUsuario, id: number): Usuario {
  return {
    id,
    name: payload.name,
    email: payload.email,
    company: {
      name: payload.company,
    },
    website: payload.website,
  }
}

export async function buscarUsuarios(): Promise<Usuario[]> {
  const resposta = await api.get<Usuario[]>('/users')
  return resposta.data
}

export async function criarUsuario(payload: FormularioUsuario): Promise<Usuario> {
  const resposta = await api.post<Usuario>('/users', {
    ...payload,
    company: { name: payload.company },
  })

  return normalizarUsuario(payload, resposta.data.id ?? Date.now())
}

export async function atualizarUsuario({
  id,
  payload,
}: {
  id: number
  payload: FormularioUsuario
}): Promise<Usuario> {
  await api.put(`/users/${id}`, {
    ...payload,
    company: { name: payload.company },
  })

  return normalizarUsuario(payload, id)
}

export async function excluirUsuario(id: number): Promise<number> {
  await api.delete(`/users/${id}`)
  return id
}
