import prisma from '../prismaClient.js';

// Отримати всіх
export const getUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, email: true, fullName: true, role: true, createdAt: true }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching users' });
  }
};

// Змінити роль (Make Admin / Make User)
export const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body; // "ADMIN" або "USER"

    await prisma.user.update({
      where: { id: Number(id) },
      data: { role }
    });
    res.json({ message: 'Role updated' });
  } catch (error) {
    res.status(500).json({ error: 'Error updating role' });
  }
};

// Видалити юзера
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.user.delete({ where: { id: Number(id) } });
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user' });
  }
};