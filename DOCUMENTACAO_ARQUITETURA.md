# Arquitetura e Organização do Sistema Veterinário (Web App)

Este documento explica a estrutura do projeto, como o "backend" funciona e como o código está organizado para rodar como uma aplicação web no navegador.

## 1. Arquitetura: Frontend + Backend Serverless

O sistema foi construído para ser um **Web App moderno**, acessível diretamente pelo navegador (sem necessidade de instalação). 

Para garantir velocidade, escalabilidade e funcionamento em tempo real, utilizamos uma arquitetura **Serverless (Sem Servidor Dedicado)**:
- **Frontend:** Next.js (React) com Tailwind CSS. Responsável por toda a interface, telas e interações do usuário.
- **Backend:** Firebase Firestore. Um banco de dados NoSQL em nuvem do Google. 

**Onde está o Backend?**
Em vez de termos uma pasta separada com um servidor Node.js/Express tradicional, o nosso frontend se comunica diretamente e de forma segura com o Firebase através da camada de dados localizada na pasta `/lib/api.ts`. O Firebase cuida da autenticação, armazenamento de dados e regras de segurança na nuvem.

---

## 2. Organização das Pastas (Estrutura do Código)

O código está organizado dentro da pasta `frontend/` da seguinte maneira:

### 📁 `/pages` (Rotas e Telas do Web App)
Aqui ficam as páginas principais do sistema. O Next.js transforma cada arquivo aqui em uma URL acessível no navegador.
- `index.tsx`: O Dashboard inicial (tela principal).
- `agendamentos.tsx`: Tela de calendário e gestão de horários.
- `veterinario.tsx`: Tela do painel clínico (internações, prontuários, etc).
- `clientes.tsx`, `animais.tsx`, `financeiro.tsx`, `produtos.tsx`: Telas de listagem e gestão.
- `_app.tsx`: O arquivo raiz que engloba todas as páginas (onde o Layout principal é injetado).

### 📁 `/components` (Interface Visual e Blocos de Montagem)
Contém pedaços de interface que podem ser reutilizados em várias telas.
- **`/ui`**: Componentes base do sistema de design (Botões, Inputs, Modais, Cards). Gerados via biblioteca `shadcn/ui`.
- **`/veterinario`**: Componentes específicos da área clínica (ex: `AgendarProcedimento.tsx`, `ProntuarioView.tsx`, `PrescriptionBuilder.tsx`).
- **`/financeiro`**: Componentes do módulo financeiro (ex: `VendaForm.tsx`).
- **`/marketing`**: Componentes de campanhas e promoções.
- `Layout.tsx`: O esqueleto da página (Menu lateral, barra superior) que se repete em todas as telas.
- `InternacaoForm.tsx`, `AgendaPorProfissional.tsx`: Formulários e listas complexas.

### 📁 `/lib` (O "Backend" e Regras de Negócio)
Esta é a pasta mais importante para a lógica do sistema. É aqui que o frontend conversa com o banco de dados.
- `api.ts`: **O coração do nosso Backend.** Contém todas as funções de CRUD (Criar, Ler, Atualizar, Deletar) para cada entidade do sistema (Clientes, Animais, Internações, etc). Ele traduz as ações do usuário em comandos para o banco de dados.
- `firebase.ts`: Arquivo de configuração que conecta o Web App ao banco de dados em nuvem do Google.
- `utils.ts`: Funções utilitárias (como formatação de classes CSS).

### 📁 `/context` (Estado Global)
- `AuthContext.tsx`: Gerencia quem está logado no sistema. Controla as sessões, login e logout, garantindo que apenas usuários autorizados acessem as telas.

---

## 3. Como os Dados Fluem (Exemplo Prático)

Quando um veterinário registra uma **Nova Internação**:
1. **Frontend (`/components/InternacaoForm.tsx`)**: O usuário preenche o formulário na tela e clica em "Salvar".
2. **Ponte (`React Query`)**: O componente chama uma "Mutation" (mutação) para avisar que dados estão sendo alterados.
3. **Backend/API (`/lib/api.ts`)**: A função `api.entities.Internacao.create(payload)` é acionada. Ela pega os dados, adiciona a data de criação e envia para a nuvem.
4. **Banco de Dados (Firebase)**: Recebe os dados, valida as regras de segurança e salva na coleção `internacoes`.
5. **Retorno**: O Firebase avisa que deu certo, o React Query atualiza a lista na tela automaticamente sem precisar recarregar a página.

---

## 4. Próximos Passos e Escalabilidade

O sistema já é um Web App completo. Como o backend é gerenciado pelo Firebase, você não precisa se preocupar com infraestrutura de servidores. 

Se no futuro o sistema precisar de tarefas em segundo plano pesadas (como processamento de pagamentos complexos ou envio de relatórios em PDF por e-mail de madrugada), podemos expandir o backend criando **Firebase Cloud Functions** (funções que rodam na nuvem acionadas por eventos), mantendo a mesma organização limpa atual.
