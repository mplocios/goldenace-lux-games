import { FastifyInstance } from "fastify";
import { IncomingMessage } from "http";
import WebSocket from 'ws';
import { GameManager } from "./GameManager";
import User from "../../models/User";
import { User as UserPlugin } from "./components/core/UserPlugin";
import WebSocketService from "../services/WebSocketService";
import { PlayerManager } from "./HorseraceManager";
import BetTransaction from "../../models/BetTransaction";
import Wallet from "../../models/Wallet";
import moment from "moment";
import { CasinoManager } from "../manager/CasinoManager";
export class Sockets {
  gameManager: GameManager;
  webSocketService: WebSocketService; // Declare a WebSocketService instance
  Bets : any;
  playerManager : PlayerManager
  casinoManager : CasinoManager
  constructor(gameManager: GameManager) {
    this.gameManager = gameManager;
    this.webSocketService = new WebSocketService(); // Instantiate the WebSocketService
    this.Bets = {};
 
  }

  // Register WebSocket connection and validate token
  async register(app: FastifyInstance) {
    const wss = new WebSocket.Server({ noServer: true });
    

    app.server.on('upgrade', async (request: IncomingMessage, socket, head) => {
      try {
        const r = request.url;
        const url = new URL(r, `http://${request.headers.host}`);

        // Check if the request is a WebSocket upgrade and contains a token
        if (r === undefined || !r.includes('ws')) {
          return;
        }

        const token = url.searchParams.get('token');
        
        if (!token) {
          socket.destroy();
          console.error("Token is missing");
          return;
        }

        // Validate token (decode it)
        const payload: any = app.jwt.decode(token);
      
        let getUser = await User.findOne({where: {mobile: payload.mobile_number}})
  
        if (!getUser) {
          throw {message : 'User not found'}
        }
        // Check if the client is already connected
        const web = WebSocketService.isClientConnected(`${getUser.id}`)
        // if (web) {
        //   socket.destroy();  // Close the connection if token is already connected
        //   console.error(`Client with id ${getUser.id} is already connected.`);
        //   return;
        // }

        // If token is valid, handle the WebSocket upgrade
        wss.handleUpgrade(request, socket, head, (ws) => {
          // Add the WebSocket to the WebSocketService
          const casinoManager = CasinoManager.getInstance()
          WebSocketService.addClient(ws, `${getUser.id}`);
          
          casinoManager.setUsers({
            player_id: payload.user_type_id,
            agent_db_id : payload.id
          })
          // Emit the 'connection' event with user data
          wss.emit('connection', ws, new UserPlugin(payload.id, payload));
        });
        
      } catch (e) {
        console.error("Error during WebSocket upgrade:", e);
        socket.destroy();
      }
    });

    this.setupConnection(wss);
  }

  // Handle WebSocket connection
  setupConnection(wss: any) {
    wss.on('connection', async (socket: WebSocket, userData: UserPlugin) => {
      this.gameManager.load(socket, userData);

      // Handle client disconnection
      socket.on('close', () => {
        WebSocketService.removeClient(socket);  // Remove the WebSocket connection from the service
        console.log(`Client with token ${userData.id} disconnected`);
      });

      // Handle incoming messages (optional)
      socket.on('message', async (message) => {
        // console.log(`Received message from ${userData.id}: ${message}`);
        const msg = JSON.parse(message)
        if(msg.channel == '/Bet'){
          const playerManager = PlayerManager.getInstance()
          const get_today = moment().format('YYYYMMDD');

          const game_id = msg.data.game_id
          const game_round = playerManager.getHorseRaceGameRound()
   
          const TRANSACTION_ID = `${get_today}${game_round}`

          const data = {
            userId : msg.data.user_id,
            TRANSACTION_ID,
            GAME_ID : game_id,
            GAMEROUND_ID : game_round, 
            STATUS : "ONGOING",
            BET_AMOUNT : msg.data.bet_amount,
            BET_PLACE : msg.data.place_bet
          }
          const get_wallet =  await Wallet.findOne({
            where : {userId :data.userId}
          })
          
          if(get_wallet){
            get_wallet.credits -=  data.BET_AMOUNT 

            get_wallet.save()
          }
           
          const bets = BetTransaction.create(data)
          const horse_bet = playerManager.addHorseBet(data.userId,data.BET_PLACE,data.BET_AMOUNT )
 
        }
        // You can add custom logic to handle messages from the client
      });

      // Handle WebSocket errors
      socket.on('error', (error) => {
        console.error(`Error in WebSocket connection with ${userData.id}: ${error}`);
      });
    });
  }

  // Start the game
  async start() {
    await this.gameManager.game.run();
  }

  // Stop the game
  close() {
    this.gameManager.stop();
  }

  // Set the game step
  setStep(step: number) {
    this.gameManager.game.setStep(step);
  }
}
