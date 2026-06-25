import { sequelize } from "../../database/Database";
import User from "../../models/User";
import { AgentSystem } from "../../src/agentsystem/AgentSystem";

describe('AgentCreations', () => {

  beforeAll(async () => {
    await sequelize.authenticate()
    await sequelize.sync({ force: true })
  })

  beforeEach(async () => {
    await sequelize.sync({ force: true })
  })

  afterEach(async () => {
  })

  afterAll(async () => {
    await sequelize.close();
  });

  // FIXME: Update unit tests
  test.only('TestCreateAgent0', async () => {
    await spawnUsers()

    let params0 = {
      mobile: "09000000000",
      pct: [3,2,1],
      code: "Agent0Code1"
    }
    let {agent0, pitik} = await AgentSystem.createAgent0(params0)

    expect(agent0.code).toBe(params0.code)
    expect(pitik.superAgentId).toBe(agent0.id)
  });

  test('TestCreateAgent1', async () => {
    await spawnUsers()

    let params0 = {
      mobile: "09000000000",
      pct: [3,2,1],
      code: "Agent0Code1"
    }
    let {agent0, pitik} = await AgentSystem.createAgent0(params0)

    let params1 = {
      mobile: "09000000001",
      recruiterCode: params0.code,
      code: "Agent1Code0",
    }

    let agent1 = await AgentSystem.createAgent1(params1)
    expect(agent1.code).toBe(params1.code)
    expect(agent1.pitikId).toBe(pitik.id)
  });

  test('TestCreateAgent2', async () => {
    await spawnUsers()

    let params0 = {
      mobile: "09000000000",
      pct: [3,2,1],
      code: "Agent0Code0"
    }
    let {agent0, pitik} = await AgentSystem.createAgent0(params0)

    let params1 = {
      mobile: "09000000001",
      recruiterCode: params0.code,
      code: "Agent1Code0",
    }
    let agent1 = await AgentSystem.createAgent1(params1)

    let params2 = {
      mobile: "09000000002",
      recruiterCode: params1.code,
      code: "Agent2Code0",
    }
    let agent2 = await AgentSystem.createAgent2(params2)
    expect(agent2.code).toBe(params2.code)
    expect(agent2.pitikId).toBe(pitik.id)

    let params3 = {
      mobile: "09000000003",
      recruiterCode: params1.code,
      code: "Agent2Code1",
    }
    let agent3 = await AgentSystem.createAgent2(params3)
    expect(agent3.code).toBe(params3.code)
    expect(agent3.pitikId).toBe(pitik.id)
  });

  
})


async function spawnUsers() {
  const maxNumbers = 20;
  for (let i = 0; i <= maxNumbers; i++) {
    let number = "090000" + String(i).padStart(5, '0');
    await User.create({
      mobile: number,
      type: "player",
    })
  }
}


