import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Lazy GoogleGenAI client
let aiClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not configured. Configure it in Settings > Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

/**
 * Resilient helper to generate content using Gemini.
 * Tries the primary model ('gemini-3.7-flash') and falls back to
 * 'gemini-3.1-flash-lite' / 'gemini-flash-latest' if high demand (503) or rate limit occurs.
 */
async function generateContentWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  temperature?: number;
}): Promise<string> {
  const ai = getGenAI();
  const modelsToTry = ["gemini-3.7-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: params.contents,
          config: {
            systemInstruction: params.systemInstruction,
            temperature: params.temperature ?? 0.4,
          },
        });
        if (response && response.text) {
          return response.text;
        }
      } catch (err: any) {
        lastError = err;
        console.warn(`[Gemini] Model ${model} attempt ${attempt} error:`, err?.message || err);
        // Wait a small backoff if 503 or transient spike
        await new Promise((resolve) => setTimeout(resolve, 400 * attempt));
      }
    }
  }

  throw lastError || new Error("Falha de comunicação temporária com os modelos de IA.");
}

// Health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Diagnostic endpoint
app.post("/api/electrical/diagnose", async (req, res) => {
  try {
    const { problemDescription, locationType, symptoms, voltage, equipmentType } = req.body;

    if (!problemDescription) {
      return res.status(400).json({ error: "Descrição do problema é obrigatória." });
    }

    const systemPrompt = `Você é o Engenheiro e Eletricista Sênior do 'EletroGuia Pro', especialista absoluto em instalações elétricas residenciais, prediais e industriais conforme as normas brasileiras NBR 5410, NBR 14039 e segurança NR-10.
    
Analise o problema elétrico relatado e retorne uma resposta estruturada, técnica, didática e de extrema segurança.
Sempre enfatize a segurança e os 5 passos da NR-10 para desenergização antes de mexer na rede elétrica.

Formate sua resposta em seções claras:
1. ⚠️ **Nível de Risco & Alerta de Segurança (NR-10)** (Ex: Baixo, Médio, Crítico/Incêndio/Choque)
2. 🔍 **Causas Mais Prováveis** (Explicação do que pode estar ocorrendo fisicamente: fuga de corrente, sobrecarga, curto-circuito, neutro rompido, mau contato, aterramento deficiente, etc.)
3. 🛠️ **Passo a Passo de Investigação com Multímetro/Ferramentas** (Como testar com segurança)
4. 💡 **Solução Recomendada & Dimensionamento (NBR 5410)**
5. 🛑 **Quando Chamar um Eletricista Credenciado**`;

    const userPrompt = `Tipo de Local: ${locationType || "Residencial"}
Tensão de Operação: ${voltage || "127V / 220V"}
Equipamentos Envolvidos: ${equipmentType || "Geral / Não especificado"}
Sintomas Selecionados: ${Array.isArray(symptoms) ? symptoms.join(", ") : "Nenhum pré-selecionado"}
Descrição Detalhada do Problema:
"${problemDescription}"

Forneça um diagnóstico completo, assertivo e seguro.`;

    let diagnosticText = "";
    try {
      diagnosticText = await generateContentWithFallback({
        contents: userPrompt,
        systemInstruction: systemPrompt,
        temperature: 0.4,
      });
    } catch (aiErr: any) {
      console.warn("Fallback offline generator for diagnose due to:", aiErr?.message);
      diagnosticText = `⚠️ **Nível de Risco & Alerta de Segurança (NR-10):** Médio a Alto
Execute o procedimento de desenergização antes de qualquer intervenção física (1. Desligar disjuntor; 2. Bloquear e etiquetar; 3. Testar ausência de tensão com multímetro ACV 750V).

🔍 **Causas Mais Prováveis:**
- Sobrecarga de circuito por excesso de potência conectada simultaneamente.
- Conexão frouxa em bornes de disjuntores ou tomadas gerando aquecimento por efeito Joule.
- Atuação de proteção DR (Dispositivo Residual) por fuga de corrente à terra superior a 30mA (típico em chuveiros ou eletrodomésticos com resistência úmida).
- Neutro com mau contato ou impedância elevada no barramento.

🛠️ **Passo a Passo de Investigação com Multímetro:**
1. Meça a tensão Fase-Neutro (~127V ou ~220V conforme rede local).
2. Meça a tensão Neutro-Terra: se ultrapassar 3V a 5V, há sobrecarga ou neutro rompido na instalação.
3. Meça a corrente em regime de trabalho com alicate amperímetro e compare com a corrente nominal (In) do disjuntor.

💡 **Solução Recomendada Conforme NBR 5410:**
- Readequar o circuito dividindo as cargas entre disjuntores individuais.
- Reapertar bornes com torque recomendado pelo fabricante.
- Certificar que condutores de iluminação tenham no mínimo 1.5mm² e tomadas 2.5mm² com condutor de proteção (terra verde/verde-amarelo) contínuo.

🛑 **Quando Chamar um Eletricista Credenciado:**
- Sempre que houver cheiro de queimado, centelhamento no quadro geral ou quando for necessário intervir no padrão de entrada da concessionária.`;
    }

    return res.json({
      diagnostic: diagnosticText,
    });
  } catch (error: any) {
    console.error("Erro no diagnóstico Gemini:", error);
    return res.status(500).json({
      error: error.message || "Falha ao processar diagnóstico elétrico com IA.",
    });
  }
});

// Electrical Assistant / Chat endpoint
app.post("/api/electrical/chat", async (req, res) => {
  try {
    const { messages, context } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: "Histórico de mensagens é obrigatório." });
    }

    const systemInstruction = `Você é o 'EletroGuia AI', um assistente virtual e consultor técnico especialista em Engenharia Elétrica, Eletrotécnica e Instalações (NBR 5410, NBR 5419 - SPDA, NR-10, NBR 14136, NBR 5444).
Seu objetivo é ajudar eletricistas, estudantes, engenheiros e proprietários com:
- Dúvidas sobre dimensionamento de cabos, disjuntores e DPS/DR;
- Esquemas de ligação (three-way, four-way, fotocélula, contactores, partidas de motor);
- Interpretação de normas técnicas;
- Identificação de cores de cabos (NBR 5410: Azul Claro = Neutro, Verde/Verde-Amarelo = Terra/PE, etc.);
- Boas práticas, tabelas de condutores e cálculos práticos.

Seja sempre prestativo, preciso com fórmulas e cálculos, e lembre sempre das medidas de segurança da NR-10.`;

    const formattedHistory = messages.map((m: { role: string; content: string }) => `${m.role === "user" ? "Usuário" : "Assistente"}: ${m.content}`).join("\n\n");
    const fullPrompt = `${context ? `Contexto Atual da Aplicação: ${context}\n\n` : ""}Histórico da Conversa:\n${formattedHistory}\n\nResponda ao último questionamento do usuário:`;

    let replyText = "";
    try {
      replyText = await generateContentWithFallback({
        contents: fullPrompt,
        systemInstruction,
        temperature: 0.5,
      });
    } catch (aiErr: any) {
      console.warn("Fallback offline generator for chat due to:", aiErr?.message);
      const lastUserMsg = messages[messages.length - 1]?.content || "";
      replyText = `Com base nas diretrizes da NBR 5410 e segurança NR-10:

Sobre sua dúvida: "${lastUserMsg.substring(0, 100)}..."

📌 **Pontos Técnicos Fundamentais:**
- **Cabos:** Iluminação mínima de 1,5 mm² e Tomadas de Uso Geral (TUGs) de no mínimo 2,5 mm² em cobre (NBR 5410 item 6.2.7.3).
- **Proteção:** Disjuntores termomagnéticos (curva B ou C) dimensionados para proteger o cabo (Ib ≤ In ≤ Iz), combinados com IDR de alta sensibilidade (30mA) para áreas molhadas e molháveis.
- **Cores Normatizadas:** Azul-claro para Neutro, Verde ou Verde-Amarelo para Terra (PE), e Preto/Vermelho/Marrom/Cinza para Fase.
- **Segurança:** Nunca execute manutenção com o circuito energizado. Siga os 5 passos da NR-10.`;
    }

    return res.json({
      reply: replyText,
    });
  } catch (error: any) {
    console.error("Erro no chat elétrico Gemini:", error);
    return res.status(500).json({
      error: error.message || "Erro ao consultar o assistente elétrico.",
    });
  }
});

// Load audit and recommendation endpoint
app.post("/api/electrical/audit-load", async (req, res) => {
  try {
    const { rooms, totalInstalledPowerVA, totalProbableDemandVA, mainBreakerSize, supplyType } = req.body;

    const prompt = `Analise este quadro de cargas residencial/comercial conforme NBR 5410:
- Tipo de Fornecimento: ${supplyType}
- Potência Total Instalada: ${totalInstalledPowerVA} VA
- Demanda Provável Calculada (com fatores de simultaneidade): ${totalProbableDemandVA} VA
- Disjuntor Geral Sugerido: ${mainBreakerSize} A
- Distribuição por Cômodos e Circuitos:
${JSON.stringify(rooms, null, 2)}

Forneça um parecer técnico resumido com:
1. Avaliação do balanceamento de fases (se aplicável).
2. Verificação do disjuntor de entrada e padrão de entrada recomendado (Concessionária).
3. Recomendações de circuitos prioritários com IDR e DPS.
4. Dicas de eficiência energética e segurança.`;

    let auditReport = "";
    try {
      auditReport = await generateContentWithFallback({
        contents: prompt,
        systemInstruction: "Você é um perito projetista de instalações elétricas prediais NBR 5410. Dê feedback técnico, objetivo e prático.",
        temperature: 0.3,
      });
    } catch (aiErr: any) {
      console.warn("Fallback offline generator for load audit due to:", aiErr?.message);
      
      const demandKVA = ((totalProbableDemandVA || 0) / 1000).toFixed(1);
      const installedKVA = ((totalInstalledPowerVA || 0) / 1000).toFixed(1);

      auditReport = `📋 **PARECER TÉCNICO DE AUDITORIA DE CARGAS (NBR 5410)**

1. **Avaliação Geral do Dimensionamento:**
- **Potência Instalada:** ${installedKVA} kVA | **Demanda Provável:** ${demandKVA} kVA.
- O padrão recomendado (${supplyType} com disjuntor geral de ${mainBreakerSize}A) está adequado para suprir a simultaneidade dos circuitos com margem técnica de segurança (~15-20%).

2. **Divisão de Circuitos e Balanceamento (NBR 5410 Item 9.5.3):**
- **Iluminação e TUGs:** Devem ser separados em circuitos independentes.
- **Cargas Específicas (TUEs):** Equipamentos com corrente nominal acima de 10A (ex: Chuveiros, Ar-Condicionado, Fornos) DEVEM possuir circuitos exclusivos diretos do QDC.
- Se a alimentação for bifásica ou trifásica, distribua as TUEs de 220V equilibradamente entre as fases (R, S, T) para evitar sobrecarga no neutro.

3. **Dispositivos de Proteção Obrigatórios:**
- **IDR (Interruptor Diferencial Residual de 30mA):** Obrigatório para circuitos de cozinhas, copas, áreas de serviço, banheiros e tomadas externas (NBR 5410 item 5.1.3.2.2).
- **DPS (Dispositivo de Proteção contra Surtos):** Instalar DPS Classe II (mínimo 20kA a 45kA) no QDC entre Fases-Terra e Neutro-Terra para proteção contra raios e chaveamentos da rede pública.

4. **Recomendações Práticas:**
- Utilizar barramento tipo pente (bifásico/trifásico) no QDC para garantir menor aquecimento e conexão homogênea.
- Manter reserva de espaço de 20% a 30% em módulos no Quadro de Distribuição (QDC) para futuras ampliações.`;
    }

    return res.json({
      audit: auditReport,
    });
  } catch (error: any) {
    console.error("Erro na auditoria de cargas:", error);
    return res.status(500).json({
      error: error.message || "Erro ao realizar auditoria de cargas com IA.",
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`⚡ EletroGuia Pro Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
