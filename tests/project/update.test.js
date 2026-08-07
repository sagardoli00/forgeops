const request = require("supertest");
const Project = require("../../models/project");
jest.mock("../../services/emailService");

const app = require("../../app");
const { loginUser } = require("../helpers/loginHelper");
const { createProject } = require("../helpers/projectHelper");

require("../helpers/setup");

test("should not allow another user to update someone else's project", async () => {
  // ---------- User A ----------
  const { accessToken: tokenA } = await loginUser();

  const { project: projectA } = await createProject(tokenA, {
    title: "Secret Project",
    description: "Only User A owns this project",
  });

  const projectId = projectA._id;

  // ---------- User B ----------
  const { accessToken: tokenB } = await loginUser({
    email: "userb@test.com",
  });

  // ---------- Attempt Update ----------
  const res = await request(app)
    .put(`/projects/${projectId}`)
    .set("Authorization", `Bearer ${tokenB}`)
    .send({
      title: "Hacked Project",
    });

  console.log("Status:", res.status);
  console.log("Body:", JSON.stringify(res.body, null, 2));

  if (res.body.stack) {
    console.log("Stack:");
    console.log(res.body.stack);
  }

  expect(res.status).toBe(403);
  expect(res.body.success).toBe(false);

  const project = await Project.findById(projectId);

  expect(project.title).toBe("Secret Project");
});
