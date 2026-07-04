const Project = require("../models/project")
const asyncHandler = require("../utils/asyncHandler")
const AppError = require("../utils/AppError");

const createProject = asyncHandler(async (req, res) =>  {
   
     const { title, description } = req.body
    

    const existingProject = await Project.findOne({
    owner: req.user.id,
    title
})

if (existingProject) {
    throw new AppError("Project with this title already exists", 409)
}

    const project = new Project({
        title,
        description,
        owner: req.user.id
})

await project.save()

res.status(201).send("Project Created Successfully")
})

const getProjects = asyncHandler(async (req, res) => {

    const projects = await Project.find({
        owner: req.user.id
    })

    res.json(projects)

})

const getProjectById = asyncHandler(async (req, res) => {

    const project = await Project.findById(req.params.id)

    if (!project) {
        throw new AppError("Project Not Found", 404)
    }

    if (project.owner.toString() !== req.user.id) {
        throw new AppError("Forbidden", 403)
    }

    res.json(project)

})

const updateProject = asyncHandler(async (req, res) => {
  
   const project = await Project.findById(req.params.id)

   if (!project) {
     throw new AppError("Project Not Found", 404)
    }

    if (project.owner.toString() !== req.user.id) {
    throw new AppError("Forbidden", 403)
    }

     const { title, description } = req.body
     

    project.title = title
    project.description = description

    await project.save()

    res.json(project)

})

const deleteProject = asyncHandler(async (req, res) => {
    
    const project = await Project.findById(req.params.id)

    if (!project) {
    throw new AppError("Project Not Found", 404)
    }

    if (project.owner.toString() !== req.user.id) {
    throw new AppError("Forbidden", 403)
    }

await project.deleteOne()

res.send("Project Deleted Successfully")
})

module.exports = {
    createProject,
    getProjects,
     getProjectById,
    updateProject,
    deleteProject
}