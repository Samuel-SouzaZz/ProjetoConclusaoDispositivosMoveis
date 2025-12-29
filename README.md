# DevQuest (ProjetoConclusaoDispositivosMoveis)

Aplicativo mobile (Expo + React Native) focado em desafios de programação, interação em fórum e participação em grupos com ranking e progresso. O app depende de uma API externa configurada via variáveis de ambiente.

## Funcionalidades

- Autenticação (cadastro, login, refresh token e sessão persistida)
- Desafios de programação (listagem e detalhes)
- Editor/execução de código via API (integração com Judge0 pelo backend)
- Fóruns e tópicos
- Grupos (detalhes, membros, progresso, desafios e ranking)
- Convite para grupos via deep link (`myapp://invite/:groupId/:token`)
- Tema claro/escuro
- Suporte a ações offline para criação de desafios com sincronização automática

## Stack

- Expo (SDK 54)
- React Native + TypeScript
- React Navigation (Stack + Bottom Tabs)
- Axios (HTTP)
- AsyncStorage / SecureStore (armazenamento de tokens)
- Expo SQLite (persistência local)
- Expo Camera / Image Picker (recursos de mídia)

## Estrutura do projeto

- `ProjetoFinal/` — aplicativo Expo
  - `App.tsx` — bootstrap do app + linking + providers
  - `src/navigation/` — navegação (stack/tabs)
  - `src/screens/` — telas
  - `src/components/` — componentes reutilizáveis
  - `src/contexts/` — contextos (auth/tema)
  - `src/services/` — integração com API, offline sync e storage

## Pré-requisitos

- Node.js e npm
- Expo CLI (via `npx expo ...`)
- Para rodar em Android/iOS com build nativo: ambiente configurado (Android Studio/Xcode)
- Uma API compatível (ver seção “Configuração”)

## Configuração

1. Entre na pasta do app:

```bash
cd ProjetoFinal
```

2. Crie o arquivo `.env` a partir do exemplo:

```bash
cp .env.example .env
```

3. Edite o `.env` com o endereço da sua API:

- `API_URL`: base da API (ex.: `http://192.168.0.10:3000`)
- `API_PATH`: prefixo das rotas (ex.: `/api`)

Observação: essas variáveis são lidas em `app.config.js` e injetadas no app via `extra`.

## Instalação

```bash
cd ProjetoFinal
npm install
```

## Executando

Na pasta `ProjetoFinal/`:

```bash
npm start
```

Outros comandos úteis:

```bash
npm run android
npm run ios
npm run web
```

## Notas

- Se estiver testando no celular, use o IPv4 da sua máquina no `API_URL` e garanta que o dispositivo está na mesma rede.
- A sincronização offline tenta enviar pendências automaticamente quando a conectividade volta.

## 👨🏽‍💻 Colaboradores

<div align="center">
  <table>
    <tr>
    <td align="center">
        <a href="https://github.com/VitinDemarque" style="text-decoration: none;">
          <img src="https://avatars.githubusercontent.com/u/126296402?v=4" width="100" height="100" style="border-radius: 50%;">
          <br>
          Victor Demarque
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/Samuel-SouzaZz" style="text-decoration: none;">
          <img src="https://avatars.githubusercontent.com/u/129301287?v=4" width="100" height="100" style="border-radius: 50%;">
          <br>
          Samuel Souza
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/JoaoASouzaN" style="text-decoration: none;">
          <img src="https://avatars.githubusercontent.com/u/127859422?v=4" width="100" height="100" style="border-radius: 50%;">
          <br>
          João Antônio Souza
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/ArthurSilva902" style="text-decoration: none;">
          <img src="https://avatars.githubusercontent.com/u/180798363?v=4" width="100" height="100" style="border-radius: 50%;">
          <br>
          Arthur Silva
        </a>
      </td>
      <td align="center">
        <a href="https://github.com/mts3324" style="text-decoration: none;">
          <img src="https://avatars.githubusercontent.com/u/133476027?v=4" width="100" height="100" style="border-radius: 50%;">
          <br>
          Mateus Silva
        </a>
      </td>
    </tr>
  </table>
</div>