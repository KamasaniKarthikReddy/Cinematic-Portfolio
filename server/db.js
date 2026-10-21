import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  port: Number(process.env.DB_PORT) || 3306,
  database: process.env.DB_NAME || 'portfolio_db',
  connectTimeout: 3000,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
};

let pool = null;
let isConnected = false;

// Default initial projects seed
const initialProjects = [
  {
    number: '01',
    title: 'Blockchain Digital Voting System',
    category: 'BLOCKCHAIN + AI + CYBERSECURITY',
    description:
      'Decentralized, tamper-proof digital voting infrastructure engineered with smart contract governance and AI-powered anomaly detection. Features a privacy-preserving architecture guaranteeing one-person-one-vote integrity, cryptographic audit trails, and transparent real-time vote verification.',
    github_url: 'https://github.com/karthikreddy',
    tech: JSON.stringify([
      'Blockchain',
      'Solidity',
      'Smart Contracts',
      'Python',
      'AI Anomaly Detection',
      'Cryptography',
      'React.js',
      'Web3.js',
      'FastAPI',
      'Zero-Knowledge',
    ]),
    metrics: JSON.stringify([
      { label: 'GOVERNANCE', value: 'Smart Contract / 1-Vote' },
      { label: 'INTELLIGENCE', value: 'AI Fraud & Anomaly Detection' },
      { label: 'SECURITY', value: 'Tamper-Proof & Real-Time' },
    ]),
  },
  {
    number: '02',
    title: 'SwaRakshaAI',
    category: 'HEALTHCARE AI / MEDICAL INTELLIGENCE',
    description:
      'Intelligent clinical healthcare ecosystem featuring an AI symptom checker, dedicated HealthGPT chatbot, and automated medical report assistance. Equips healthcare providers with synchronized doctor dashboards, seamless patient management, and secure authenticated record workflows.',
    github_url: 'https://github.com/karthikreddy',
    tech: JSON.stringify([
      'React.js',
      'Node.js',
      'Express.js',
      'MongoDB Atlas',
      'Firebase',
      'OpenAI API / HealthGPT',
      'JWT Auth',
      'REST APIs',
      'Tailwind CSS',
    ]),
    metrics: JSON.stringify([
      { label: 'AI DIAGNOSTICS', value: 'Symptom Checker & HealthGPT' },
      { label: 'CLINICAL PORTAL', value: 'Doctor & Patient Dashboards' },
      { label: 'RECORDS', value: 'AI Medical Report Assistance' },
    ]),
  },
  {
    number: '03',
    title: 'Multi-Tenant SaaS Platform',
    category: 'CLOUD / DISTRIBUTED SYSTEM',
    description:
      'Enterprise-grade multi-tenant platform built for unified management of teams, projects, and execution lifecycles. Architected with strict tenant data isolation, granular Role-Based Access Control (RBAC), and containerized deployments.',
    github_url: 'https://github.com/lohithadamisetti123',
    tech: JSON.stringify([
      'Node.js',
      'Express.js',
      'PostgreSQL',
      'React',
      'Docker',
      'JWT',
      'RBAC',
      'REST APIs',
    ]),
    metrics: JSON.stringify([
      { label: 'ARCHITECTURE', value: 'Multi-Tenant' },
      { label: 'SECURITY', value: 'RBAC Isolation' },
      { label: 'CONTAINERS', value: 'Docker Compose' },
    ]),
  },
  {
    number: '04',
    title: 'Payment Gateway with Hosted Checkout',
    category: 'FINTECH / PAYMENT SYSTEMS',
    description:
      'End-to-end hosted payment gateway infrastructure supporting seamless merchant order generation, multi-currency processing, and secure consumer checkout via UPI and Cards with webhook transaction verification.',
    github_url: 'https://github.com/lohithadamisetti123',
    tech: JSON.stringify([
      'Node.js',
      'Spring Boot',
      'PostgreSQL',
      'React',
      'Docker',
      'REST APIs',
      'UPI / Card Integrations',
    ]),
    metrics: JSON.stringify([
      { label: 'PROTOCOLS', value: 'UPI & Cards' },
      { label: 'BACKEND', value: 'Spring Boot + Node' },
      { label: 'DATABASE', value: 'ACID PostgreSQL' },
    ]),
  },
];

export async function initDatabase() {
  try {
    // 1. Establish connection to MySQL server without database specified
    const rootConn = await mysql.createConnection({
      host: dbConfig.host,
      user: dbConfig.user,
      password: dbConfig.password,
      port: dbConfig.port,
      connectTimeout: 3000,
    });

    // 2. Create database if it does not exist
    await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
    await rootConn.end();

    // 3. Connect pool to the target database
    pool = mysql.createPool(dbConfig);

    // 4. Create messages table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(50) DEFAULT 'unread',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 5. Create projects table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id INT AUTO_INCREMENT PRIMARY KEY,
        number VARCHAR(10) NOT NULL,
        title VARCHAR(255) NOT NULL,
        category VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        github_url VARCHAR(500) DEFAULT '',
        tech JSON NOT NULL,
        metrics JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `);

    // 6. Seed initial projects if table is empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM projects');
    if (rows[0].count === 0) {
      for (const p of initialProjects) {
        await pool.query(
          `INSERT INTO projects (number, title, category, description, github_url, tech, metrics)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [p.number, p.title, p.category, p.description, p.github_url, p.tech, p.metrics]
        );
      }
      console.log('✅ Seeded 4 initial portfolio projects into MySQL database.');
    }

    isConnected = true;
    console.log(`🚀 MySQL Connected successfully to database: ${dbConfig.database}`);
    return { success: true };
  } catch (err) {
    isConnected = false;
    console.error('⚠️ MySQL Connection Error:', err.message);
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 Tip: Ensure the MySQL service (MYSQL80) is started in Windows Services.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Tip: Check DB_PASSWORD in your .env file to match your MySQL root password.');
    }
    return { success: false, error: err.message };
  }
}

export function getPool() {
  return pool;
}

export function isDbConnected() {
  return isConnected;
}
