const Project = require("../models/project")
const AppError = require("../utils/AppError")
const { uploadToCloudinary } = require("./uploadService")

const createProject = async ({ projectData, userId }) => {
    const existingProject = await Project.findOne({ owner: userId, title: projectData.title })

    if (existingProject) {
        throw new AppError("Project with this title already exists", 409)
    }

    const project = new Project({ ...projectData, owner: userId })
    await project.save()

    return project
}

const getProjects = async ({ query, userId }) => {
    const page = Number(query.page) || 1
    const limit = Number(query.limit) || 10
    const skip = (page - 1) * limit
    const search = query.search || ""
    const sort = query.sort || "newest"
    const filter = { owner: userId }

    if (query.status) filter.status = query.status
    if (query.priority) filter.priority = query.priority
    if (search) filter.title = { $regex: search, $options: "i" }

    const sortOption = sort === "oldest" ? { createdAt: 1 } : { createdAt: -1 }
    const totalProjects = await Project.countDocuments(filter)
    const totalPages = Math.ceil(totalProjects / limit)
    const projects = await Project.find(filter).sort(sortOption).skip(skip).limit(limit)

    return { page, limit, totalProjects, totalPages, projects }
}

const findOwnedProject = async ({ projectId, userId, notFoundMessage = "Project Not Found", forbiddenMessage = "Forbidden" }) => {
    const project = await Project.findById(projectId)

    if (!project) throw new AppError(notFoundMessage, 404)
    if (project.owner.toString() !== userId) throw new AppError(forbiddenMessage, 403)

    return project
}

const getProjectById = ({ projectId, userId }) => findOwnedProject({ projectId, userId })

const updateProject = async ({ projectId, userId, updates }) => {
    const project = await findOwnedProject({ projectId, userId })
    const x = updates;
    ["title", "description", "status", "priority", "dueDate", "tags"].forEach((field) => {
        if (updates[field] !== undefined) project[field] = updates[field]
    })

    await project.save()
    return project
}

const deleteProject = async ({ projectId, userId }) => {
    const project = await findOwnedProject({ projectId, userId })
    await project.deleteOne()
}

const uploadProjectDocument = async ({ projectId, userId, file }) => {
    if (!file) throw new AppError("Please upload a document", 400)

    const project = await findOwnedProject({
        projectId,
        userId,
        notFoundMessage: "Project not found",
        forbiddenMessage: "Unauthorized"
    })
    const result = await uploadToCloudinary(file.buffer, "forgeops/project-documents")

    project.documents.push({
        publicId: result.public_id,
        url: result.secure_url,
        originalName: file.originalname
    })
    await project.save()

    return project.documents[project.documents.length - 1]
}

module.exports = { createProject, getProjects, getProjectById, updateProject, deleteProject, uploadProjectDocument }
