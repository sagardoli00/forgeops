const express = require("express")
const router = express.Router()

const validateObjectId = require("../validators/objectIdValidator")

const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require("../controllers/projectController")

const authMiddleware = require("../middleware/authMiddleware")

const {
    validateProject,
    validateProjectUpdate,
    handleValidationErrors
} = require("../validators/projectValidator")

router.post(
    "/projects",
    authMiddleware,
    validateProject,
    handleValidationErrors,
    createProject
)

router.get(
    "/projects",
    authMiddleware,
    getProjects
)

router.get(
    "/projects/:id",
    authMiddleware,
    validateObjectId,
    getProjectById
)

router.put(
    "/projects/:id",
    authMiddleware,
    validateObjectId,
    validateProjectUpdate,
    handleValidationErrors,
    updateProject
)

router.delete(
    "/projects/:id",
    authMiddleware,
    validateObjectId,
    deleteProject
)

module.exports = router