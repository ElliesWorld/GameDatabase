import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

// GET all users
router.get("/", async (req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// POST create user
router.post("/", async (req, res) => {
  const newUser = await prisma.user.create({
    data: req.body
  });
  res.json(newUser);
});

// PUT update user
router.put("/:id", async (req, res) => {
  const updatedUser = await prisma.user.update({
    where: { id: req.params.id },
    data: req.body
  });
  res.json(updatedUser);
});

// DELETE user
router.delete("/:id", async (req, res) => {
  await prisma.user.delete({
    where: { id: req.params.id }
  });
  res.json({ message: "User deleted" });
});

export default router;