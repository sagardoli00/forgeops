const request = require("supertest");
jest.mock("../../services/emailService");

const app = require("../../app");
const { loginUser } = require("../helpers/loginHelper");
const { createProject } = require("../helpers/projectHelper");

require("../helpers/setup");

test("should return all projects for the authenticated user", async () => {
  const { accessToken } = await loginUser();

  await createProject(accessToken);

  const res = await request(app)
    .get("/projects")
    .set("Authorization", `Bearer ${accessToken}`);

  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);

  expect(Array.isArray(res.body.projects)).toBe(true);
  expect(res.body.projects.length).toBe(1);

  expect(res.body.projects[0].title).toBe("ForgeOps");
});

test("should not allow another user to view someone else's project", async () => {
  // ---------- User A ----------
  const { accessToken: tokenA } = await loginUser();

  const { project: projectA } = await createProject(tokenA, {
    title: "Private Project",
    description: "Only User A can see this",
  });

  const projectId = projectA._id;

  // ---------- User B ----------
  const { accessToken: tokenB } = await loginUser({
    email: "userb@test.com",
  });

  // ---------- Attempt Read ----------
  const res = await request(app)
    .get(`/projects/${projectId}`)
    .set("Authorization", `Bearer ${tokenB}`);

  expect(res.status).toBe(403);
  expect(res.body.success).toBe(false);
});
