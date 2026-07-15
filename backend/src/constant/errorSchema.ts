export const errorResponseSchema = {
  type: 'object',
  properties: {
    error: { type: 'string' },
    status: { type: 'number' },
    message: { type: 'string' },
  },
  required: ['error', 'status', 'message'],
};
