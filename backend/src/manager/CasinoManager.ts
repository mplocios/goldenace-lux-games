export class CasinoManager {
  private static instance: CasinoManager;

  private users: any;  
  private casino_session: any;  

  private constructor() {
    this.users = {}
    this.casino_session = {}

  }

  public static getInstance(): CasinoManager {
    if (!CasinoManager.instance) {
      CasinoManager.instance = new CasinoManager();
    }
    return CasinoManager.instance;
  }
  public setUsers(data: any): void {
    this.users[data.player_id] = data.agent_db_id
  }

  public getUsers(id: number) {
    return this.users[id]
  }

  public setUserCasinoSession(data : any): void{
    this.casino_session[data.player_id] = data.session_id
  }

  public getUserCasinoSession(player_id : any){
    return this.casino_session[player_id]
  }
}
  