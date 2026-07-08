import type { ArgumentsHost, ExceptionFilter } from "@nestjs/common";
import { Catch, HttpException, HttpStatus } from "@nestjs/common";
import { SceneAtlasError } from "@sceneatlas/db";

function statusFromSceneAtlasError(code: SceneAtlasError["code"]) {
  switch (code) {
    case "NOT_FOUND":
      return HttpStatus.NOT_FOUND;
    case "QUOTA_EXCEEDED":
      return HttpStatus.TOO_MANY_REQUESTS;
    case "FORBIDDEN":
      return HttpStatus.FORBIDDEN;
    case "CONFLICT":
      return HttpStatus.CONFLICT;
    case "VALIDATION":
      return HttpStatus.BAD_REQUEST;
    case "STATE_ERROR":
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<{ status: (code: number) => { json: (payload: unknown) => void } }>();

    if (exception instanceof SceneAtlasError) {
      response.status(statusFromSceneAtlasError(exception.code)).json({
        statusCode: statusFromSceneAtlasError(exception.code),
        message: exception.message
      });
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      response.status(status).json({
        statusCode: status,
        message: typeof payload === "string" ? payload : (payload as { message?: string }).message ?? "Request failed"
      });
      return;
    }

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Unexpected API error"
    });
  }
}
