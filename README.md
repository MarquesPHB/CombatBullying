# Combatbullying

Aplicativo responsivo para registrar relatos, acompanhar protocolos com PIN e fazer a gestão dos atendimentos.

## Configuração no Vercel

Vincule o repositório ao Vercel e configure as variáveis no ambiente adequado, sem adicioná-las ao código ou ao Git:

- `DATABASE_URL`: conexão PostgreSQL.
- `SESSION_SECRET`: segredo aleatório com pelo menos 32 caracteres.
- `BLOB_READ_WRITE_TOKEN`: token de um armazenamento Vercel Blob privado, necessário para anexos.
- `INITIAL_ADMIN_PASSWORD`: senha temporária de pelo menos 20 caracteres, usada apenas na inicialização para criar o administrador ou substituir a senha legada. Remova-a após a inicialização bem-sucedida.

Configure as variáveis necessárias também nos ambientes de Preview antes de testar o fluxo completo. Não reutilize senhas entre ambientes. A API inicializa e atualiza o esquema PostgreSQL automaticamente.

## Desenvolvimento e validação

```sh
npm ci
npm run lint
npm run build
```

Para testar as rotas Python localmente, use `vercel dev` com as dependências de `requirements.txt` e as variáveis de ambiente configuradas. A compilação local do projeto Vercel também requer o executável `uv`.
