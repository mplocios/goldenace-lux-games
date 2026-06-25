import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Wallet from "../../models/Wallet";
import Transaction from "../../models/Transaction";

import { WhereOptions, FindOptions, Op } from 'sequelize';
import { generateRandomString,DateToday } from '../utils/common';

export class WalletController {
  static async init(app: FastifyInstance) {
    app.post(
      '/updateWallet',
      updateWallet
    );
 
  }
}
async function updateWallet(req: FastifyRequest<{ Body: updateWalletParams }>, res: FastifyReply) {
  const {userId,updateData,credits} = req.body
  const { status,event,channel,amount,previousBalance,newBalance} = updateData

  const orderNumber = `${userId}${generateRandomString(7)}${DateToday()}`

  const wallet =  await Wallet.update({credits}, { where: { userId }, returning: true });

  if(wallet){
    const transaction = await Transaction.create({
      userId :userId,
      amount,
      channel: channel.toUpperCase(),
      event,
      orderNumber,
      previousBalance,
      newBalance,
      status,
      meta : null,
      remarks : `admin send credit to user ${userId} amount ${amount}`
    });

  }

  return wallet
}
 
class updateWalletParams {
  userId?: any;
  credits? :any;
  updateData?: any;
}
 