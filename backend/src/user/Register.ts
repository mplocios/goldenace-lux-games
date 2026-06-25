import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";
import Wallet from "../../models/Wallet";

export class RegisterController {
  static async init(app: FastifyInstance) {
    app.post(
      '/register',
      schema,
      register
    );
  }
}

async function register(req: FastifyRequest<{ Body: Params }>, res: FastifyReply) {
  const { mobile } = req.body;

  try {
    let user = await User.findOne({where: {mobile}})
    if (user) {
      return res.code(400).send({ message: 'Mobile number already exists' });
    }

    const uniqueName = await getUniqueName()
    user = await User.create({
      mobile: mobile,
      name: uniqueName, // Return name-random number
      type: "player"
    })

    let payload = {
      id: user.id,
      mobile: mobile,
      name: uniqueName,
      type: user.type,
    }

    // console.log("payload", payload)
    const token = this.jwt.sign(payload, { expiresIn: "24h"} )

    await Wallet.create({
      userId: user.id,
      credits: 0
    })

    return res.code(200).send({
      token: token,
      message: 'Registered' 
    });
  } catch (e) {
    // console.error(e)
    return res.code(401).send({ message: 'Error registering' });
  }
}


class Params {
  mobile: string
};

const schema = {
  schema: {
    body: {
      type: 'object',
      properties: {
        mobile: { type: 'string' },
        name: { type: 'string' },
      },
      required: ['mobile'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          token: { type: 'string' },
          message: { type: 'string' },
        },
        required: ['token', 'message']
      },
      404: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message']
      },
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
      // console.log("Recreate", generatedUserName)
    }
  });
}
