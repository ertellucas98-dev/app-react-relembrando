import { type FormEvent, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  atualizarUsuario,
  buscarUsuarios,
  criarUsuario,
  excluirUsuario,
} from './service/usuarioService'
import type { FormularioUsuario, Usuario } from './service/usuarioTypes'

const formularioInicial: FormularioUsuario = {
  name: '',
  email: '',
  company: '',
  website: '',
}

function TesteconexaoApi() {
  const queryClient = useQueryClient()
  const [formulario, setFormulario] =
    useState<FormularioUsuario>(formularioInicial)
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<number | null>(null)
  const [filtro, setFiltro] = useState('')

  const usuariosQuery = useQuery({
    queryKey: ['usuarios'],
    queryFn: buscarUsuarios,
  })

  function limparFormulario() {
    setFormulario(formularioInicial)
    setUsuarioEmEdicao(null)
  }

  function preencherFormulario(usuario: Usuario) {
    setFormulario({
      name: usuario.name,
      email: usuario.email,
      company: usuario.company.name,
      website: usuario.website,
    })
    setUsuarioEmEdicao(usuario.id)
  }

  const criarMutation = useMutation({
    mutationFn: criarUsuario,
    onSuccess: (novoUsuario) => {
      queryClient.setQueryData<Usuario[]>(['usuarios'], (usuariosAtuais = []) => [
        novoUsuario,
        ...usuariosAtuais,
      ])
      limparFormulario()
    },
  })

  const atualizarMutation = useMutation({
    mutationFn: atualizarUsuario,
    onSuccess: (usuarioAtualizado) => {
      queryClient.setQueryData<Usuario[]>(['usuarios'], (usuariosAtuais = []) =>
        usuariosAtuais.map((usuario) =>
          usuario.id === usuarioAtualizado.id ? usuarioAtualizado : usuario,
        ),
      )
      limparFormulario()
    },
  })

  const excluirMutation = useMutation({
    mutationFn: excluirUsuario,
    onSuccess: (idRemovido) => {
      queryClient.setQueryData<Usuario[]>(['usuarios'], (usuariosAtuais = []) =>
        usuariosAtuais.filter((usuario) => usuario.id !== idRemovido),
      )
    },
  })

  const usuariosFiltrados = useMemo(() => {
    const termo = filtro.trim().toLowerCase()

    if (!termo) {
      return usuariosQuery.data ?? []
    }

    return (usuariosQuery.data ?? []).filter((usuario) =>
      [usuario.name, usuario.email, usuario.company.name, usuario.website]
        .join(' ')
        .toLowerCase()
        .includes(termo),
    )
  }, [filtro, usuariosQuery.data])

  function handleSubmit(evento : FormEvent<HTMLFormElement>) {
    evento.preventDefault()

    if (usuarioEmEdicao !== null) {
      atualizarMutation.mutate({
        id: usuarioEmEdicao,
        payload: formulario,
      })
      return
    }

    criarMutation.mutate(formulario)
  }

  const carregandoAcao =
    criarMutation.isPending ||
    atualizarMutation.isPending ||
    excluirMutation.isPending

  return (
    <main className="crud-page">
      <section className="crud-hero">
        <div>
          <span className="pill">Axios + React Query</span>
          <h1>Painel de usuarios com CRUD simulado</h1>
          <p>
            A tela consome a API fake do JSONPlaceholder para listar, criar,
            editar e remover registros com cache e atualizacao automatica.
          </p>
        </div>

        <div className="hero-card">
          <strong>{usuariosQuery.data?.length ?? 0}</strong>
          <span>registros carregados</span>
          <small>Fonte: /users da JSONPlaceholder</small>
        </div>
      </section>

      <section className="crud-grid">
        <article className="panel">
          <div className="panel-header">
            <div>
              <span className="eyebrow">
                {usuarioEmEdicao !== null ? 'Editar usuario' : 'Novo usuario'}
              </span>
              <h2>
                {usuarioEmEdicao !== null
                  ? 'Atualize os dados do registro'
                  : 'Cadastrar novo registro'}
              </h2>
            </div>
          </div>

          <form className="crud-form" onSubmit={handleSubmit}>
            <label>
              Nome
              <input
                required
                value={formulario.name}
                onChange={(evento) =>
                  setFormulario((estadoAtual) => ({
                    ...estadoAtual,
                    name: evento.target.value,
                  }))
                }
                placeholder="Ex: Maria Silva"
              />
            </label>

            <label>
              E-mail
              <input
                required
                type="email"
                value={formulario.email}
                onChange={(evento) =>
                  setFormulario((estadoAtual) => ({
                    ...estadoAtual,
                    email: evento.target.value,
                  }))
                }
                placeholder="maria@email.com"
              />
            </label>

            <label>
              Empresa
              <input
                required
                value={formulario.company}
                onChange={(evento) =>
                  setFormulario((estadoAtual) => ({
                    ...estadoAtual,
                    company: evento.target.value,
                  }))
                }
                placeholder="Empresa LTDA"
              />
            </label>

            <label>
              Website
              <input
                required
                value={formulario.website}
                onChange={(evento) =>
                  setFormulario((estadoAtual) => ({
                    ...estadoAtual,
                    website: evento.target.value,
                  }))
                }
                placeholder="empresa.com.br"
              />
            </label>

            <div className="actions">
              <button className="primary-button" type="submit" disabled={carregandoAcao}>
                {usuarioEmEdicao !== null ? 'Salvar alteracoes' : 'Criar usuario'}
              </button>

              <button
                className="ghost-button"
                type="button"
                onClick={limparFormulario}
                disabled={carregandoAcao}
              >
                Limpar
              </button>
            </div>
          </form>
        </article>

        <article className="panel panel-wide">
          <div className="panel-header panel-header-inline">
            <div>
              <span className="eyebrow">Tabela</span>
              <h2>Usuarios cadastrados</h2>
            </div>

            <input
              className="search-input"
              value={filtro}
              onChange={(evento) => setFiltro(evento.target.value)}
              placeholder="Buscar por nome, email ou empresa"
            />
          </div>

          {usuariosQuery.isLoading ? (
            <div className="feedback-card">Carregando usuarios...</div>
          ) : null}

          {usuariosQuery.isError ? (
            <div className="feedback-card error">
              Nao foi possivel carregar os dados da API.
            </div>
          ) : null}

          {!usuariosQuery.isLoading && !usuariosQuery.isError ? (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Nome</th>
                    <th>E-mail</th>
                    <th>Empresa</th>
                    <th>Website</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                      <td>{usuario.name}</td>
                      <td>{usuario.email}</td>
                      <td>{usuario.company.name}</td>
                      <td>{usuario.website}</td>
                      <td className="row-actions">
                        <button
                          className="table-button"
                          type="button"
                          onClick={() => preencherFormulario(usuario)}
                          disabled={carregandoAcao}
                        >
                          Editar
                        </button>
                        <button
                          className="table-button danger"
                          type="button"
                          onClick={() => excluirMutation.mutate(usuario.id)}
                          disabled={carregandoAcao}
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {usuariosFiltrados.length === 0 ? (
                <div className="feedback-card">Nenhum usuario encontrado.</div>
              ) : null}
            </div>
          ) : null}
        </article>
      </section>
    </main>
  )
}

export default TesteconexaoApi
