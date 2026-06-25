import axios from "axios"
import User from "../../models/User";
const ENDPOINT_BASE_URL = process.env.ENDPOINT_BASE_URL || '';

export default async function CommissionDistribution(request){
  try{
    const {data} = request
    const {game_type,user_id,bet_transaction_id,bet_amount,turnover,payout,net_win} = data
    
    // const user_detail = await get_agent_db_id(user_id)
    // data.user_id = +user_detail.data.data.id
    const req = {
        "data":
        {
            endpoint: "insert-commission",
            data: data
        }
    }

    const url = `https://kingfisher777.com/api/apiservice`

    const response = await axios.post(url, req )

    return response
  
  }catch(e){

    console.error(e)
  }
 
}
 