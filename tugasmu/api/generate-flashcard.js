import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res){

  const { text } = req.body;

  try{

    const aiResponse = await openai.chat.completions.create({
      model:"gpt-4o-mini",
      messages:[{
        role:"user",
        content: `
Buat 5 flashcard.

WAJIB:
- JSON VALID
- TANPA markdown

Format:
[
  {
    "term": "...",
    "definition": "..."
  }
]

Teks:
${text.substring(0, 3000)}
`
      }]
    });

    let output = aiResponse.choices[0].message.content;

    output = output.replace(/```json/g,"").replace(/```/g,"").trim();

    res.json({ flashcards: output });

  }catch(err){
    res.status(500).json({ error:"flashcard error" });
  }

}