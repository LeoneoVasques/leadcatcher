import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export const dynamic = 'force-dynamic';

export async function POST(request) {
  try {
    const body = await request.json();
    const { empresa, telefone, email } = body;

    if (!empresa?.trim() || !telefone?.trim() || !email?.trim()) {
      return NextResponse.json(
        { error: 'Todos os campos são obrigatórios' },
        { status: 400 }
      );
    }

    const cleanEmpresa = empresa.trim();
    const cleanTelefone = telefone.trim();
    const cleanEmail = email.trim();

    // Data e Hora no fuso de Brasília
    const now = new Date();
    const dataHora = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });

    // 1. GOOGLE SHEETS: Envia para o Webhook do Google Apps Script (Principal)
    const googleWebhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL;
    let googleSyncStatus = 'skipped';

    if (googleWebhookUrl && googleWebhookUrl.trim()) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const googleRes = await fetch(googleWebhookUrl.trim(), {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            dataHora,
            empresa: cleanEmpresa,
            telefone: cleanTelefone,
            email: cleanEmail,
          }),
          signal: controller.signal,
          redirect: 'follow',
        });
        clearTimeout(timeoutId);

        if (googleRes.ok) {
          googleSyncStatus = 'success';
          console.log('📊 [Google Sheets] Lead gravado na planilha com sucesso!');
        } else {
          googleSyncStatus = 'failed_http_' + googleRes.status;
          console.warn(`⚠️ [Google Sheets] Resposta com erro da planilha: ${googleRes.status}`);
        }
      } catch (gErr) {
        googleSyncStatus = 'error_' + gErr.name;
        console.error('⚠️ [Google Sheets] Erro de rede/conexão com a planilha:', gErr.message);
      }
    } else {
      console.warn('⚠️ [Aviso] GOOGLE_SHEET_WEBHOOK_URL não definida nas variáveis de ambiente!');
    }

    // 2. BACKUP LOCAL: Salva no CSV somente se o disco local for gravável (ex: rodando localmente)
    let csvSaved = false;
    try {
      const filePath = path.join(process.cwd(), 'leads.csv');
      const safeEmpresa = cleanEmpresa.replace(/,/g, ' ');
      const safeTelefone = cleanTelefone.replace(/,/g, ' ');
      const safeEmail = cleanEmail.replace(/,/g, ' ');
      const csvLine = `${dataHora},${safeEmpresa},${safeTelefone},${safeEmail}\n`;

      try {
        await fs.access(filePath);
        await fs.appendFile(filePath, csvLine, 'utf8');
        csvSaved = true;
      } catch {
        const header = 'Data/Hora,Empresa,Telefone,Email\n';
        await fs.writeFile(filePath, header + csvLine, 'utf8');
        csvSaved = true;
      }
    } catch {
      // Em ambientes de nuvem serverless (como Vercel), o disco é protegido contra escrita.
      // Ignora silenciosamente para não interromper o fluxo do Google Sheets.
      csvSaved = false;
    }

    // Log legível no servidor
    console.log('\n==============================');
    console.log('✅ NOVO LEAD RECEBIDO:');
    console.log(`Data/Hora      : ${dataHora}`);
    console.log(`Empresa/Nome   : ${cleanEmpresa}`);
    console.log(`Telefone       : ${cleanTelefone}`);
    console.log(`E-mail         : ${cleanEmail}`);
    console.log(`Google Sheets  : ${googleSyncStatus}`);
    console.log(`CSV Backup     : ${csvSaved ? 'Gravado' : 'Ignorado (Nuvem/Serverless)'}`);
    console.log('==============================\n');

    // Se salvou no Google Sheets ou no CSV, consideramos sucesso
    if (googleSyncStatus === 'success' || csvSaved) {
      return NextResponse.json(
        { 
          message: 'Lead registrado com sucesso!',
          googleSynced: googleSyncStatus === 'success'
        }, 
        { status: 201 }
      );
    }

    // Se nenhum dos dois funcionou (ex: faltou configurar variável na Vercel)
    return NextResponse.json(
      { 
        error: 'Não foi possível gravar o lead na planilha. Verifique a variável GOOGLE_SHEET_WEBHOOK_URL na Vercel.' 
      },
      { status: 500 }
    );
  } catch (error) {
    console.error('Erro ao processar lead:', error);
    return NextResponse.json(
      { error: 'Erro interno ao salvar dados. Tente novamente.' },
      { status: 500 }
    );
  }
}
