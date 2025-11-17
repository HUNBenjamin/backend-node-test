# Ingatlan API - Express.js Backend

A modern Express.js backend API for managing property listings (ingatlan), built with JavaScript, MongoDB/Prisma, and comprehensive Jest testing.

## 🚀 Features

- **Express.js** - Lightweight, fast web framework
- **Prisma ORM** - Type-safe database access
- **MongoDB** - NoSQL database for flexible data storage
- **Cluster Mode** - Multi-core processing support via environment variable
- **Jest Testing** - Comprehensive unit and integration tests
- **Error Handling** - Centralized error handling middleware
- **Environment Configuration** - .env-based configuration including CLUSTER setting

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- MongoDB connection string

## 🔧 Installation

```bash
# Install dependencies
npm install

# Generate Prisma client
npm run prisma:generate
```

## ⚙️ Configuration

Create a `.env` file in the root directory:

```env
DATABASE_URL=mongodb+srv://user:password@cluster.mongodb.net/dbname
CLUSTER=production      # Set to 'production' to enable cluster mode
NODE_ENV=development
PORT=3000
```

### Cluster Mode

- `CLUSTER=production` - Enables cluster mode with worker processes for each CPU core
- `CLUSTER=development` - Single-threaded mode (default)

## 📁 Project Structure

```
src/
├── app.js                 # Express app setup
├── server.js              # Server entry point with cluster support
├── controllers/           # Request handlers
│   └── ingatlanController.js
├── routes/                # API routes
│   └── ingatlan.js
└── middleware/            # Custom middleware
    └── errorHandler.js

tests/
├── app.test.js           # Express app tests
├── ingatlan.test.js      # Integration tests
└── controllers.test.js   # Unit tests

prisma/
└── schema.prisma         # Database schema

lib/
└── prisma.js            # Prisma client singleton
```

## 🚀 Getting Started

### Development

```bash
# Start development server
npm run dev

# Start with cluster mode enabled
CLUSTER=production npm run dev
```

### Production

```bash
# Start production server
npm start
```

The server will start on `http://localhost:3000` by default.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm test:coverage

# Run tests with logging
npm run test -- --verbose
```

## 📚 API Endpoints

### Base URL: `http://localhost:3000/api`

#### Health Check
```
GET /health
```

#### Ingatlan (Property) Endpoints

**Get all properties**
```
GET /ingatlan
Response: 200 OK
Body: Array of ingatlan objects
```

**Get property by ID**
```
GET /ingatlan/:id
Response: 200 OK or 404 Not Found
```

**Create property**
```
POST /ingatlan
Content-Type: application/json

{
  "nev": "Property Name",
  "cim": "Address",
  "ar": 1500000,
  "tipusId": "type-id"
}

Response: 201 Created
```

**Update property**
```
PUT /ingatlan/:id
Content-Type: application/json

{
  "nev": "Updated Name",
  "ar": 2000000
}

Response: 200 OK
```

**Delete property**
```
DELETE /ingatlan/:id
Response: 204 No Content
```

## 🛠️ Scripts

- `npm run dev` - Start development server
- `npm start` - Start production server
- `npm test` - Run Jest tests
- `npm test:watch` - Run tests in watch mode
- `npm test:coverage` - Generate test coverage report
- `npm run lint` - Run ESLint
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations

## 🔄 Cluster Mode

When `CLUSTER=production` is set in `.env`:

- The application spawns worker processes for each CPU core
- Requests are distributed across workers
- Failed workers are automatically restarted
- Graceful handling of multi-core systems

Example:
```bash
# On an 8-core system with cluster mode enabled
# Server will spawn 8 worker processes, each listening on port 3000
```

## 🧠 Error Handling

The API includes centralized error handling with Prisma-specific error mappings:

- `P2025` - Record not found → 404
- `P2002` - Unique constraint violation → 409
- `P2003` - Foreign key constraint → 400
- Generic errors → 500

## 🗄️ Database

Uses MongoDB with Prisma ORM. Schema is defined in `prisma/schema.prisma`.

Key models:
- `ingatlanok` - Property listings
- `tipus` - Property types (Houses, Apartments, etc.)

## 📝 Testing Coverage

Tests cover:
- ✅ All CRUD operations
- ✅ Error handling and validation
- ✅ Database error scenarios
- ✅ HTTP status codes
- ✅ Request/response formats
- ✅ Route 404 handling

## 🐛 Troubleshooting

### Port already in use
```bash
# Use a different port
PORT=3001 npm run dev
```

### Database connection issues
- Verify `DATABASE_URL` in `.env`
- Ensure MongoDB cluster is accessible
- Check network permissions

### Cluster mode not working
- Verify `CLUSTER=production` in `.env`
- Check Node.js version is >= 18.0.0

## 📦 Dependencies

- **express** - Web framework
- **@prisma/client** - Database ORM
- **dotenv** - Environment configuration
- **jest** - Testing framework
- **supertest** - HTTP testing library

## 📄 License

MIT
