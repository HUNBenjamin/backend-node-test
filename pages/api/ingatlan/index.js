import prisma from '../../../lib/prisma';

export default async function handler(req, res) {
  switch (req.method) {
    case 'GET':
      try {
        const ingatlanok = await prisma.ingatlanok.findMany({
          include: { tipus: true }, // Kapcsolódó típus adatokkal együtt
        });
        res.status(200).json(ingatlanok);
      } catch (error) {
        res.status(500).json({ message: 'Hiba történt az adatok lekérésekor', error });
      }
      break;

    case 'POST':
      try {
        const data = req.body;
        const newIngatlan = await prisma.ingatlanok.create({
          data: data,
        });
        res.status(201).json(newIngatlan); // 201: Created
      } catch (error) {
        res.status(400).json({ message: 'Hiba történt a létrehozáskor', error });
      }
      break;

    default:
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}