async function generateSpeech(text, voice) {

  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    throw new Error("GROQ_API_KEY غير موجود في إعدادات السيرفر");
  }

  const response = await fetch(
    "https://api.groq.com/openai/v1/audio/speech",
    {
      method: "POST",

      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        model: "canopylabs/orpheus-arabic-saudi",
        input: text,
        voice: voice,
        response_format: "wav"
      })
    }
  );

  if (!response.ok) {

    const errorText = await response.text();

    throw new Error(
      `Groq API Error: ${errorText}`
    );
  }

  return Buffer.from(
    await response.arrayBuffer()
  );
}

module.exports = {
  generateSpeech
};
