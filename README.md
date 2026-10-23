# CombatBullyin

Aplicativo local para gestão segura de usuários da comunidade escolar. A interface é servida por Python e os dados são persistidos em SQLite no arquivo `combatbullyin.db`.

## Executar

Requer Python 3.9 ou superior. No PowerShell:

```powershell
python .\app.py
```

Abra <http://127.0.0.1:8000>.

Depois do primeiro acesso, use **Minha senha** para trocar a senha. Em **Usuários**, o administrador pode criar operadores e remover operadores existentes. Em instalações novas, defina temporariamente `INITIAL_ADMIN_PASSWORD` com uma senha aleatória de pelo menos 20 caracteres antes da primeira inicialização. Remova essa variável após a criação do administrador. Nunca reutilize uma senha de exemplo.

Na área da equipe, a aba **Protocolos** reúne as reclamações recebidas com tipo de agressão,
data, hora e relato. Administradores e operadores podem atualizar o status e encaminhar cada
demanda para um usuário responsável. Os relatos enviados pela tela pública são persistidos no
SQLite e ficam disponíveis para a equipe após o login.

Os relatos também aceitam até 8 anexos e 2 GB no total por reclamação. Vídeos podem ter até
10 minutos e 1 GB por arquivo; áudios, 100 MB; imagens, 50 MB; e documentos/textos, 25 MB. A duração do vídeo é
verificada no navegador antes do envio, e os arquivos originais não são comprimidos. No Vercel,
os novos anexos são enviados diretamente para um armazenamento Blob privado; somente integrantes
autenticados da equipe podem baixá-los. Anexos antigos continuam disponíveis no armazenamento
original.

## Deploy no Vercel

O deploy serverless usa [`api/index.py`](./api/index.py) com Flask e PostgreSQL. Configure as
variáveis `DATABASE_URL` (Neon PostgreSQL com `sslmode=require`) e `SESSION_SECRET` (valor aleatório
com pelo menos 32 caracteres) no projeto Vercel. A autenticação falha de forma segura se a chave
de sessão não estiver configurada. O schema é criado automaticamente na primeira requisição.

Para habilitar novos anexos no Vercel, crie um armazenamento Blob com acesso **Private** e
conecte-o ao projeto nos ambientes desejados. O Vercel deve disponibilizar a variável
`BLOB_READ_WRITE_TOKEN` para as funções. Anexos maiores que 4,5 MB são enviados do navegador
diretamente ao Blob, sem passar pelo limite de requisição da API Python.

As senhas não são armazenadas em texto puro: são protegidas com PBKDF2-HMAC-SHA256 e salt individual. As sessões usam cookie HTTP-only e expiram após 8 horas.

Novas senhas, redefinições e alterações devem ter pelo menos 8 caracteres, 2 caracteres especiais e letras maiúsculas e minúsculas. A API valida essa regra mesmo quando a solicitação não vem da interface.
