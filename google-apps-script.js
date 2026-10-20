/**
 * GOOGLE APPS SCRIPT - SWITCHPAY LEADCATCHER
 * 
 * Como configurar:
 * 1. Abra sua planilha no Google Sheets (Planilhas Google).
 * 2. No menu superior, clique em "Extensões" > "Apps Script".
 * 3. Apague o código que estiver lá e cole todo este arquivo.
 * 4. Clique em "Implantar" (Deploy) > "Nova implantação" (New deployment).
 * 5. Clique no ícone de engrenagem ao lado de "Selecionar tipo" e escolha "App da Web" (Web app).
 * 6. Preencha as configurações:
 *    - Descrição: Webhook Leadcatcher
 *    - Executar como: "Eu (seu email)"
 *    - Quem tem acesso: "Qualquer pessoa" (Anyone)
 * 7. Clique em "Implantar" (Deploy) e conceda as permissões solicitadas.
 * 8. Copie a "URL do app da Web" gerada (termina com /exec).
 * 9. Cole essa URL no seu arquivo .env.local na variável GOOGLE_SHEET_WEBHOOK_URL.
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  // Aguarda até 30 segundos para evitar concorrência caso várias pessoas enviem juntas
  lock.tryLock(30000);

  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);

    // Se a planilha estiver vazia, cria o cabeçalho estilizado automaticamente
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Data/Hora", "Nome / Empresa", "Telefone", "E-mail"]);
      var headerRange = sheet.getRange(1, 1, 1, 4);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#15c2ea");
      headerRange.setFontColor("#ffffff");
      headerRange.setHorizontalAlignment("center");
      sheet.setFrozenRows(1);
    }

    var dataHora = data.dataHora || Utilities.formatDate(new Date(), "America/Sao_Paulo", "dd/MM/yyyy HH:mm:ss");
    var empresa = data.empresa || "";
    var telefone = data.telefone || "";
    var email = data.email || "";

    sheet.appendRow([dataHora, empresa, telefone, email]);

    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Lead registrado na planilha com sucesso" }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);

  } finally {
    lock.releaseLock();
  }
}

// Endpoint de teste (GET) para verificar se o script está online
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ 
      status: "online", 
      message: "Webhook do Leadcatcher no Google Sheets ativo e pronto!" 
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
