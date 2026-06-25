import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import WalletAccount from "../../models/WalletAccount";

export default class SaveWalletAccount {
  static async init(app: FastifyInstance) {
    app.post('/save-wallet-account', saveWalletAccount);
  }
}

async function saveWalletAccount(req: FastifyRequest<{ Body: WalletAccountSaveParams }>, res: FastifyReply) {
  try {
    const { user_id, account_number, account_name, account_type, account_type_name } = req.body;
    const missingParams: string[] = [];

    if (!user_id) missingParams.push("user_id");
    if (!account_number) missingParams.push("account_number");
    if (!account_name) missingParams.push("account_name");
    if (!account_type) missingParams.push("account_type");
    if (!account_type_name) missingParams.push("account_type_name");

    if (missingParams.length > 0) {
      return res.status(400).send({ message: `Missing required fields: ${missingParams.join(", ")}` });
    }

    const existingAccount = await WalletAccount.findOne({ where: { user_id } });

    if (existingAccount) {
      existingAccount.account_number = account_number;
      existingAccount.account_name = account_name;
      existingAccount.account_type = account_type;
      existingAccount.account_type_name = account_type_name;

      await existingAccount.save();

      return res.status(200).send({ message: "Wallet account updated successfully", data: existingAccount });
    } else {
      const newWalletAccount = await WalletAccount.create({
        user_id,
        account_number,
        account_name,
        account_type,
        account_type_name
      });

      return res.status(201).send({ message: "Wallet account created successfully", data: newWalletAccount });
    }
  } catch (error) {
    console.error("❌ Error saving wallet account:", error);
    return res.status(500).send({ error_code: 500, message: "Server Error", error: error.message });
  }
}

class WalletAccountSaveParams {
  user_id: number;
  account_number: string;
  account_name: string;
  account_type: string;
  account_type_name: string;
}
