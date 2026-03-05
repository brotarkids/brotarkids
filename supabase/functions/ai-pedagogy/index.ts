import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `Você é uma especialista em educação infantil brasileira, com profundo conhecimento da BNCC (Base Nacional Comum Curricular) para a Educação Infantil.

Sua tarefa é sugerir atividades pedagógicas criativas e práticas para professores de creche/pré-escola.

Diretrizes:
- Sempre referencie os campos de experiência da BNCC: O eu, o outro e o nós (EO); Corpo, gestos e movimentos (CG); Traços, sons, cores e formas (TS); Escuta, fala, pensamento e imaginação (EF); Espaços, tempos, quantidades, relações e transformações (ET)
- Use códigos BNCC corretos (ex: EI03EF01, EI02CG03)
- Adapte para a faixa etária informada
- Sugira materiais acessíveis e de baixo custo
- Inclua objetivos de aprendizagem claros
- Responda sempre em português brasileiro

Formato de resposta para cada atividade:
- **Nome da Atividade**
- **Campo de Experiência BNCC** (com código)
- **Faixa Etária**
- **Duração estimada**
- **Materiais necessários**
- **Descrição da atividade** (passo a passo)
- **Objetivos de aprendizagem**

Sugira entre 3 e 5 atividades por solicitação.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { ageRange, theme, weekDay, currentActivities } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    let userPrompt = `Sugira atividades pedagógicas`;
    if (ageRange) userPrompt += ` para crianças da faixa etária "${ageRange}"`;
    if (theme) userPrompt += ` com o tema "${theme}"`;
    if (weekDay) userPrompt += ` para ${weekDay}`;
    if (currentActivities) {
      userPrompt += `\n\nAtividades já planejadas na semana (evite repetir campos de experiência):\n${currentActivities}`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em alguns minutos." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos ao workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Erro ao gerar sugestões" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-pedagogy error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
