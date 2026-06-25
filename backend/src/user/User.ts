import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Wallet from "../../models/Wallet";
import { WhereOptions, FindOptions, Op } from 'sequelize';

export class UserController {
  static async init(app: FastifyInstance) {
    app.post(
      '/findAllUsers',
      findAllUsers
    );

    app.post(
      '/findAllUsersWithWallets',
      findAllUsersWithWallets
    );

    app.post(
      '/findUser',
      findUser
    );
  }
}
async function findUser(req: FastifyRequest<{ Body: { userId: number } }>, res: FastifyReply) {
  const { userId } = req.body;

  // Make sure userId is provided
  if (!userId) {
    return res.status(400).send({ message: 'userId is required' });
  }

  const findOptions: FindOptions = {
    where: {
      id: userId,  // Use 'where' to filter by the 'id' of the user
    },
  };

  try {
    // Fetch the user by userId
    const user = await User.findOne(findOptions);  // Use findOne to get a single user
    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    return res.send(user);  // Return the found user
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).send({ message: 'Internal Server Error' });
  }
}
async function findAllUsers(req: FastifyRequest<{ Body: findallParams }>, res: FastifyReply) {
  const {options} = req.body

  const findOptions: FindOptions = {
    limit: options.limit,
    offset: options.offset,
  };
  return User.findAll(findOptions);
}
async function findAllUsersWithWallets(req: FastifyRequest<{ Body: findAllUsersWithWalletsParams }>, res: FastifyReply) {
  try{
    const {params } = req.body
 
    const { id, limit , offset  } = params || {}; 
    const whereClause: WhereOptions = {};
  
    if (id) {
      whereClause.id = Array.isArray(id) ? { [Op.in]: id } : id;
    }
  
    const findOptions: FindOptions = {
      where: whereClause,
      include: [{
        model: Wallet,
        as: 'wallet',
        required: true,
        attributes: ['credits'],
      }],
      limit: limit,
      offset: offset,
    };
 
     const users = await User.findAll(findOptions);
  
  // Transform the result to include wallet credit directly
  return users.map(user => {
      const userData = user.get(); // Get the user properties
      const walletCredits = user.dataValues.wallet ? user.dataValues.wallet.credits : 0; // Access credits from wallet
  
      return {
          ...userData,
          wallet: walletCredits // Set wallet directly to credits
      };
  });
  }catch(e){
    console.log(e)
  }
  
}

class findallParams {
  options?: any;
}
class findAllUsersWithWalletsParams{
  params? : any;
}
class userParams {
  userId ? : any 
}