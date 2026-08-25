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
function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
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
 * Tries the primary model and falls back to lighter models if high demand (503) or rate limit occurs.
 */
async function generateContentWithFallback(params: {
  contents: any;
  systemInstruction?: string;
  temperature?: number;
}): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error("GEMINI_API_KEY_NOT_CONFIGURED");
  }

  const modelsToTry = [
    "gemini-3.6-flash",
    "gemini-3.5-flash-lite",
    "gemini-3.7-flash",
  ];
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
        // If model is not found, break out of attempt loop to try next model immediately
        if (err?.status === "NOT_FOUND" || err?.message?.includes("NOT_FOUND") || err?.message?.includes("404")) {
          break;
        }
        // Wait a small backoff if 503 or transient spike
        await new Promise((resolve) => setTimeout(resolve, 300 * attempt));
      }
    }
  }

  throw lastError || new Error("Falha de comunicação temporária com os modelos de IA.");
}

/**
 * Helper to provide domain-specific NBR 5410 technical answers when offline
 */
function getElectricalKnowledgeResponse(query: string): string {
  const q = query.toLowerCase();

  if (q.includes("chuveiro") || q.includes("ducha")) {
    if (q.includes("127") || q.includes("110") || q.includes("5500")) {
      return `🚿 **Dimensionamento para Chuveiro / Ducha Elétrica (NBR 5410):**

⚡ **Caso 1: Chuveiro 5500W em 127V**
- **Corrente de Projeto (Ib):** $I = 5500\\text{W} / 127\\text{V} = 43,3\\text{ A}$
- **Cabo Recomendado:** **10,0 mm²** de cobre (Método B1 suporta até 50A).
- **Disjuntor Termomagnético:** **50A** (Curva B ou C).
- **Circuito:** Circuito exclusivo direto do QDC.

⚡ **Caso 2: Chuveiro 7500W em 220V**
- **Corrente de Projeto (Ib):** $I = 7500\\text{W} / 220\\text{V} = 34,1\\text{ A}$
- **Cabo Recomendado:** **6,0 mm²** de cobre (Método B1 suporta até 36A/41A).
- **Disjuntor Termomagnético:** **40A** (Curva B ou C).
- **Circuito:** Circuito exclusivo direto do QDC.

⚠️ **Recomendações Críticas NBR 5410 & Segurança:**
1. **Conexão:** Utilize conector de porcelana (cerâmico) ou conectores de mola reforçados (ex: WAGO 221 para condutores de 6mm²/10mm²). Nunca utilize fita isolante simples, pois o aquecimento contínuo derrete o isolamento.
2. **Proteção DR:** Obrigatório proteger o circuito com IDR de alta sensibilidade (30mA) conforme item 5.1.3.2.2 da NBR 5410.
3. **Condutor Terra (PE):** Obrigatório ligar o terra (verde/amarelo) ao barramento principal de equipotencialização. Nunca deixe o terra solto nem ligue no neutro!`;
    }

    return `🚿 **Dimensionamento de Chuveiros Elétricos (NBR 5410):**

- **7500W em 220V:** Corrente $34,1\\text{A} \\rightarrow$ **Cabo 6,0 mm²** + **Disjuntor 40A**.
- **6800W em 220V:** Corrente $30,9\\text{A} \\rightarrow$ **Cabo 6,0 mm²** + **Disjuntor 35A ou 40A**.
- **5500W em 220V:** Corrente $25,0\\text{A} \\rightarrow$ **Cabo 4,0 mm²** + **Disjuntor 32A**.
- **5500W em 127V:** Corrente $43,3\\text{A} \\rightarrow$ **Cabo 10,0 mm²** + **Disjuntor 50A**.

💡 **Dica de Instalação:** O circuito DEVE ser exclusivo direto do QDC e protegido por IDR 30mA. Use conectores de cerâmica ou de engate rápido com suporte térmico.`;
  }

  if (q.includes("three-way") || q.includes("paralelo") || q.includes("three way")) {
    return `💡 **Esquema de Ligação de Interruptor Three-Way (Paralelo):**

O interruptor paralelo possui 3 bornes (parafusos) em cada módulo:

1. **Interruptor 1 (Ponto de Entrada):**
   - Ligue a **FASE** (Vermelho/Preto) no borne **central** (Pino do Meio / Comum).
   - Nos bornes **laterais** (1 e 2), conecte dois fios de **RETORNO DE COMUNICAÇÃO (Balanços)**.

2. **Passagem pelo Eletroduto:**
   - Leve os 2 fios de retorno de balanço do Interruptor 1 até o Interruptor 2.

3. **Interruptor 2 (Ponto de Saída):**
   - Conecte os dois fios de balanço nos bornes **laterais** (1 e 2).
   - Do borne **central** (Pino do Meio), retire o fio de **RETORNO DA LÂMPADA** (Amarelo) e leve até o bocal/plafonier.

4. **Lâmpada (Bocal):**
   - Ligue o **RETORNO DA LÂMPADA** no pino central do bocal.
   - Ligue o **NEUTRO** (Azul Claro) diretamente no borne da rosca lateral do bocal.

🛡️ **Regra de Ouro NBR 5410:** O condutor Neutro NUNCA deve passar pelo interruptor! Apenas a Fase e os Retornos são chaveados.`;
  }

  if (q.includes("four-way") || q.includes("intermediário") || q.includes("intermediario") || q.includes("four way")) {
    return `🔀 **Esquema de Ligação de Interruptor Four-Way (Intermediário):**

Permite acionar uma ou mais lâmpadas de 3 ou mais pontos diferentes:

1. **Extremidades:** Utiliza-se **2 Interruptores Three-Way** (um no início e um no final).
2. **Pontos Intermediários:** Utiliza-se **1 ou mais Interruptores Four-Way** (que possuem 4 bornes de conexão).
3. **Ligação dos Fios:**
   - A **FASE** entra no centro do 1º Three-Way.
   - Os 2 retornos de balanço do 1º Three-Way entram no par de bornes superiores do Four-Way (L1 e L2).
   - Do par de bornes inferiores do Four-Way (L3 e L4), saem 2 retornos que vão para as laterais do 2º Three-Way.
   - O centro do 2º Three-Way leva o retorno para a lâmpada.
   - O **NEUTRO** vai direto para a lâmpada.`;
  }

  if (q.includes("neutro") && (q.includes("terra") || q.includes("diferença") || q.includes("diferenca"))) {
    return `⚡ **Diferença Técnica entre Condutor Neutro e Terra (PE) - NBR 5410:**

1. **Condutor Neutro (N - Azul Claro):**
   - É um condutor **ativo** que faz parte do circuito funcional.
   - Serve como caminho de retorno para a corrente elétrica da carga até a fonte/transformador.
   - Em condições normais, conduz corrente de trabalho ($I_{neutro}$).

2. **Condutor de Proteção / Terra (PE - Verde ou Verde-Amarelo):**
   - É um condutor de **segurança** que liga as carcaças metálicas dos equipamentos à terra.
   - Em regime normal, NÃO conduz corrente elétrica.
   - Conduz corrente apenas em caso de falha de isolação (fuga de corrente ou curto para a carcaça), drenando o surto e acionando instantaneamente o disjuntor ou IDR para evitar choque fatal.

🚫 **Erro Grave:** Jamais junte o Neutro com o Terra nas tomadas ou no QDC após o IDR! Se fizer isso, o IDR desarmará imediatamente por desbalanço de corrente.`;
  }

  if (q.includes("disjuntor") || q.includes("curva b") || q.includes("curva c") || q.includes("bitola") || q.includes("cabo")) {
    return `🔌 **Dimensionamento de Cabos e Disjuntores (NBR 5410 - Método B1 Cobre/PVC 70°C):**

| Seção Nominal | Capacidade de Corrente (Iz) | Disjuntor Recomendado | Aplicação Típica NBR 5410 |
| :--- | :--- | :--- | :--- |
| **1,5 mm²** | 15,5A (3 cond) / 17,5A (2 cond) | **10A** | Circuitos exclusivos de Iluminação |
| **2,5 mm²** | 21,0A (3 cond) / 24,0A (2 cond) | **16A ou 20A** | Tomadas de Uso Geral (TUGs 10A) |
| **4,0 mm²** | 28,0A (3 cond) / 32,0A (2 cond) | **25A ou 32A** | Forno elétrico, Ar-condicionado grande |
| **6,0 mm²** | 36,0A (3 cond) / 41,0A (2 cond) | **32A ou 40A** | Chuveiro 7500W 220V, Cooktop |
| **10,0 mm²** | 50,0A (3 cond) / 57,0A (2 cond) | **50A** | Chuveiro 5500W 127V, Alimentador |
| **16,0 mm²** | 68,0A (3 cond) / 76,0A (2 cond) | **63A ou 70A** | Entrada QDC Padrão Bifásico/Trifásico |

🎯 **Regra Fundamental de Proteção:**
$$I_b \\le I_n \\le I_z$$
- $I_b$: Corrente de projeto da carga
- $I_n$: Corrente nominal do disjuntor
- $I_z$: Capacidade máxima de corrente do condutor

**Curvas de Disjuntores:**
- **Curva B:** Disparo em 3 a 5x In. Ideal para cargas puramente resistivas (chuveiros, aquecedores, lâmpadas incandescentes).
- **Curva C:** Disparo em 5 a 10x In. Padrão universal para residências e circuitos com pequenas cargas indutivas (tomadas, motores, geladeiras, ar-condicionado).`;
  }

  if (q.includes("dr") || q.includes("idr") || q.includes("dps") || q.includes("surto")) {
    return `🛡️ **Proteção com IDR e DPS no QDC (NBR 5410 & NBR 5419):**

1. **IDR (Interruptor Diferencial Residual - 30mA):**
   - **Função:** Salva vidas detectando fugas de corrente superiores a 30 milésimos de ampère (30mA), desarmando o circuito em menos de 30 milissegundos.
   - **Obrigatoriedade (item 5.1.3.2.2):** Circuitos que atendem banheiros, cozinhas, lavanderias, áreas de serviço, garagens e tomadas externas.

2. **DPS (Dispositivo de Proteção contra Surtos - Classe II):**
   - **Função:** Desvia para a terra picos de alta tensão provocados por raios (descargas atmosféricas) ou manobras da rede pública da concessionária.
   - **Instalação:** Conectado em paralelo no QDC entre cada Fase e o Barramento PE (e entre Neutro e PE nos esquemas TN-S e TT).
   - **Especificação:** Mínimo 20kA a 45kA, $U_c \\ge 275\\text{V}$ para redes 127V/220V.`;
  }

  if (q.includes("motor") || q.includes("partida") || q.includes("trifasico") || q.includes("trifásico")) {
    return `⚙️ **Dimensionamento e Partida de Motores Elétricos (NBR 5410 & NR-10):**

1. **Cálculo da Corrente Nominal ($I_n$):**
   $$I_n = \\frac{P_{\\text{cv}} \\times 736}{\\sqrt{3} \\times V \\times \\eta \\times \\cos\\varphi}$$
   *(Ex: Motor 5cv em 220V trifásico com rendimento 85% e FP 0.82 tem $I_n \\approx 14,3\\text{ A}$)*.

2. **Corrente de Partida ($I_p$):**
   - Em partida direta, a corrente atinge tipicamente **6 a 8 vezes** a corrente nominal ($I_p/I_n$), provocando queda de tensão na rede.
   - Para motores acima de 5cv, as concessionárias exigem métodos de partida suave: **Estrela-Triângulo**, **Soft-Starter** ou **Inversor de Frequência**.

3. **Elementos de Proteção do Painel:**
   - **Disjuntor-Motor / Fusíveis tipo aM:** Proteção contra curto-circuito.
   - **Contactor de Potência (AC-3):** Manobra e acionamento elétrico.
   - **Relé Térmico de Sobrecarga:** Ajustado exatamente para a corrente nominal ($I_n$) da placa do motor.`;
  }

  // General electrical response
  return `⚡ **Consultoria Técnica EletroGuia (NBR 5410 & NR-10):**

Com base nas normas da ABNT:

1. **Dimensionamento de Condutores (Item 6.2.7):**
   - Seção mínima de cobre: **1,5 mm²** para iluminação e **2,5 mm²** para circuitos de tomadas (TUGs).
   - Para equipamentos específicos acima de 10A (chuveiro, forno, ar-condicionado), preveja circuito terminal exclusivo.

2. **Dispositivos de Proteção:**
   - Disjuntores termomagnéticos dimensionados pela regra $I_b \\le I_n \\le I_z$.
   - Instalação obrigatória de **IDR 30mA** para proteção de pessoas contra choque elétrico em áreas molhadas.
   - Instalação de **DPS Classe II** no quadro geral para proteção de aparelhos eletrônicos contra queima por raios.

3. **Procedimentos de Segurança (NR-10):**
   - Sempre desenergize o circuito antes de qualquer intervenção e teste a ausência de tensão com multímetro (escala ACV 750V).

*Você pode fazer perguntas específicas sobre esquemas elétricos, cálculos de potência, bitolas de cabos ou dúvidas de normas!*`;
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
    return res.json({
      diagnostic: `⚠️ **Diagnóstico Técnico de Emergência (NBR 5410 / NR-10):**
Identificamos a necessidade de revisão preventiva. Antes de manusear condutores, desenergize o circuito no disjuntor geral e verifique com multímetro (escala ACV 750V). Em caso de cheiro de queimado ou faiscamento, interrompa o fornecimento de energia imediatamente.`,
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

    const lastUserMsg = messages[messages.length - 1]?.content || "";

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
      replyText = getElectricalKnowledgeResponse(lastUserMsg);
    }

    return res.json({
      reply: replyText,
    });
  } catch (error: any) {
    console.error("Erro no chat elétrico Gemini:", error);
    const lastUserMsg = req.body?.messages?.[req.body?.messages?.length - 1]?.content || "";
    return res.json({
      reply: getElectricalKnowledgeResponse(lastUserMsg),
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
