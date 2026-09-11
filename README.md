# CombatBullyin

Aplicativo local para gestão segura de usuários da comunidade escolar. A interface é servida por Python e os dados são persistidos em SQLite no arquivo `combatbullyin.db`.

## Executar

Requer Python 3.9 ou superior. No PowerShell:

```powershell
python .\app.py
```

Abra <http://127.0.0.1:8000>.

## Acesso inicial

- Usuário: `admin`
- Senha: `ademin`

Depois do primeiro acesso, use **Minha senha** para trocar a senha. Em **Usuários**, o administrador pode criar operadores e remover operadores existentes.

Na área da equipe, a aba **Protocolos** reúne as reclamações recebidas com tipo de agressão,
data, hora e relato. Administradores e operadores podem atualizar o status e encaminhar cada
demanda para um usuário responsável. Os relatos enviados pela tela pública são persistidos no
SQLite e ficam disponíveis para a equipe após o login.

Os relatos também aceitam anexos de áudio, vídeo, imagem, PDF e arquivos de texto. São aceitos
até 8 arquivos por reclamação, com limite de 8 MB por arquivo e 20 MB no conjunto. Os arquivos
ficam armazenados no banco configurado (SQLite local ou PostgreSQL no Vercel) e os downloads são
protegidos por sessão autenticada da equipe.

## Deploy no Vercel

O deploy serverless usa [`api/index.py`](./api/index.py) com Flask e PostgreSQL. Configure as
variáveis `DATABASE_URL` (Neon PostgreSQL com `sslmode=require`) e `SESSION_SECRET` no projeto
Vercel. O schema é criado automaticamente na primeira requisição.

As senhas não são armazenadas em texto puro: são protegidas com PBKDF2-HMAC-SHA256 e salt individual. As sessões usam cookie HTTP-only e expiram após 8 horas.
