const Project = require("../models/project")

async function createProject(req, res) {
   
     const { title, description } = req.body
     
    const existingProject = await Project.findOne({
    owner: req.user.id,
    title
})

if (existingProject) {
    return res.status(409).send("Project with this title already exists")
}

    const project = new Project({
        title,
        description,
        owner: req.user.id
})

await project.save()

res.status(201).send("Project Created Successfully")
}

async function getProjects(req, res) {

    const projects = await Project.find({
        owner: req.user.id
    })

    res.json(projects)

}

async function updateProject(req, res) {
  
   const project = await Project.findById(req.params.id)

   if (!project) {
    return res.status(404).send("Project Not Found")
    }

    if (project.owner.toString() !== req.user.id) {
    return res.status(403).send("Forbidden")
    }

     const { title, description } = req.body

    project.title = title
    project.description = description

    await project.save()

    res.json(project)

}

async function deleteProject(req, res) {
    
    const project = await Project.findById(req.params.id)

    if (!project) {
    return res.status(404).send("Project Not Found")
    }

    if (project.owner.toString() !== req.user.id) {
    return res.status(403).send("Forbidden")
    }

await project.deleteOne()

res.send("Project Deleted Successfully")
}

module.exports = {
    createProject,
    getProjects,
    updateProject,
    deleteProject
}