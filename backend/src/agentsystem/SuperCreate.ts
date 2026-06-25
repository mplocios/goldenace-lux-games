import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import { AgentSystem } from "./AgentSystem"
import User from "../../models/User"
import Agent from "../../models/Agent"

export class SuperCreate {
  public static async register(fastify: FastifyInstance) {
    fastify.post('/super/create', createOptions, create)
  }

}

const createOptions = {
  schema: {
    body: {
      type: 'object',
      properties: {
        mobile: { type: 'string' },
        pct: { type: 'string' },
        code: { type: 'string' },
      },
      required: ['mobile', 'pct', 'code'],
    },
    response: {
      200: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
        required: ['message']
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
}

class CreateBody {
  mobile: string
  pct: string
  code: string
}

// FIXME: Add Admin token on header validation later
async function create(req: FastifyRequest<{ Body: CreateBody}>, res: FastifyReply) {
  const { mobile, pct, code } = req.body;
  
  // FIXME: Detect if there is already agent connected to the user
  try {
    const user = await User.findOne({where: {mobile}})
    if (!user) {
      return res.code(404).send({ message: `mobile doesn't exist` })
    }

    const agent = await Agent.findOne({where: {code}})
    if (agent) {
      return res.code(404).send({ message: `code already taken` })
    }

    const {agent0, pitik} = await AgentSystem.createAgent0(req.body)
    return res.code(200).send({ message: `Created successfully` })
  } catch (e) {
    console.error(e)
  }
  return res.code(404).send({ message: 'Generic Error' })
}

