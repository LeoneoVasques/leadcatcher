# SwitchPay Leadcatcher 🚀

Sistema inteligente de captação de leads via QR Code para feiras, eventos e stands comerciais, com sincronização em tempo real com **Google Planilhas (Google Sheets)** e backup de contingência local.

---

## 📱 Fluxo de Funcionamento

1. **Totem / Monitor (`/display`)**:
   - Exibe um painel em alta resolução com a marca SwitchPay e o QR Code dinâmico do túnel seguro.
2. **Formulário Mobile (`/`)**:
   - O visitante aponta o celular, abre a página responsiva e preenche Nome/Empresa, Telefone com máscara automática e E-mail.
3. **Onde os Dados São Guardados**:
   - **Google Sheets**: Cada novo cadastro é inserido automaticamente em uma linha na sua planilha do Google Drive.
   - **Backup Local (`leads.csv`)**: Caso ocorra alguma oscilação de internet no evento, os dados também ficam gravados localmente no arquivo CSV.

---

## 📊 Passo a Passo: Integrar com sua Planilha Google

Criamos um script pronto para você em [`google-apps-script.js`](./google-apps-script.js). Siga os passos:

1. Acesse o [Google Sheets](https://sheets.google.com) e crie uma nova planilha (ex: **Leads SwitchPay Evento**).
2. No menu superior da planilha, clique em **Extensões** > **Apps Script**.
3. Apague qualquer código existente no editor e cole todo o conteúdo do arquivo [`google-apps-script.js`](./google-apps-script.js).
4. No canto superior direito, clique no botão azul **Implantar** (Deploy) > **Nova implantação** (New deployment).
5. Clique no ícone de engrenagem ao lado de "Selecionar tipo" e escolha **App da Web** (Web app).
6. Preencha os campos:
   - **Descrição**: `Webhook Leadcatcher`
   - **Executar como**: `Eu (seu-email@gmail.com)`
   - **Quem tem acesso**: `Qualquer pessoa` (Anyone) *(importante para o sistema conseguir enviar os dados sem pedir login do Google)*.
7. Clique em **Implantar**. O Google vai pedir autorização da sua conta — basta aceitar.
8. Copie a **URL do app da Web** gerada (algo parecido com `https://script.google.com/macros/s/AKfycb.../exec`).
9. Abra o arquivo `.env.local` na raiz deste projeto e cole a URL:
   ```env
   GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/SEU_ID_COPIADO/exec
   ```

Pronto! A partir desse momento, todo cadastro feito no celular cairá instantaneamente na sua planilha.

---

## 💻 Como Rodar o Sistema

### 1. Iniciar o servidor web
```bash
yarn dev
# ou para versão de produção:
yarn build && yarn start
```

### 2. Iniciar o túnel público do QR Code (em outro terminal)
```bash
node run-tunnel.js
```

### 3. Exibir o Totem no evento
Abra no navegador da máquina/TV conectada:
```
http://localhost:3000/display
```
Pressione `F11` para colocar em tela cheia.
