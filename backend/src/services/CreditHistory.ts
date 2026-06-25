import axios from "axios"
import User from "../../models/User";
const ENDPOINT_BASE_URL = process.env.ENDPOINT_BASE_URL || '';

export default async function CreditHistory(request){
  try{
    const {data} = request
    const {user_id,action,main_db_transaction_number,value_before,value,value_after,modified_by,created_by} = data
    
    // const user_detail = await get_agent_db_id(user_id)
    // data.user_id = +user_detail.data.data.id
    const req = {
        "data":
        {
            endpoint: "insert-credit-history",
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
