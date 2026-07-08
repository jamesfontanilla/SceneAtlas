import type { MovieAnalysis } from "@sceneatlas/shared";

export interface AnalysisProvider {
  generate(movieId: string, spoilers: boolean): Promise<MovieAnalysis>;
}
