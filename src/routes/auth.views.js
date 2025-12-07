import express from "express";

const router = express.Router();

router.get("/register", (req, res) => {
    res.sendFile("register.html",{ root: "public/html" });
});

router.get("/login", (req, res) => {
    res.sendFile("login.html",{ root: "public/html" });
});

router.get("/profile", (req, res) => {
    res.sendFile("profile.html", { root: "public/html" });
});

export default router;