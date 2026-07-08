import { Injectable } from "@nestjs/common";
import { sceneAtlasStore } from "@sceneatlas/db";

@Injectable()
export class ExportsService {
  create(userId: string, input: { movieId?: string; format?: "json" | "markdown" }) {
    return sceneAtlasStore.createExportJob(userId, input.movieId, input.format ?? "json");
  }

  latest(userId: string, movieId?: string) {
    return sceneAtlasStore.getLatestExport(userId, movieId);
  }
}
