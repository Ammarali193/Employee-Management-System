const axios = require("axios");
const pool = require("./config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const BASE_URL = "http://localhost:54112/api";

// Test data
const testEmployee = {
  email: "testadmin@example.com",
  password: "Test@123",
  first_name: "Test",
  last_name: "Admin",
  department: "IT",
  role: "Admin"
};

const testAsset = {
  name: "Dell XPS 13",
  category: "Laptop",
  serial_number: "XPS-12345-ABC"
};

let authToken = null;
let employeeId = null;
let assetId = null;

function log(message, data = "") {
  console.log(`\n✅ ${message}`);
  if (data) console.log("   ", JSON.stringify(data, null, 2));
}

function logError(message, error) {
  console.log(`\n❌ ${message}`);
  if (error.response?.data) {
    console.log("   Error:", error.response.data);
  } else {
    console.log("   Error:", error.message);
  }
}

async function setupTestData() {
  console.log("\n🔧 Setting up test data...");
  try {
    // Check if test employee exists
    const existing = await pool.query(
      "SELECT id FROM employees WHERE email = $1",
      [testEmployee.email]
    );

    if (existing.rows.length > 0) {
      employeeId = existing.rows[0].id;
      log("Test employee already exists", { id: employeeId, email: testEmployee.email });
      return;
    }

    // Create test employee
    const hashedPassword = await bcrypt.hash(testEmployee.password, 10);
    const result = await pool.query(
      `INSERT INTO employees (first_name, last_name, email, password, department, role)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, email, role`,
      [
        testEmployee.first_name,
        testEmployee.last_name,
        testEmployee.email,
        hashedPassword,
        testEmployee.department,
        testEmployee.role
      ]
    );

    employeeId = result.rows[0].id;
    log("Created test employee", result.rows[0]);
  } catch (error) {
    logError("Failed to set up test data", error);
    throw error;
  }
}

async function login() {
  console.log("\n🔐 Testing authentication...");
  try {
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: testEmployee.email,
      password: testEmployee.password
    });

    authToken = loginRes.data.token;
    log("✓ Login successful", { token: authToken.substring(0, 20) + "..." });
  } catch (error) {
    logError("Login failed", error);
    throw error;
  }
}

async function testAssetEndpoints() {
  console.log("\n📦 Testing Asset Endpoints...");

  if (!authToken) {
    console.log("⚠️  No auth token. Skipping asset tests.");
    return;
  }

  const config = { headers: { Authorization: `Bearer ${authToken}` } };

  try {
    // Get all assets
    const getRes = await axios.get(`${BASE_URL}/assets`, config);
    log("✓ GET /api/assets", {
      count: getRes.data.assets?.length || 0
    });
  } catch (error) {
    logError("GET /api/assets failed", error);
  }

  try {
    // Create asset
    const addRes = await axios.post(`${BASE_URL}/assets/add`, testAsset, config);
    assetId = addRes.data.asset?.id;
    log("✓ POST /api/assets/add", addRes.data);
  } catch (error) {
    logError("POST /api/assets/add failed", error);
    console.log("   Status:", error.response?.status);
    console.log("   Data:", error.response?.data);
  }

  // Assign asset if we have both asset and employee
  if (assetId && employeeId) {
    try {
      const assignRes = await axios.post(
        `${BASE_URL}/assets/assign`,
        { asset_id: assetId, employee_id: employeeId },
        config
      );
      log("✓ POST /api/assets/assign", assignRes.data);
    } catch (error) {
      logError("POST /api/assets/assign failed", error);
    }
  }

  // Get assets again to verify
  try {
    const getRes = await axios.get(`${BASE_URL}/assets`, config);
    log("✓ GET /api/assets (after operations)", {
      count: getRes.data.assets?.length || 0
    });
  } catch (error) {
    logError("GET /api/assets (final) failed", error);
  }
}

async function runFullTests() {
  try {
    console.log("🚀 Starting Full Backend Tests (with data setup)...");

    await setupTestData();
    await login();
    await testAssetEndpoints();

    console.log("\n✅ All tests completed!");
    console.log("\n📋 Summary:");
    console.log(`   - Test Employee ID: ${employeeId}`);
    console.log(`   - Test Asset ID: ${assetId}`);
    console.log(`   - Auth Token: ${authToken?.substring(0, 20)}...`);

  } catch (error) {
    console.error("\n💥 Test suite failed:", error.message);
  } finally {
    // Close database connection
    await pool.end();
    process.exit(0);
  }
}

runFullTests();
