export const apiEnv = {
  port: Number(process.env.PORT ?? 4000),
  movieDataProvider: process.env.MOVIE_DATA_PROVIDER ?? "mock",
  analysisProvider: process.env.ANALYSIS_PROVIDER ?? "mock",
  openaiApiKey: process.env.OPENAI_API_KEY ?? "",
  openaiModel: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
  wikidataApiUrl: process.env.WIKIDATA_API_URL ?? "https://www.wikidata.org/w/api.php",
  commonsApiUrl: process.env.COMMONS_API_URL ?? "https://commons.wikimedia.org/w/api.php",
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:3000"
};
