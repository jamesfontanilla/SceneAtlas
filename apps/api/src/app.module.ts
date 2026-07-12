import { Module } from "@nestjs/common";
import { APP_FILTER, APP_INTERCEPTOR } from "@nestjs/core";
import { AuthModule } from "./modules/auth/auth.module";
import { CollectionsModule } from "./modules/collections/collections.module";
import { ExportsModule } from "./modules/exports/exports.module";
import { HealthModule } from "./modules/health/health.module";
import { MoviesModule } from "./modules/movies/movies.module";
import { AnalysisModule } from "./modules/analysis/analysis.module";
import { AdminModule } from "./modules/admin/admin.module";
import { AnalyticsModule } from "./modules/analytics/analytics.module";
import { ChatModule } from "./modules/chat/chat.module";
import { RatingsModule } from "./modules/ratings/ratings.module";
import { ProfileModule } from "./modules/profile/profile.module";
import { SearchModule } from "./modules/search/search.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { SubscriptionsModule } from "./modules/subscriptions/subscriptions.module";
import { UsageModule } from "./modules/usage/usage.module";
import { WatchlistModule } from "./modules/watchlist/watchlist.module";
import { RequestLoggingInterceptor } from "./common/interceptors/request-logging.interceptor";
import { ApiExceptionFilter } from "./common/filters/api-exception.filter";

@Module({
  imports: [
    HealthModule,
    MoviesModule,
    AnalysisModule,
    AdminModule,
    AnalyticsModule,
    ChatModule,
    UsageModule,
    SearchModule,
    ProfileModule,
    WatchlistModule,
    CollectionsModule,
    ReviewsModule,
    RatingsModule,
    SubscriptionsModule,
    ExportsModule,
    AuthModule
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: RequestLoggingInterceptor
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter
    }
  ]
})
export class AppModule {}
