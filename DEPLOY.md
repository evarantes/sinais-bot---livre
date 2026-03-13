# 🚀 Deploy do Codexia no Coolify — Passo a Passo

## Pré-requisitos

- Coolify instalado e funcionando (v4+)
- Acesso ao painel web do Coolify
- Repositório GitHub: `evarantes/sinais-bot---livre`

---

## Passo 1 — Acessar o Coolify

1. Abra o painel do Coolify no navegador (ex: `https://coolify.seuservidor.com`)
2. Faça login com sua conta de administrador

---

## Passo 2 — Criar novo recurso

1. No painel principal, clique em **"+ Add"** (ou **"+ Adicionar"**)
2. Selecione **"Application"** (Aplicação)
3. Escolha **"Docker Compose"** como o tipo

---

## Passo 3 — Conectar o repositório GitHub

1. Se ainda não conectou o GitHub:
   - Clique em **"GitHub"** como fonte
   - Clique em **"Connect"** e autorize o acesso ao GitHub
   - Selecione sua conta `evarantes`

2. Selecione o repositório: **`sinais-bot---livre`**

3. Selecione a branch: **`main`** (ou a branch que você fez merge)

4. Em **Build Pack**, confirme que está selecionado: **"Docker Compose"**

---

## Passo 4 — Configurar variáveis de ambiente

Na aba **"Environment Variables"** (Variáveis de Ambiente), adicione:

| Variável | Valor | Obrigatória |
|---|---|---|
| `JWT_SECRET` | (invente um segredo longo e aleatório, ex: `minha-chave-super-secreta-codexia-2024`) | **SIM** |
| `DB_PASSWORD` | (invente uma senha forte, ex: `SenhaForte@123!`) | **SIM** |
| `DB_USER` | `arcade` | Opcional (padrão: arcade) |
| `DB_NAME` | `arcade` | Opcional (padrão: arcade) |

> ⚠️ **IMPORTANTE:** Troque o `JWT_SECRET` e `DB_PASSWORD` para valores seguros e únicos. Nunca use os valores padrão em produção!

### Como gerar um segredo seguro:
Se tiver acesso a um terminal, execute:
```
openssl rand -hex 32
```
Use o resultado como `JWT_SECRET`.

---

## Passo 5 — Configurar a porta

1. Na aba **"General"** ou **"Network"**, configure:
   - **Ports Exposes:** `3000`
   - Ou confirme que o Coolify detectou automaticamente a porta 3000

---

## Passo 6 — Configurar domínio (opcional)

1. Na aba **"Settings"** → **"Domain"**:
   - Adicione seu domínio personalizado, ex: `codexia.seusite.com`
   - Ou use o domínio automático gerado pelo Coolify

2. O Coolify gera o certificado SSL (HTTPS) automaticamente via Let's Encrypt

---

## Passo 7 — Deploy!

1. Clique no botão **"Deploy"** (ou **"Implantar"**)
2. Aguarde o build completar — isso pode levar 1-3 minutos na primeira vez
3. O Coolify vai:
   - Baixar o código do GitHub
   - Construir a imagem Docker do app
   - Baixar a imagem do PostgreSQL
   - Iniciar o banco de dados
   - Aguardar o banco ficar saudável
   - Iniciar a aplicação

---

## Passo 8 — Verificar

1. Após o deploy concluir (status verde), clique no link do domínio
2. Você deve ver a tela de login do **Codexia - Jogos Retrô**
3. Crie uma conta, jogue e confirme que tudo funciona!

### Verificar saúde da aplicação:
Acesse: `https://seudominio.com/api/health`
- Se retornar `{"status":"ok"}` → tudo funcionando ✅

---

## Solução de Problemas

### O deploy falhou
- Verifique os logs do build no painel do Coolify
- Confirme que as variáveis de ambiente estão configuradas
- Verifique se o repositório está acessível

### A aplicação não carrega
- Verifique os logs do container `app` no Coolify
- Confirme que a porta 3000 está configurada corretamente
- Teste o endpoint `/api/health`

### Erro de conexão com banco
- Verifique se o container `db` está rodando (logs do PostgreSQL)
- Confirme que `DB_USER`, `DB_PASSWORD` e `DB_NAME` estão iguais no `app` e no `db`

### Erro "Token inválido" após redeploy
- O `JWT_SECRET` deve ser o mesmo entre deploys
- Se mudar o segredo, todos os usuários precisam fazer login novamente

---

## Atualizações futuras

Para atualizar o site após fazer alterações no código:

1. Faça push para o GitHub
2. No Coolify, clique em **"Redeploy"** (ou configure auto-deploy via webhook)
3. O Coolify reconstrói e reinicia automaticamente
4. Os dados do PostgreSQL são mantidos (volume persistente)

---

## Resumo das variáveis

```env
# OBRIGATÓRIAS para produção
JWT_SECRET=seu-segredo-super-secreto-aqui
DB_PASSWORD=sua-senha-forte-aqui

# OPCIONAIS (têm valores padrão)
DB_USER=arcade
DB_NAME=arcade
```
