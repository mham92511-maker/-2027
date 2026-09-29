const http = require("http");
const fs = require("fs");
const path = require("path");

const { generateSpeech } = require("./processor");

const PORT = process.env.PORT || 3000;

const server = http.createServer(async (req, res) => {

  // الصفحة الرئيسية
  if (req.method === "GET" && req.url === "/") {

    const file = fs.readFileSync(
      path.join(__dirname, "index.html")
    );

    res.writeHead(200, {
      "Content-Type": "text/html; charset=utf-8"
    });

    res.end(file);
    return;
  }

  // API تحويل النص إلى صوت
  if (req.method === "POST" && req.url === "/api/tts") {

    let body = "";

    req.on("data", chunk => {
      body += chunk;
    });

    req.on("end", async () => {

      try {

        const data = JSON.parse(body);

        const text = String(data.text || "").trim();

        const voice = String(
          data.voice || "noura"
        );

        const allowedVoices = [
          "abdullah",
          "fahad",
          "sultan",
          "lulwa",
          "noura",
          "aisha"
        ];

        if (!allowedVoices.includes(voice)) {

          res.writeHead(400, {
            "Content-Type": "application/json"
          });

          res.end(JSON.stringify({
            error: "الصوت المحدد غير صحيح"
          }));

          return;
        }

        if (!text) {

          res.writeHead(400, {
            "Content-Type": "application/json"
          });

          res.end(JSON.stringify({
            error: "النص فارغ"
          }));

          return;
        }

        if (text.length > 200) {

          res.writeHead(400, {
            "Content-Type": "application/json"
          });

          res.end(JSON.stringify({
            error: "النص يتجاوز 200 حرف"
          }));

          return;
        }

        const audio = await generateSpeech(
          text,
          voice
        );

        res.writeHead(200, {
          "Content-Type": "audio/wav",
          "Content-Length": audio.length,
          "Cache-Control": "no-store"
        });

        res.end(audio);

      } catch (error) {

        console.error(error);

        res.writeHead(500, {
          "Content-Type": "application/json"
        });

        res.end(JSON.stringify({
          error: error.message || "حدث خطأ في السيرفر"
        }));
      }
    });

    return;
  }

  // أي رابط غير موجود
  res.writeHead(404, {
    "Content-Type": "application/json"
  });

  res.end(JSON.stringify({
    error: "Not Found"
  }));
});

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
