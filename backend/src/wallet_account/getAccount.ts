import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import WalletAccount from "../../models/WalletAccount"; 
import { Op } from "sequelize";

export default class GetWalletAccount {
  static async init(app: FastifyInstance) {
    app.post('/get-wallet-accounts', getWalletAccounts);
  }
}

async function getWalletAccounts(req: FastifyRequest<{ Body: WalletAccountGetParams }>, res: FastifyReply) {
  try {
    const { user_id, account_number, account_name, account_type, account_type_name, offset, limit } = req.body;

    const filters: any = {};

    if (user_id) filters.user_id = user_id;
    if (account_number) filters.account_number = { [Op.like]: `%${account_number}%` };
    if (account_name) filters.account_name = { [Op.like]: `%${account_name}%` };
    if (account_type) filters.account_type = { [Op.like]: `%${account_type}%` };
    if (account_type_name) filters.account_type_name = { [Op.like]: `%${account_type_name}%` };

    const queryOptions: any = {};

    if (Object.keys(filters).length) {
      queryOptions.where = filters;
    }

    if (offset !== undefined) {
      if (isNaN(offset) || offset < 0) {
        return res.status(400).send({ message: "Invalid offset value" });
      }
      queryOptions.offset = offset;
    }

    if (limit !== undefined) {
      if (isNaN(limit) || limit <= 0) {
        return res.status(400).send({ message: "Invalid limit value" });
      }
      queryOptions.limit = limit;
    }

    const walletAccounts = await WalletAccount.findAll(queryOptions);

    if (walletAccounts.length === 0) {
      return res.status(404).send({ message: "No wallet accounts found matching the criteria" });
    }

    return res.status(200).send({ message: "Wallet accounts fetched successfully", data: walletAccounts });
  } catch (error) {
    console.error("❌ Error fetching wallet accounts:", error);
    return res.status(500).send({ error_code: 500, message: "Server Error", error: error.message });
  }
}

class WalletAccountGetParams {
  user_id?: number;
  account_number?: string;
  account_name?: string;
  account_type?: string;
  account_type_name?: string;
  offset?: number;
  limit?: number;
}
