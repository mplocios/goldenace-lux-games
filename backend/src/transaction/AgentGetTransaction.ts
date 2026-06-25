import { FastifyRequest, FastifyReply } from "fastify";
import Transaction from "../../models/AgentTransaction";

class Params {
  orderNumber?: string;
  status?: string;
  event?: string;
  channel?: string;
  limit?: number;
  offset?: number;
  orderBy?: "ASC" | "DESC";  
}

export async function AgentGetTransaction(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
  const { limit, offset, orderBy, ...filters } = req.body;

  const whereConditions: any = {};

  if (filters.orderNumber) {
    whereConditions.reference_number = filters.orderNumber;
  }

  if (filters.status) {
    whereConditions.status = filters.status;
  }

  if (filters.event) {
    whereConditions.event = filters.event;
  }

  if (filters.channel) {
    whereConditions.channel = filters.channel;
  }

  const options: any = {};

  if (Object.keys(whereConditions).length > 0) {
    options.where = whereConditions;
  }

  if (limit !== undefined) {
    options.limit = limit;
  }

  if (offset !== undefined) {
    options.offset = offset;
  }

  if (orderBy) {
    options.order = [["id", orderBy]]; 
  }
  else {
    options.order = [["id", 'ASC']]; 
  }

  try {
    const transactions = await Transaction.findAll(options);
    return res.send(transactions);
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "An error occurred while fetching transactions." });
  }
}
