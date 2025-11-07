import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  const { id } = req.query; // MongoDB ID (String)

  if (!id) {
    return res.status(400).json({ message: 'Hiányzó ID' });
  }

  switch (req.method) {
    case 'GET':
      try {
        const ingatlan = await prisma.ingatlanok.findUnique({
          where: { id: id },
          include: { tipus: true },
        });
        if (ingatlan) {
          res.status(200).json(ingatlan);
        } else {
          res.status(404).json({ message: 'Ingatlan nem található' });
        }
      } catch (error) {
        res.status(500).json({ message: 'Szerver hiba', error });
      }
      break;

    case 'PUT':
      try {
        const updatedIngatlan = await prisma.ingatlanok.update({
          where: { id: id },
          data: req.body,
        });
        res.status(200).json(updatedIngatlan);
      } catch (error) {
        res.status(404).json({ message: 'Ingatlan nem található a frissítéshez', error });
      }
      break;

    case 'DELETE':
      try {
        await prisma.ingatlanok.delete({
          where: { id: id },
        });
        res.status(204).end(); // 204: No Content
      } catch (error) {
        res.status(404).json({ message: 'Ingatlan nem található a törléshez', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}