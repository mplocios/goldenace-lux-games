import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Transaction from "../../models/Transaction";

export class TransactionController {
  static async init(app: FastifyInstance) {
    app.post('/getUserTransaction', getUserTransaction);
    app.post('/getAllTransaction', getAllTransactions);
  }
}

async function getUserTransaction(req: FastifyRequest<{ Body: TransactionParams }>, res: FastifyReply) {
 
  const { user_id, offset, limit, order_by } = req.body 
  // Default order is 'desc' if no order is provided
  const orderDirection = order_by === 'asc' ? 'asc' : 'desc';
  
  const queryOptions: any = {
    where: { userId: user_id },
    order: [['id', orderDirection]], // Apply descending order by id
  };
 
  // Apply offset and limit if they exist
  if (offset !== undefined) {
    queryOptions.offset = Number(offset);
  }
  if (limit !== undefined) {
    queryOptions.limit = Number(limit);
  }

  try {
    // Fetch the transactions with the built query options
    const transactions = await Transaction.findAll(queryOptions);

    res.send(transactions); // Return the transactions
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
}
async function getAllTransactions(req: FastifyRequest<{ Body: AllTransactionParams }>, res: FastifyReply) {
  const { params } = req.body;
  const { user_id, offset, limit, order_by } = params || {};
 
  // Default order is 'desc' if no order is provided
  const orderDirection = order_by === 'asc' ? 'asc' : 'desc';
  
  const queryOptions: any = {
    order: [['id', orderDirection]], // Apply descending order by id
  };

  // Apply offset and limit if they exist
  if (offset !== undefined) {
    queryOptions.offset = Number(offset);
  }
  if (limit !== undefined) {
    queryOptions.limit = Number(limit);
  }

  try {
    // Fetch the transactions with the built query options
    const transactions = await Transaction.findAll(queryOptions);

    res.send(transactions); // Return the transactions
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).send({ message: 'Internal Server Error' });
  }
}
class TransactionParams {
  user_id?: any;
  offset?: any;
  limit?: any;
  order_by?: 'asc' | 'desc'; // Optional field for ordering
}
class AllTransactionParams {
  params?: any;
   
}
