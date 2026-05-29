import { GoogleGenAI, Type } from "@google/genai";
import { NextRequest, NextResponse } from "next/server";

// Initialize Gemini with server-only key and correct user agent headers
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, chapter, intention, customText, participantCount } = body;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "A chave API do Gemini está ausente nas configurações." },
        { status: 400 }
      );
    }

    if (action === "get_passage") {
      // Get a beautiful passage from Allan Kardec's "O Evangelho Segundo o Espiritismo"
      // with Spiritist commentary and reflection prompts
      const selectPrompt = chapter 
        ? `Selecione um trecho marcante e inspirador especificamente do Capítulo ${chapter} do livro 'O Evangelho Segundo o Espiritismo' de Allan Kardec.`
        : `Selecione aleatoriamente um trecho altamente consolador, inspirador e edificante de qualquer um dos 28 capítulos do livro 'O Evangelho Segundo o Espiritismo' de Allan Kardec. Prefira capítulos famosos como o Cap 5 (Bem-aventurados os aflitos), Cap 6 (O Cristo Consolador), Cap 11 (Amar o próximo como a si mesmo) ou Cap 17 (Sede Perfeitos).`;

      const prompt = `Use seu conhecimento preciso sobre a obra literária 'O Evangelho Segundo o Espiritismo' de Allan Kardec em Língua Portuguesa.
${selectPrompt}

Sua resposta de ver conter estruturadamente em formato JSON os seguintes campos:
- "chapter": o número do capítulo (um inteiro de 1 a 28)
- "chapterTitle": o título exato em português do capítulo selecionado
- "sectionTitle": o título do item ou seção lida (ex: "O Evangelho do Consolo", "A Prece", etc.)
- "text": o trecho selecionado em português, mantendo a fidelidade à tradução de Allan Kardec. (Deve ter entre 1 e 3 parágrafos curtos)
- "commentary": um comentário profundo, consolador e reflexivo segundo a visão espírita, aplicando este ensinamento ao cotidiano moderno e ao ambiente do lar. (Entre 100 e 200 palavras, em linguagem amorosa e acolhedora)
- "reflections": um array de exatamente 3 perguntas ou temas práticos e simples para a família/participantes debaterem ou refletirem durante a reunião de Evangelho no Lar.

Certifique-se de que o texto seja autêntico e de alta qualidade moral.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              chapter: { type: Type.INTEGER },
              chapterTitle: { type: Type.STRING },
              sectionTitle: { type: Type.STRING },
              text: { type: Type.STRING },
              commentary: { type: Type.STRING },
              reflections: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["chapter", "chapterTitle", "sectionTitle", "text", "commentary", "reflections"],
          },
        },
      });

      const responseText = response.text || "{}";
      return NextResponse.json(JSON.parse(responseText));

    } else if (action === "generate_prayer") {
      // Generate a heartwarming opening or closing prayer
      const prayerType = intention?.type || "abertura";
      const customizedIntention = intention?.custom || "harmonia no lar, paz espiritual e cura das dores físicas e espirituais de todos do ambiente";
      
      const prompt = `Escreva uma belíssima prece de ${prayerType === "abertura" ? "abertura" : "encerramento"} em português brasileiro, voltada para uma reunião de 'Evangelho no Lar' espírita. 
A prece deve ser sintonizada para a seguinte intenção especial: "${customizedIntention}".
A prece deve ser escrita em uma linguagem serena, poética, profunda e muito espiritualizada. Deve focar na conexão com Deus, Jesus, os Bons Espíritos e os mentores espirituais do lar. 
Deve pedir a harmonização do ambiente familiar, a fluidificação das águas, a paz planetária e o amparo a todos os necessitados.
A prece deve ter entre 3 e 5 parágrafos médios e fáceis de ler em voz alta.

Retorne no formato JSON com:
- "title": Um título bonito do portal de luz da prece (ex: "Prece de Gratidão e Luz", "Prece de Harmonização Familiar")
- "content": O texto completo da prece formatada com quebras de linha normais para parágrafos.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
            },
            required: ["title", "content"],
          },
        },
      });

      const responseText = response.text || "{}";
      return NextResponse.json(JSON.parse(responseText));

    } else if (action === "explain_custom") {
      // Explain a custom text entered by the user
      if (!customText) {
        return NextResponse.json({ error: "Nenhum texto informado para comentário." }, { status: 400 });
      }

      const prompt = `Analise o seguinte trecho ou assunto sob a ótica da Doutrina Espírita e de 'O Evangelho Segundo o Espiritismo' de Allan Kardec:
"${customText}"

Por favor, elabore um comentário profundo, focado no consolo, autoconhecimento e reforma íntima para a reunião de Evangelho no Lar.
Sua resposta de ver conter estruturadamente em formato JSON os seguintes campos:
- "title": Um título adequado para a reflexão
- "commentary": O comentário consolador e acolhedor (150-250 palavras)
- "reflections": um array contendo exatamente 3 perguntas ou temas práticos para diálogo.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              commentary: { type: Type.STRING },
              reflections: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ["title", "commentary", "reflections"],
          },
        },
      });

      const responseText = response.text || "{}";
      return NextResponse.json(JSON.parse(responseText));

    } else {
      return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
    }

  } catch (err: any) {
    console.error("Gemini API Error:", err);
    return NextResponse.json(
      { error: "Erro na geração do assistente de luz: " + (err?.message || err) },
      { status: 500 }
    );
  }
}
