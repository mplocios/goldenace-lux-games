import axios from "axios"
import User from "../../models/User";
const ENDPOINT_BASE_URL = process.env.ENDPOINT_BASE_URL || '';

export default async function getAgentId(user_id){
  const endpoint = "get-user-details-by-mobile-number"
  const user_detail = await User.findOne({
    where : {
      id : user_id
    }
  })
  const req = {
    "data":
    {
        endpoint,
        data: {
          mobile_number : user_detail.mobile
        }
    }
  }
 
  const url = `https://kingfisher777.com/api/apiservice`
    
  const response = await axios.post(url, req )
 
  return response
}