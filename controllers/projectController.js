const Project = require("../models/project")
const asyncHandler = require("../utils/asyncHandler")
const AppError = require("../utils/AppError")
const { uploadToCloudinary } = require("../services/uploadService");

const createProject = asyncHandler(async (req, res) => {

    const {
        title,
        description,
        status,
        priority,
        dueDate,
        tags
    } = req.body

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
        status,
        priority,
        dueDate,
        tags,
        owner: req.user.id
    })

    await project.save()

    res.status(201).json({
        success: true,
        message: "Project Created Successfully",
        project
    })
})

const getProjects = asyncHandler(async (req, res) => {

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 10
    const skip = (page - 1) * limit

    const search = req.query.search || ""
    const sort = req.query.sort || "newest"
    const status = req.query.status
    const priority = req.query.priority

    const filter = {
        owner: req.user.id
    }

    if (status) {
        filter.status = status
    }

    if (priority) {
        filter.priority = priority
    }

    if (search) {
        filter.title = {
            $regex: search,
            $options: "i"
        }
    }

    let sortOption = {
        createdAt: -1
    }

    if (sort === "oldest") {
        sortOption = {
            createdAt: 1
        }
    }

    const totalProjects = await Project.countDocuments(filter)
    const totalPages = Math.ceil(totalProjects / limit)

    const projects = await Project.find(filter)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)

    res.json({
        success: true,
        page,
        limit,
        totalProjects,
        totalPages,
        projects
    })
})

const getProjectById = asyncHandler(async (req, res) => {

    const project = await Project.findById(req.params.id)

    if (!project) {
        throw new AppError("Project Not Found", 404)
    }

    if (project.owner.toString() !== req.user.id) {
        throw new AppError("Forbidden", 403)
    }

    res.json({
    success: true,
    project
    })
})

const updateProject = asyncHandler(async (req, res) => {

    const project = await Project.findById(req.params.id)

    if (!project) {
        throw new AppError("Project Not Found", 404)
    }

    if (project.owner.toString() !== req.user.id) {
        throw new AppError("Forbidden", 403)
    }

    const {
        title,
        description,
        status,
        priority,
        dueDate,
        tags
    } = req.body

    if (title !== undefined) {
        project.title = title
    }

    if (description !== undefined) {
        project.description = description
    }

    if (status !== undefined) {
        project.status = status
    }

    if (priority !== undefined) {
        project.priority = priority
    }

    if (dueDate !== undefined) {
        project.dueDate = dueDate
    }

    if (tags !== undefined) {
        project.tags = tags
    }

    await project.save()

    res.json({
        success: true,
        message: "Project Updated Successfully",
        project
    })
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

    res.json({
        success: true,
        message: "Project Deleted Successfully"
    })
})

async function uploadProjectDocument(req, res) {
    if (!req.file) {
        throw new AppError("Please upload a document", 400);
    }

    const project = await Project.findById(req.params.id);

    if (!project) {
        throw new AppError("Project not found", 404);
    }

    if (project.owner.toString() !== req.user._id.toString()) {
        throw new AppError("Unauthorized", 403);
    }

    const result = await uploadToCloudinary(
        req.file.buffer,
        "forgeops/project-documents"
    );

    project.documents.push({
        publicId: result.public_id,
        url: result.secure_url,
        originalName: req.file.originalname
    });

    await project.save();

    res.status(200).json({
        success: true,
        message: "Document uploaded successfully",
        document: project.documents[project.documents.length - 1]
    });
}

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    uploadProjectDocument,
}