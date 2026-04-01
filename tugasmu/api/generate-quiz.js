import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res){

  const { text } = req.body;

  try{

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{
        role:"user",
        content: `
Buat 1 soal pilihan ganda.

WAJIB:
- JSON VALID
- TANPA markdown
- options TANPA A/B/C/D

Format:
{
  "question": "...",
  "options": ["...", "...", "...", "..."],
  "answer": "A",
  "explanation": "..."
}

Teks:
${text.substring(0, 3000)}
`
      }]
    });

    let output = aiResponse.choices[0].message.content;

    output = output.replace(/```json/g,"").replace(/```/g,"").trim();

    res.json({ quiz: output });

  }catch(err){
    res.status(500).json({ error:"quiz error" });
  }

}