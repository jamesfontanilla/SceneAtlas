import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class ExportsService {
  create(userId: string, input: { movieId?: string; format?: "json" | "markdown" }) {
    const job = sceneAtlasStore.createExportJob(userId, input.movieId, input.format ?? "json");
    sceneAtlasStore.recordAnalyticsEvent("export_action", {
      userId,
      payload: {
        movieId: input.movieId ?? null,
        format: input.format ?? "json",
        exportId: job.id
      }
    });
    return job;
  }

  latest(userId: string, movieId?: string) {
    return sceneAtlasStore.getLatestExport(userId, movieId);
  }
}
