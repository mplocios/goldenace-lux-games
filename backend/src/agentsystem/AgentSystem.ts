import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify"
import Agent from "../../models/Agent"
import { Pitik } from "../../models/Pitik"
import { SuperCreate } from "./SuperCreate"
import User from "../../models/User"
import { sequelize } from "../../database/Database"
import { MasterCreate } from "./MasterCreate"
import { AgentCreate } from "./AgentCreate"

export class AgentSystem {
  public static async register(fastify: FastifyInstance) {
    SuperCreate.register(fastify)
    MasterCreate.register(fastify)
    AgentCreate.register(fastify)
  }

  static async createAgent0(params: any) {
    const transaction = await sequelize.transaction();

    try {
      let user = await User.findOne({where: {
        mobile: params.mobile
      }})

      let agent0 = await Agent.create({
        userId: user.id,
        type: "Super",
        code: params.code
      }, {transaction})
      
      const pcts = params.pct.split(",")
      let pitik = await Pitik.create({
        superAgentId: agent0.id,
        pct1: pcts[0],
        pct2: pcts[1],
        pct3: pcts[2],
      }, {transaction})
  
      agent0.pitikId = pitik.id
      await agent0.save({transaction})

      await transaction.commit();
      return {agent0, pitik}
    } catch (e) {
      await transaction.rollback()
      console.error(e)
      return undefined
    }
    
  }
  
  static async createAgent1(params: any) {
    try {
      let recruiter = await Agent.findOne({
        where: {code: params.recruiterCode}
      })
      let pitik = await Pitik.findOne({
        where: {superAgentId: recruiter.pitikId}
      })
  
      if (recruiter.type !== "Super") {return null}
      
      const user = await User.findOne({where: {mobile: params.mobile}})
  
      let agent = await Agent.create({
        userId: user.id,
        recruiterId: recruiter.id,
        pitikId: pitik.id, 
        type: "Master",
        code: params.code
      })
      await agent.save()
      
      return agent
    } catch (e) {
      console.error(e)
      return undefined
    }
  }
  
  static async createAgent2(params: any) {
    try {
      let recruiter = await Agent.findOne({
        where: {code: params.recruiterCode}
      })
      let pitik = await Pitik.findOne({
        where: {superAgentId: recruiter.pitikId}
      })
  
      if (recruiter.type !== "Master") {return null}
      
      const user = await User.findOne({where: {mobile: params.mobile}})
      let agent = await Agent.create({
        userId: user.id,
        recruiterId: recruiter.id,
        pitikId: pitik.id, 
        type: "Agent",
        code: params.code
      })
      await agent.save()
  
      return agent
    } catch (e) {
      console.error(e)
      return undefined
    }
    
  }
}


/*
  Any User.type can be types in Agent
*/


/*
  Agent to Players connection
*/


/*
  FIXME: Add code to Pitik for SuperAgent later
*/