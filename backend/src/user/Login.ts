import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import User from "../../models/User";

export class LoginController {
  static async init(app: FastifyInstance) {
    app.post('/login', schema, login);
    app.post('/checklogin', checkLoginSchema, checkLogin);
  }
}

const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

async function login(req: FastifyRequest<{ Body: LoginParams }>, res: FastifyReply) {
  const { mobile } = req.body;

  // console.log("login", mobile)
  let user = await User.findOne({where: {mobile}})
  if (user) {
    let payload = {
      id: user.id,
      user_type_id: 0,
      mobile_number: mobile,
      type: user.type
    }
    const token = this.jwt.sign(payload, { expiresIn: "24h"} )
    return res.code(200).send({ 
      token: token,
      user: payload
    });
  }

  return res.code(404).send({ message: "User not found" });
}

async function checkLogin(req: FastifyRequest, res: FastifyReply) {
	try{
		const authHeader = req.headers['authorization'];
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.code(401).send({ message: 'Authorization token missing or invalid' });
		}
		const token = authHeader.split(' ')[1];

    if (!token || token === "undefined") {
      return res.code(401).send({ message: "Token is null" });
    }

    const user : any = await new Promise((resolve, reject) => {
      this.jwt.verify(token, jwtSecret, (err, user) => {
        if (err) {
          reject(new Error("Token is invalid or expired."));
        } else {
          resolve(user);
        }
      });
    });
 
    let getUser = await User.findOne({where: {mobile: user.mobile_number}})
    
    
		if (getUser) {

      const data= {
				token: token,
				user: {
          id : getUser.id,
          mobile_number : getUser.mobile,
          type : getUser.type   
        }
			}

			return res.code(200).send(data);
		}
	
		return res.code(404).send({ message: "User not found" });
	}catch(e){
    // console.log(e)
    return res.code(401).send({ message: "Unknown Error" });
	}
}


class LoginParams {
  mobile: string
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
              mobile: { type: 'string' },
              name: { type: 'string' },
              type: { type: 'string' },
            }
          },
        },
        required: ['token', 'user']
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
              mobile_number: { type: 'string' },
              type: { type: 'string' },
            }
          },
        },
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
