import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Wallet from "../../models/Wallet";
import Transaction from "../../models/Transaction";
import { Errors, sendError } from "../constant/errors";
import { errorResponseSchema } from "../constant/errorSchema";

let app: FastifyInstance;

export class LoginController {
  static async init(fastify: FastifyInstance) {
    app = fastify;
    fastify.post('/login', schema, login);
    fastify.post('/checklogin', checkLoginSchema, checkLogin);
    fastify.post('/nickname', nicknameSchema, updateNickname);
  }
}

async function login(req: FastifyRequest<{ Body: LoginParams }>, res: FastifyReply) {
  const { mobile, password } = req.body;

  let user = await User.findOne({ where: { mobile, password } });
  if (!user) {
    return sendError(res, Errors.USER_INVALID_CREDENTIALS);
  }

  if (user.status === 'banned') {
    return res.code(403).send({ error: 'account_banned', status: 403, message: 'Your account has been permanently banned.' });
  }
  if (user.status === 'suspended' && user.bannedUntil && new Date(user.bannedUntil) > new Date()) {
    return res.code(403).send({ error: 'account_suspended', status: 403, message: `Your account is suspended until ${new Date(user.bannedUntil).toLocaleDateString()}.` });
  }
  if (user.status === 'suspended' && (!user.bannedUntil || new Date(user.bannedUntil) <= new Date())) {
    await user.update({ status: 'active', bannedUntil: null });
  }

  const wallet = await Wallet.findOne({ where: { userId: user.id } });
  const depositCount = await Transaction.count({ where: { userId: user.id, event: 'deposit', status: 'success' } });
  let payload = {
    id: user.id,
    playerId: user.playerId || "",
    nickname: user.nickname || "",
    user_type: user.type,
    mobile_number: mobile,
    type: user.type,
    balance: wallet ? parseFloat(wallet.credits) || 0 : 0,
    withdrawable: wallet ? parseFloat(wallet.withdrawable) || 0 : 0,
    hasDeposited: depositCount > 0,
  };
  const token = app.jwt.sign(payload, { expiresIn: "24h" });
  return res.code(200).send({
    token: token,
    user: payload
  });
}

async function checkLogin(req: FastifyRequest, res: FastifyReply) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, Errors.AUTH_TOKEN_MISSING);
    }
    const token = authHeader.split(' ')[1];

    if (!token || token === "undefined") {
      return sendError(res, Errors.AUTH_TOKEN_INVALID);
    }

    const decoded: any = app.jwt.verify(token);

    let getUser = await User.findOne({ where: { mobile: decoded.mobile_number } });
    if (!getUser) {
      return sendError(res, Errors.USER_NOT_FOUND);
    }

    const wallet = await Wallet.findOne({ where: { userId: getUser.id } });
    const depositCount = await Transaction.count({ where: { userId: getUser.id, event: 'deposit', status: 'success' } });
    const data = {
      token: token,
      user: {
        id: getUser.id,
        playerId: getUser.playerId || "",
        nickname: getUser.nickname || "",
        mobile_number: getUser.mobile,
        type: getUser.type,
        balance: wallet ? parseFloat(wallet.credits) || 0 : 0,
        withdrawable: wallet ? parseFloat(wallet.withdrawable) || 0 : 0,
        hasDeposited: depositCount > 0,
      }
    };

    return res.code(200).send(data);
  } catch (e) {
    return sendError(res, Errors.AUTH_TOKEN_EXPIRED);
  }
}

async function updateNickname(req: FastifyRequest<{ Body: { nickname: string } }>, res: FastifyReply) {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return sendError(res, Errors.AUTH_TOKEN_MISSING);
    }
    const token = authHeader.split(' ')[1];
    const decoded: any = app.jwt.verify(token);

    const user = await User.findByPk(decoded.id);
    if (!user) return sendError(res, Errors.USER_NOT_FOUND);

    await user.update({ nickname: req.body.nickname });

    return res.code(200).send({ message: 'Nickname updated', nickname: req.body.nickname });
  } catch (e) {
    return sendError(res, Errors.AUTH_TOKEN_EXPIRED);
  }
}


class LoginParams {
  mobile: string
  password: any
};

const schema = {
  schema: {
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
              withdrawable: { type: 'number' },
              hasDeposited: { type: 'boolean' },
            }
          },
        },
        required: ['token', 'user']
      },
      401: errorResponseSchema,
      403: errorResponseSchema,
      404: errorResponseSchema,
    },
  },
};

const checkLoginSchema = {
  schema: {
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
              mobile_number: { type: 'string' },
              type: { type: 'string' },
              balance: { type: 'number' },
              withdrawable: { type: 'number' },
              hasDeposited: { type: 'boolean' },
            }
          },
        },
      },
      401: errorResponseSchema,
      404: errorResponseSchema,
    },
  },
};

const nicknameSchema = {
  schema: {
    body: {
      type: 'object',
      properties: {
        nickname: { type: 'string' },
      },
      required: ['nickname'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          nickname: { type: 'string' },
        },
      },
      401: errorResponseSchema,
      404: errorResponseSchema,
    },
  },
};
