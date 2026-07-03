const express = require("express")
const router = express.Router()

const {
    createProject,
    getProjects,
    updateProject,
    deleteProject
} = require("../controllers/projectController")

const authMiddleware = require("../middleware/authMiddleware")

router.post("/projects", authMiddleware, createProject)
router.get("/projects", authMiddleware, getProjects)
router.put("/projects/:id", authMiddleware, updateProject)
router.delete("/projects/:id", authMiddleware, deleteProject)
module.exports = router