const express = require("express")
const router = express.Router()

const validateObjectId = require("../validators/objectIdValidator")
const upload = require("../middleware/uploadMiddleware");

const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject,
    uploadProjectDocument
} = require("../controllers/projectController")

const authMiddleware = require("../middleware/authMiddleware")

const {
    validateProject,
    validateProjectUpdate
} = require("../validators/projectValidator")
const handleValidationErrors = require("../middleware/handleValidationErrors")

router.post(
    "/",
    authMiddleware,
    validateProject,
    handleValidationErrors({ format: "fields" }),
    createProject
)

router.get(
    "/",
    authMiddleware,
    getProjects
)

router.get(
    "/:id",
    authMiddleware,
    validateObjectId,
    getProjectById
)

router.put(
    "/:id",
    authMiddleware,
    validateObjectId,
    validateProjectUpdate,
    handleValidationErrors({ format: "fields" }),
    updateProject
)

router.delete(
    "/:id",
    authMiddleware,
    validateObjectId,
    deleteProject
)

router.post(
    "/:id/documents",
    authMiddleware,
    upload.single("document"),
    uploadProjectDocument
);

module.exports = router
