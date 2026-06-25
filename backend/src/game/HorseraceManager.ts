export class PlayerManager {
  private static instance: PlayerManager;
  private HorseChain: any;  // chain speed of all horse
  private HorseWinner : number;  // horse index
  private HorseFastest : number; // fastest time
  private HorseBet : any;
  private PlayerTotalBet : any;
  private HorseRaceGameRound : number;
  private HorseGameId : number
  private HorseGameState : any
  private HorseGameVoid : boolean
  private constructor() {
    this.HorseBet = {}
    this.PlayerTotalBet = {}
    this.HorseRaceGameRound = 0
    this.HorseGameId = -1
    this.HorseGameState = ""
    this.HorseGameVoid = false
  }

  public static getInstance(): PlayerManager {
    if (!PlayerManager.instance) {
      PlayerManager.instance = new PlayerManager();
    }
    return PlayerManager.instance;
  }
  public setHorseGameVoid(check: boolean): void {
    if(check)  this.HorseGameVoid = check
  }
  public getHorseGameVoid() {
    return this.HorseGameVoid
  }
  public setHorseGameState(state: any): void {
    if(state)  this.HorseGameState = state
  }
  public getHorseGameState() {
    return this.HorseGameState
   }
  public setHorseGameId(id: number): void {
    if(id)  this.HorseGameId = id
  }
  public getHorseGameId() {
    return this.HorseGameId
   }
  public setHorseRaceGameRound(round: number): void {
    if(round)  this.HorseRaceGameRound = round
  }
 
  public getHorseRaceGameRound() {
   return this.HorseRaceGameRound
  }
  public addPlayerChain(chain: any): void {
    this.HorseChain = chain

    const players = this.HorseChain.map(v=>v.reduce((a,b)=>a+b,0))
    const fastest = players.reduce((maxIdx, current, idx, array) => 
      current < array[maxIdx] ? idx : maxIdx
    , 0);
    
    this.HorseWinner = fastest
  }

  public getFastest(): any {
    const players = this.HorseChain.map(v=>v.reduce((a,b)=>a+b,0))
    const lowest_time = Math.min(...players)
    this.HorseFastest = lowest_time

    return this.HorseFastest
  }
  public getHorseWinner(): any {
    return this.HorseWinner || 0
  }
  public getHorseChain(): any{
    return this.HorseChain 
  }
  public addHorseBet(user_id, key_bet, bet_amount): any {
    // If the user doesn't have any existing bet record
    if (!this.HorseBet[user_id]) {
      this.HorseBet[user_id] = {
        [key_bet]: bet_amount
      };
    } else {
      // If the user already has a bet record, add the new bet amount to the existing value
      this.HorseBet[user_id][key_bet] = (this.HorseBet[user_id][key_bet] || 0) + bet_amount;
    }
    this.setPlayersTotalBet(user_id,bet_amount)
    return this.HorseBet[user_id];
  }
  public getAllHorseBets(){
    return this.HorseBet
  }
  public getUserHorseBets(user_id){
    return this.HorseBet[user_id]
  }
  public clearHorseBet(){
    this.HorseBet = {}
  }
  public setPlayersTotalBet(user_id,amount){
    this.PlayerTotalBet[user_id] = {
      TotalBet : (this.PlayerTotalBet[user_id]?.TotalBet || 0) + amount
    }
  }
  public getPlayerTotalBet(user_id){
    return this.PlayerTotalBet[user_id]
  }
}
