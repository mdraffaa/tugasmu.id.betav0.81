import multer from "multer";
import fs from "fs";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import OpenAI from "openai";

export const config = {
  api: {
    bodyParser: false,
  },
};

const upload = multer({ dest: "/tmp" });

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {

  upload.array("files")(req, res, async (err) => {

    if (err) return res.status(500).json({ error: "Upload error" });

    let extractedText = "";

    for (let file of req.files) {

      const dataBuffer = fs.readFileSync(file.path);
      const pdfData = await pdfParse(dataBuffer);

      extractedText += pdfData.text;
    }

    try {

      const prompt = `
Kamu adalah AI tutor untuk siswa SMA.

Tujuan:
- Bukan hanya merangkum
- Tapi membuat siswa BENAR-BENAR paham

Gaya penjelasan:
- Santai tapi jelas
- Seperti guru di kelas
- Tidak terlalu singkat

Gunakan format HTML:

<h2>📘 Judul Materi</h2>

<p>
Penjelasan singkat 4-6 kalimat harus menjelaskan gambaran umum materi dengan jelas.
Gunakan bahasa yang mudah dipahami siswa SMA + 1 emoji.
</p>

<h3>📌 Ringkasan:</h3>
<ul>
<li>5 sampai 7 poin penting (kalau ada pasal, wajib cantumkan)</li>
<li>Boleh pakai emoji kecil</li>
</ul>

<h3>🔥 Poin Penting:</h3>
<p>
Highlight dengan <b>bold</b> dan warna:
<span style="color:#4f46e5">contoh</span>
</p>

<h3>🧠 Kesimpulan:</h3>
<p>1 paragraf jelas</p>

<h3>✨ Tips Belajar:</h3>
<ul>
<li>2-3 tips</li>
</ul>

Aturan:
- Output HARUS HTML sederhana
- Jangan terlalu panjang
- Enak dibaca siswa SMA

Dokumen:
${extractedText.substring(0, 15000)}
`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      });

      let summary = response.choices[0].message.content;

      summary = summary
        .replace(/```html/g, "")
        .replace(/```/g, "")
        .trim();

      res.json({ summary });

    } catch (err) {
      res.json({
        summary: extractedText.substring(0, 500)
      });
    }

  });

}