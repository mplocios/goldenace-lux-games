import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Wallet from "../../models/Wallet";
import { Errors, sendError } from "../constant/errors";
import { errorResponseSchema } from "../constant/errorSchema";

let app: FastifyInstance;

export class RegisterController {
  static async init(fastify: FastifyInstance) {
    app = fastify;
    fastify.post('/register', schema, register);
  }
}

async function register(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
  const { mobile, password, name } = req.body;

  try {
    let user = await User.findOne({ where: { mobile } });
    if (user) {
      return sendError(res, Errors.USER_ALREADY_EXISTS);
    }

    const playerId = await getUniqueName();
    user = await User.create({
      mobile,
      password,
      playerId,
      nickname: name,
      type: "player",
    });

    await Wallet.create({
      userId: user.id,
      credits: 0,
    });

    const payload = {
      id: user.id,
      playerId,
      nickname: name,
      user_type: user.type,
      mobile_number: mobile,
      type: user.type,
      balance: 0,
    };

    const token = app.jwt.sign(payload, { expiresIn: "24h" });

    return res.code(200).send({
      token,
      user: payload,
      message: 'Registered',
    });
  } catch (e) {
    return sendError(res, Errors.INTERNAL_ERROR);
  }
}


class Params {
  mobile: string;
  password: string;
  name: string;
}

const schema = {
  schema: {
    body: {
      type: 'object',
      properties: {
        mobile: { type: 'string' },
        password: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['mobile', 'password', 'name'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          user: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              playerId: { type: 'string' },
              nickname: { type: 'string' },
              user_type: { type: 'string' },
              mobile_number: { type: 'string' },
              type: { type: 'string' },
              balance: { type: 'number' },
            },
          },
          message: { type: 'string' },
        },
        required: ['token', 'message'],
      },
      400: errorResponseSchema,
      500: errorResponseSchema,
    },
  },
};


async function getUniqueName(): Promise<string> {
  return new Promise(async (resolve) => {
    while (true) {
      const randomNumber = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
      let generatedUserName = `Player${randomNumber}`
      let userByName = await User.findOne({where: {name: generatedUserName}})
      if (!userByName) {
        resolve(generatedUserName);
        break;
      }
    }
  });
}
