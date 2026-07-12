import { Module } from "@nestjs/common";
import { UsageModule } from "../usage/usage.module";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { GroqChatProvider } from "./providers/groq-chat.provider";

@Module({
  imports: [UsageModule],
  controllers: [ChatController],
  providers: [ChatService, GroqChatProvider]
})
export class ChatModule {}
