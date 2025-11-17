import prisma from '../../lib/prisma.js';

// Get all ingatlanok
export const getAllIngatlan = async (req, res, next) => {
  try {
    const ingatlanok = await prisma.ingatlanok.findMany({
      include: { tipus: true },
    });
    res.status(200).json(ingatlanok);
  } catch (error) {
    next(error);
  }
};

// Get ingatlan by ID
export const getIngatlanById = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Hiányzó ID' });
    }

    const ingatlan = await prisma.ingatlanok.findUnique({
      where: { id },
      include: { tipus: true },
    });

    if (!ingatlan) {
      return res.status(404).json({ message: 'Ingatlan nem található' });
    }

    res.status(200).json(ingatlan);
  } catch (error) {
    next(error);
  }
};

// Create ingatlan
export const createIngatlan = async (req, res, next) => {
  try {
    const data = req.body;

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Hiányznak a kötelező adatok' });
    }

    const newIngatlan = await prisma.ingatlanok.create({
      data,
      include: { tipus: true },
    });

    res.status(201).json(newIngatlan);
  } catch (error) {
    next(error);
  }
};

// Update ingatlan
export const updateIngatlan = async (req, res, next) => {
  try {
    const { id } = req.params;
    const data = req.body;

    if (!id) {
      return res.status(400).json({ message: 'Hiányzó ID' });
    }

    if (!data || Object.keys(data).length === 0) {
      return res.status(400).json({ message: 'Nincs mit frissíteni' });
    }

    const updatedIngatlan = await prisma.ingatlanok.update({
      where: { id },
      data,
      include: { tipus: true },
    });

    res.status(200).json(updatedIngatlan);
  } catch (error) {
    next(error);
  }
};

// Delete ingatlan
export const deleteIngatlan = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Hiányzó ID' });
    }

    await prisma.ingatlanok.delete({
      where: { id },
    });

    res.status(204).end();
  } catch (error) {
    next(error);
  }
};
