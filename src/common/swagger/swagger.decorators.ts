import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Missing, invalid, or expired JWT token',
      schema: {
        example: {
          message: 'Invalid or expired token',
          error: 'Unauthorized',
          statusCode: 401,
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data',
      schema: {
        example: {
          message: ['Validation error'],
          error: 'Bad Request',
          statusCode: 400,
        },
      },
    }),
  );
}

export function ApiAdminProtected() {
  return applyDecorators(
    ApiBearerAuth(),
    ApiUnauthorizedResponse({
      description: 'Missing, invalid, or expired JWT token',
    }),
    ApiForbiddenResponse({
      description: 'Admin role required',
      schema: {
        example: {
          message: 'You do not have permission',
          error: 'Forbidden',
          statusCode: 403,
        },
      },
    }),
    ApiBadRequestResponse({
      description: 'Invalid request data',
    }),
  );
}