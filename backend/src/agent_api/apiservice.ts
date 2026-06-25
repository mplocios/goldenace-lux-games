import fastify, { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import axios from "axios";

export class ApiService {
  static async init(app: FastifyInstance) {
    app.post('/apiservice', apiController);
  }
}

const SECRET_KEY = process.env.SECRET_KEY || '';
const ENDPOINT_BASE_URL = process.env.ENDPOINT_BASE_URL || '';
const DEVELOPMENT_USERNAME = process.env.DEVELOPMENT_USERNAME || '';
const DEVELOPMENT_PASSWORD = process.env.DEVELOPMENT_PASSWORD || '';
const jwtSecret = process.env.JWT_SECRET_KEY || 'ToTheMoon__69420';

// Paki change nalang ng mga error response to your liking for debugging purposes, kasi kung failed ito, magiging null lang naman yung token eh, and eventually it will fail to trigger ng API since invalid yung token hehe
async function generateToken() {
  const url = ENDPOINT_BASE_URL + 'generate-token';

  const bodyData = {
    data: {
      username: DEVELOPMENT_USERNAME,
      password: DEVELOPMENT_PASSWORD,
    }
  };
  const json = JSON.stringify(bodyData)

  try { 
    const response = await axios.post(url, bodyData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
  

    const result = response.data;
    
    if (!response) {
      console.error(`HTTP error! Status: ${response.status}`, result);
    } else {
      return result;
    }
  } catch (error) {
  
    console.error('Error triggering the API:', error.message);
  }
}


async function connectionService(jwt, endpoint, body_data, debug = false) {
  const url = ENDPOINT_BASE_URL + endpoint;
  console.log(url,444444444)
  const generate_token_response = await generateToken();

  const token = generate_token_response.data && generate_token_response.data.token ? generate_token_response.data.token : null;

  const bodyData = {
    data: body_data
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify(bodyData)
    });

    // Always show the response, even if it's not 200 or 201

    const result = await response.json();

    if (!response.ok) {
      // paki bago ng response dito para fit sa needs nyo sa FE
      console.error(`HTTP error! Status: ${response.status}`, result);
      return result;
    } else {
      let Token = null;

      if (endpoint == "login"){
        let payload = {
          id: result.data.user_details?.id,
          user_type_id: result.data.user_details?.user_type_id,
          mobile_number: result.data.user_details?.mobile_number,
          type: result.data.set_session?.user_type.toLowerCase()
        }
        const agentToken = jwt.sign(payload, { expiresIn: "24h"} )
  
        Token = {agentToken}
        if (payload.type == "player" || payload.type == "host")
        {
          Token = {token: agentToken}
        }
        Object.assign(result.data.user_details, Token)
      }
      // Manipulate the success response here bro

      return result;
    }
  } catch (error) {

    console.error('Error triggering the API:', error.message);
  }
}


async function apiController(req: FastifyRequest<{ Body: apiServiceParams}>, res: FastifyReply) {
    const {data} = req.body;
    const {token} = req.headers;

    const jwt = this.jwt;

    if (data.endpoint == "send-credits"){
      const decoded = await new Promise((resolve, reject) => {
        this.jwt.verify(token, jwtSecret, (err, decoded) => {
          if (err) {
            reject(new Error("Token is invalid or expired."));
          } else {
            resolve(decoded.id);
          }
        });
      });
      Object.assign(data.data, {sender_user_id: +decoded})
    } else if (data.endpoint == "get-user-details"){
      const decoded = await new Promise((resolve, reject) => {
        this.jwt.verify(token, jwtSecret, (err, decoded) => {
          if (err) {
            reject(new Error("Token is invalid or expired."));
          } else {
            resolve(decoded.id);
          }
        });
      });
      Object.assign(data.data, {user_id: +decoded})
    }

    const response = await connectionService(jwt, data.endpoint, data.data);

    return response;
}

class apiServiceParams {
  data: any
};