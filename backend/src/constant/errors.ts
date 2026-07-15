import { FastifyReply } from "fastify";

interface AppError {
  error: string;
  status: number;
  message: string;
}

export const Errors = {
  // Auth
  AUTH_TOKEN_MISSING:       { error: "auth_token_missing",       status: 401, message: "Authorization token missing" },
  AUTH_TOKEN_INVALID:       { error: "auth_token_invalid",       status: 401, message: "Invalid or expired token" },
  AUTH_TOKEN_EXPIRED:       { error: "auth_token_expired",       status: 401, message: "Token has expired" },
  AUTH_UNAUTHORIZED:        { error: "auth_unauthorized",        status: 403, message: "Unauthorized access" },

  // User
  USER_NOT_FOUND:           { error: "user_not_found",           status: 404, message: "User not found" },
  USER_ALREADY_EXISTS:      { error: "user_already_exists",      status: 409, message: "Mobile number already exists" },
  USER_INVALID_CREDENTIALS: { error: "invalid_credentials",      status: 401, message: "Invalid mobile number or password" },
  USER_MISSING_FIELDS:      { error: "missing_fields",           status: 400, message: "Required fields are missing" },

  // Wallet
  WALLET_NOT_FOUND:         { error: "wallet_not_found",         status: 404, message: "Wallet not found" },
  WALLET_INSUFFICIENT:      { error: "insufficient_balance",     status: 400, message: "Insufficient balance" },
  WALLET_INVALID_AMOUNT:    { error: "invalid_amount",           status: 400, message: "Invalid amount" },

  // Transaction
  TXN_NOT_FOUND:            { error: "transaction_not_found",    status: 404, message: "Transaction not found" },
  TXN_FAILED:               { error: "transaction_failed",       status: 500, message: "Transaction failed" },
  TXN_DUPLICATE:            { error: "duplicate_transaction",    status: 409, message: "Duplicate transaction" },

  // Payment
  PAYMENT_FAILED:           { error: "payment_failed",           status: 500, message: "Payment processing failed" },
  PAYMENT_INVALID:          { error: "invalid_payment",          status: 400, message: "Invalid payment request" },

  // Game
  GAME_NOT_FOUND:           { error: "game_not_found",           status: 404, message: "Game not found" },
  GAME_SESSION_EXPIRED:     { error: "game_session_expired",     status: 410, message: "Game session expired" },
  GAME_INVALID_BET:         { error: "invalid_bet",              status: 400, message: "Invalid bet amount" },

  // Agent
  AGENT_NOT_FOUND:          { error: "agent_not_found",          status: 404, message: "Agent not found" },
  AGENT_CODE_TAKEN:         { error: "agent_code_taken",         status: 409, message: "Agent code already taken" },
  AGENT_MOBILE_NOT_FOUND:   { error: "agent_mobile_not_found",   status: 404, message: "Mobile number does not exist" },

  // Validation
  VALIDATION_FAILED:        { error: "validation_failed",        status: 400, message: "Validation failed" },
  INVALID_PARAM:            { error: "invalid_parameter",        status: 400, message: "Invalid parameter" },

  // Server
  INTERNAL_ERROR:           { error: "internal_error",           status: 500, message: "Internal server error" },
  SERVICE_UNAVAILABLE:      { error: "service_unavailable",      status: 503, message: "Service temporarily unavailable" },
} as const;

export type ErrorKey = keyof typeof Errors;

export function sendError(res: FastifyReply, err: AppError, details?: string) {
  return res.code(err.status).send({
    error: err.error,
    status: err.status,
    message: details || err.message,
  });
}
