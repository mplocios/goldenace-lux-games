import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import Profile from "../../models/Profile";
import User from "../../models/User";

export class ProfileController {
  static async init(app: FastifyInstance) {
    app.post('/saveProfile', saveProfileSchema, saveProfile);
    app.get('/getProfile', getProfileSchema, getProfile);
  }
}

interface DecodedToken {
  id: number;  
}

const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

async function saveProfile(req: FastifyRequest<{ Body: SaveProfileParams }>, res: FastifyReply) {
 
  const { token } = req.headers;

  if (!token) {
    return res.code(400).send({ error: "Token is missing" });
  }

  const decoded = await new Promise((resolve, reject) => {
    this.jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) {
        reject(new Error("Token is invalid or expired."));
      } else {
        resolve(decoded.mobile_number as DecodedToken);
      }
    });
  });
  const response = await handleSaveProfile({
    mobile_number: decoded,
    ...req.body,
  });
  
  return response
}

async function getProfile(req: FastifyRequest<{ Querystring: { token: number } }>, res: FastifyReply) {
  try {
    const { token } = req.query;

    const decoded = await new Promise((resolve, reject) => {
      this.jwt.verify(token, jwtSecret, (err, decoded) => {
        if (err) {
          reject(new Error("Token is invalid or expired."));
        } else {
          resolve(decoded.mobile_number);
        }
      });
    });

    let user = await User.findOne({ where: {mobile : decoded } });

    if (!user) throw { message: "User not found" };
    
    const response = await handleGetProfile({ userId: user.id });

    return res.code(200).send(response);  // Send the profile data
  } catch (e) {
    console.error('Error getting profile:', e);
    return { error: e.message };
  }
}

async function handleSaveProfile(data) {
  try {
    const { birthdate, email, firstName, lastName, middleName, mobileNumber, mobile_number } = data;

    let user = await User.findOne({ where: {mobile : mobile_number } });
    if (!user) {
      throw { message: "User not found" };
    }

    let profile = await Profile.findOne({ where: {userId : user.id } });
    if (profile) {
 
      profile = await profile.update({
        birthdate,
        email,
        firstName,
        lastName,
        middleName,
        mobileNumber
      });

      return {
        message: "Profile updated successfully",
        profile
      };
    } else {
 
      profile = await Profile.create({
        userId: user.id,
        birthdate,
        email,
        firstName,
        lastName,
        middleName,
        mobileNumber
      });

      return {
        message: "Profile created successfully",
        profile
      };
    }

  } catch (error) {
    throw { message: "Error saving profile", error: error.message };
  }
}

async function handleGetProfile({userId}){

  let profile = await Profile.findOne({ where: { userId } });

  if (!profile) {
   return
  }

  return profile

}


class SaveProfileParams {

  birthdate: string;
  email: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  mobileNumber: string;
}

const saveProfileSchema = {
  schema: {
    body: {
      type: 'object',
      properties: {
        birthdate: { type: 'string' },
        email: { type: 'string' },
        firstName: { type: 'string' },
        lastName: { type: 'string' },
        middleName: { type: 'string', nullable: true },
        mobileNumber: { type: 'string' },
      },
      required: ['birthdate', 'email', 'firstName', 'lastName', 'mobileNumber']
    },
    response: {
      201: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          profile: {
            type: 'object',
            properties: {
              birthdate: { type: 'string' },
              email: { type: 'string' },
              firstName: { type: 'string' },
              lastName: { type: 'string' },
              middleName: { type: 'string', nullable: true },
              mobileNumber: { type: 'string' },
              token: { type: 'string' },
            }
          },
        },
        required: ['message', 'profile']
      },
      400: {
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
      500: {
        type: 'object',
        properties: {
          message: { type: 'string' },
          error: { type: 'string' },
        },
        required: ['message', 'error']
      },
    },
  },
};

const getProfileSchema = {
  schema: {
    querystring: {
      type: 'object',
      properties: {
        token: { type: 'string' }  
      },
      required: ['token']
    },
    response: {
      200: {
        type: 'object',
        properties: {
          firstName: { type: 'string' },
          lastName: { type: 'string' },
          email: { type: 'string' },
          birthdate: { type: 'string' },
          middleName: { type: 'string', nullable: true },
          mobileNumber: { type: 'string' },
        }
      },
      404: {
        type: 'object',
        properties: {
          message: { type: 'string' }
        }
      }
    }
  }
};
