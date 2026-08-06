const request = require("supertest");
const Project = require("../../models/project");
jest.mock("../../services/emailService");

const app = require("../../app");
const { loginUser } = require("../helpers/loginHelper");
const { createProject } = require("../helpers/projectHelper");

require("../helpers/setup");

describe("POST /projects", () => {
  test("should reject project creation with invalid data", async () => {
    const { accessToken } = await loginUser();

    const res = await request(app)
      .post("/projects")
      .set("Authorization", `Bearer ${accessToken}`)
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

test("should create a project successfully", async () => {
  const { accessToken } = await loginUser();

  const { response, projectData } = await createProject(accessToken, {
    status: "Completed",
  });

  expect(response.status).toBe(201);
  expect(response.body.success).toBe(true);

  const project = await Project.findOne({
    title: projectData.title,
  });

  expect(project).not.toBeNull();
  expect(project.title).toBe(projectData.title);
  expect(project.description).toBe(projectData.description);
});