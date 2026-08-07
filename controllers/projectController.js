const asyncHandler = require("../utils/asyncHandler")
const projectService = require("../services/projectService")

const createProject = asyncHandler(async (req, res) => {
    const project = await projectService.createProject({ projectData: req.body, userId: req.user.id })
    res.status(201).json({ success: true, message: "Project Created Successfully", project })
})

const getProjects = asyncHandler(async (req, res) => {
    const result = await projectService.getProjects({ query: req.query, userId: req.user.id })
    res.json({ success: true, ...result })
})

const getProjectById = asyncHandler(async (req, res) => {
    const project = await projectService.getProjectById({ projectId: req.params.id, userId: req.user.id })
    res.json({ success: true, project })
})

const updateProject = asyncHandler(async (req, res) => {
    const project = await projectService.updateProject({ projectId: req.params.id, userId: req.user.id, updates: req.body })
    res.json({ success: true, message: "Project Updated Successfully", project })
})

const deleteProject = asyncHandler(async (req, res) => {
    await projectService.deleteProject({ projectId: req.params.id, userId: req.user.id })
    res.json({ success: true, message: "Project Deleted Successfully" })
})

const uploadProjectDocument = asyncHandler(async (req, res) => {
    const document = await projectService.uploadProjectDocument({ projectId: req.params.id, userId: req.user.id, file: req.file })
    res.status(200).json({ success: true, message: "Document uploaded successfully", document })
})

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, uploadProjectDocument }
