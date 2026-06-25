import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import getRandomDurations from "../../../utils/getRandomDurations";

export default async function PlayerChain({ playerCount }: { playerCount: any }) {
  try {

      let result = []
      const maxDurations = 11;
      const divisions = 11;
      const min = 0.8;
      const max = 2.5;

      for (let idx = 0; idx < playerCount; idx++) {			 
          let duration =  getRandomDurations(divisions, min, max, maxDurations);
          duration.unshift(Math.random() * (max - min) + min);
          result.push(duration);
      }

      //getting player winner
      const players = result.map(v=>v.reduce((a,b)=>a+b,0))
      const playerWin = players.reduce((maxIdx, current, idx, array) => 
        current < array[maxIdx] ? idx : maxIdx
      , 0);




      return result
  }catch(e){
    throw e
  }
  
}
 