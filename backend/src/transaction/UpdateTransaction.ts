import { FastifyRequest, FastifyReply } from "fastify";
import Transaction from "../../models/Transaction";

class updateParams {
  orderNumber: string;
  status?: string;
  event?: string;
  channel?: string;
}

export async function UpdateTransaction(req: FastifyRequest<{ Body: updateParams }>, res: FastifyReply) {
  const { orderNumber, ...updateData } = req.body;

  try {
    const transaction = await Transaction.findOne({
      where: { orderNumber },
    });

    if (!transaction) {
      return res.status(404).send({ message: "Transaction not found." });
    }

    await transaction.update(updateData);

    return res.send({ message: "Transaction updated successfully.", transaction });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "An error occurred while updating the transaction." });
  }
}
