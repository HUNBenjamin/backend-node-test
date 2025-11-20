# Ingatlan API

Express.js backend az ingatlankezeléshez.

## 🚀 Használat

``ash
npm install
npm run dev      # Fejlesztési mód
npm test         # Tesztek futtatása
npm start        # Üzemi mód
``

## 📁 Szerkezet

``
src/
├── app.js
├── server.js
├── routes/ingatlan.js
└── middleware/errorHandler.js

tests/
├── crud.test.js
├── errors.test.js
├── misc.test.js
├── existence.test.js
├── mockMethodsExistence.test.js
└── helpers/mockCollection.js
``

## 🔌 API Végpontok

- GET / - API üdvözlés
- GET /health - Ellenőrzés
- GET /api/ingatlan - Összes ingatlan
- POST /api/ingatlan - Új ingatlan
- GET /api/ingatlan/:id - Egy ingatlan
- PUT /api/ingatlan/:id - Frissítés
- DELETE /api/ingatlan/:id - Törlés

## 📊 Tesztek

- crud.test.js - CRUD műveletek
- errors.test.js - Hibakezelés
- misc.test.js - Általános és hibaválaszok
- existence.test.js - Módszerek hiánya
- mockMethodsExistence.test.js - Mock kollekciómetódusok

``ash
npm test         # Összes teszt
``

## 📝 Megjegyzés

A projekt az Ingatlan API-t Express.js-sel valósítja meg, MongoDB-vel az adatbázishoz.
