const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const dbName = 'shoukhinabesh_db';

async function verifyAndCreateDb() {
  const envPath = path.join(__dirname, '.env');
  if (!fs.existsSync(envPath)) {
    console.error('❌ Error: apps/server/.env file not found!');
    process.exit(1);
  }

  const envContent = fs.readFileSync(envPath, 'utf8');
  const passwordMatch = envContent.match(/DATABASE_PASSWORD=(.*)/);
  const password = passwordMatch ? passwordMatch[1].trim().replace(/^['"]|['"]$/g, '') : '';
  const userMatch = envContent.match(/DATABASE_USER=(.*)/);
  const username = userMatch ? userMatch[1].trim().replace(/^['"]|['"]$/g, '') : 'postgres';
  const portMatch = envContent.match(/DATABASE_PORT=(.*)/);
  const port = portMatch ? Number(portMatch[1].trim()) : 5432;

  console.log(`🔌 Connecting to PostgreSQL (Host: localhost:${port}, User: ${username})...`);

  const client = new Client({
    host: 'localhost',
    port: port,
    user: username,
    password: password,
    database: 'postgres', // Connect to default maintenance DB first
  });

  try {
    await client.connect();
    console.log(`✅ Successfully authenticated with PostgreSQL!`);

    // Check if shoukhinabesh_db exists
    const res = await client.query(`SELECT datname FROM pg_database WHERE datname = $1;`, [dbName]);
    if (res.rows.length === 0) {
      console.log(`\n⏳ Database "${dbName}" not found in pgAdmin. Creating database automatically...`);
      await client.query(`CREATE DATABASE ${dbName};`);
      console.log(`✅ Database "${dbName}" created successfully! No manual work needed in pgAdmin!`);
    } else {
      console.log(`✅ Database "${dbName}" is ready!`);
    }

    await client.end();
    process.exit(0);
  } catch (err) {
    console.error(`\n❌ PostgreSQL Authentication Failed: ${err.message}`);
    console.error(`\n👉 ACTION REQUIRED FOR YOU:`);
    console.error(`1. You have opened apps/server/.env in your code editor.`);
    console.error(`2. On Line 10 (DB_PASSWORD=admin), replace 'admin' with the secret master password you set when installing PostgreSQL / pgAdmin 4.`);
    console.error(`3. Save the .env file and run 'npm run seed' again!`);
    if (client) await client.end().catch(() => {});
    process.exit(1);
  }
}

verifyAndCreateDb();
