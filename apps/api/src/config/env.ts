export const apiEnv = {
  port: Number(process.env.PORT ?? 4000),
  movieDataProvider: process.env.MOVIE_DATA_PROVIDER ?? "mock",
  analysisProvider: process.env.ANALYSIS_PROVIDER ?? (process.env.GROQ_API_KEY ? "groq" : "mock"),
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  wikidataApiUrl: process.env.WIKIDATA_API_URL ?? "https://www.wikidata.org/w/api.php",
  commonsApiUrl: process.env.COMMONS_API_URL ?? "https://commons.wikimedia.org/w/api.php",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  authSecret: process.env.AUTH_SECRET ?? "",
  brevoApiKey: process.env.BREVO_API_KEY ?? "",
  brevoSenderEmail: process.env.BREVO_SENDER_EMAIL ?? "",
  brevoSenderName: process.env.BREVO_SENDER_NAME ?? "SceneAtlas"
};
