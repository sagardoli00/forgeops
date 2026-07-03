const express = require("express")
const router = express.Router()

const {
    createProject,
    getProjects,
    updateProject,
    deleteProject
} = require("../controllers/projectController")

const authMiddleware = require("../middleware/authMiddleware")
const {
    validateProject,
    handleValidationErrors
} = require("../validators/projectValidator")


router.post(
    "/projects",
    authMiddleware,
    validateProject,
    handleValidationErrors,
    createProject
)
router.get("/projects", authMiddleware, getProjects)
router.put("/projects/:id", authMiddleware, updateProject)
router.delete("/projects/:id", authMiddleware, deleteProject)
module.exports = router