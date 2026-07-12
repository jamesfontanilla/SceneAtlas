import { Body, Controller, Get, Headers, Param, Post, Query } from "@nestjs/common";
import { resolveSceneAtlasAdminUserId } from "../../common/admin";
import { AdminService } from "./admin.service";

@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get("metrics")
  async metrics(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.adminService.getMetrics();
  }

  @Get("queue")
  async queue(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.adminService.getQueue();
  }

  @Get("failures")
  async failures(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.adminService.getFailures();
  }

  @Get("export-jobs")
  async exportJobs(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.adminService.getExportJobs();
  }

  @Get("subscriptions")
  async subscriptions(@Headers("x-sceneatlas-session") sessionToken = "", @Headers("x-sceneatlas-user-id") userId = "anonymous") {
    await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.adminService.getSubscriptions();
  }

  @Post("analysis/:movieId/rebuild")
  async rebuildAnalysis(
    @Param("movieId") movieId: string,
    @Query("spoilers") spoilers = "0",
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolvedUserId = await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.adminService.rebuildAnalysis(movieId, spoilers === "1" || spoilers === "true", resolvedUserId);
  }

  @Post("cache/invalidate")
  async invalidateCache(
    @Body() body: { movieId?: string } = {},
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.adminService.invalidateCache(body.movieId?.trim() || undefined);
  }

  @Post("feature/:movieId")
  async featureMovie(
    @Param("movieId") movieId: string,
    @Body() body: { featured?: boolean } = {},
    @Headers("x-sceneatlas-session") sessionToken = "",
    @Headers("x-sceneatlas-user-id") userId = "anonymous"
  ) {
    const resolvedUserId = await resolveSceneAtlasAdminUserId(sessionToken, userId);
    return this.adminService.featureMovie(movieId, body.featured ?? true, resolvedUserId);
  }
}
