const request = require("supertest");
const app = require("../../app");

async function createProject(accessToken, overrides = {}) {
  const projectData = {
    title: "ForgeOps",
    description: "Quality Engineering Project",
    status: "Todo",
    ...overrides,
  };

  const res = await request(app)
    .post("/projects")
    .set("Authorization", `Bearer ${accessToken}`)
    .send(projectData);

  return {
    response: res,
    project: res.body.project,
    projectData,
  };
}

module.exports = {
  createProject,
};