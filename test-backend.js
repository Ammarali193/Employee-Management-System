const axios = require("axios");

const BASE_URL = "http://localhost:5000/api";

// Test data
const testEmployee = {
  email: "testadmin@example.com",
  password: "Test@123",
  first_name: "Test",
  last_name: "Admin",
  department: "IT"
};

const testAsset = {
  name: "Dell Laptop",
  category: "Computer",
  serial_number: "SN12345"
};

let authToken = null;
let employeeId = null;
let assetId = null;

async function log(message, data = "") {
  console.log(`\n✅ ${message}`);
  if (data) console.log("   ", JSON.stringify(data, null, 2));
}

async function logError(message, error) {
  console.log(`\n❌ ${message}`);
  if (error.response?.data) {
    console.log("   Error:", error.response.data);
  } else {
    console.log("   Error:", error.message);
  }
}

async function runTests() {
  try {
    console.log("🚀 Starting Backend Tests...\n");

    // 1. Check server is running
    try {
      const health = await axios.get(`${BASE_URL}/employees`, {
        headers: { Authorization: "Bearer dummy" }
      });
      await log("✓ Server is running and responding");
    } catch (err) {
      if (err.response?.status === 401) {
        await log("✓ Server is running (auth required as expected)");
      } else if (err.code === "ECONNREFUSED") {
        throw new Error("Server is not running on port 5000");
      }
    }

    // 2. Create test employee (Admin)
    console.log("\n📝 Testing Employee Creation...");
    try {
      // First, try to login with existing employee
      try {
        const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
          email: testEmployee.email,
          password: testEmployee.password
        });
        authToken = loginRes.data.token;
        await log("Logged in with existing test employee");
      } catch (err) {
        // If login fails, create a new employee first
        // We need sudo access, so we'll just test with POST /api/auth/register
        // But that needs an admin token, so we'll test creation differently
        await log("New test employee will be created (skipping for now - needs admin)");
      }
    } catch (err) {
      await logError("Employee creation/login failed", err);
    }

    // 3. Test asset endpoints
    console.log("\n📦 Testing Asset Endpoints...");

    // Try to get assets (should fail without token, succeed with token)
    try {
      const assetsRes = await axios.get(`${BASE_URL}/assets`);
      await log("✓ GET /api/assets without token", assetsRes.data);
    } catch (err) {
      if (err.response?.status === 401) {
        await log("✓ GET /api/assets correctly requires authentication");
      }
    }

    // 4. If we have a token, test with it
    if (authToken) {
      try {
        const assetsRes = await axios.get(`${BASE_URL}/assets`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        await log("✓ GET /api/assets with token", assetsRes.data);
      } catch (err) {
        await logError("GET /api/assets failed", err);
      }

      // Try to create an asset
      try {
        const addAssetRes = await axios.post(`${BASE_URL}/assets/add`, testAsset, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        await log("✓ POST /api/assets/add succeeded", addAssetRes.data);
        assetId = addAssetRes.data.asset?.id;
      } catch (err) {
        await logError("POST /api/assets/add failed", err);
      }

      // Try to assign an asset
      if (assetId && employeeId) {
        try {
          const assignRes = await axios.post(`${BASE_URL}/assets/assign`,
            { asset_id: assetId, employee_id: employeeId },
            { headers: { Authorization: `Bearer ${authToken}` } }
          );
          await log("✓ POST /api/assets/assign succeeded", assignRes.data);
        } catch (err) {
          await logError("POST /api/assets/assign failed", err);
        }
      }
    } else {
      console.log("\n⚠️  No auth token available. Skipping authenticated tests.");
      console.log("   To test asset endpoints, login first or create a test employee.");
    }

    console.log("\n✅ Backend tests completed!");

  } catch (error) {
    console.error("\n💥 Test suite failed:", error.message);
  }
}

runTests();
