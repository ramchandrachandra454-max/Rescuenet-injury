// Full Integration Test for InjuryAI Express Server via Windows Named Pipe IPC
process.env.NODE_ENV = "test";
import http from "node:http";

async function runTests() {
  console.log("Loading InjuryAI API module...");
  const { app } = await import("./server/index.js");

  const pipePath = `\\\\.\\pipe\\injuryai-test-${Date.now()}`;
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(pipePath, resolve));
  console.log(`Test server running over IPC Pipe: ${pipePath}`);

  function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
      const payload = body ? JSON.stringify(body) : null;
      const options = {
        socketPath: pipePath,
        path,
        method,
        headers: {
          "Accept": "application/json",
          ...(payload ? {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(payload)
          } : {})
        }
      };

      const req = http.request(options, (res) => {
        let resData = "";
        res.on("data", (chunk) => { resData += chunk; });
        res.on("end", () => {
          let json = null;
          try {
            json = JSON.parse(resData);
          } catch {
            json = resData;
          }
          resolve({ status: res.statusCode, data: json, headers: res.headers });
        });
      });

      req.on("error", reject);
      if (payload) req.write(payload);
      req.end();
    });
  }

  const checks = [];
  async function check(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      checks.push({ name, passed: true });
    } catch (err) {
      console.error(`✗ FAIL: ${name} - ${err.message}`);
      checks.push({ name, passed: false, error: err.message });
    }
  }

  // 1. Health Endpoint
  await check("GET /api/health", async () => {
    const res = await request("GET", "/api/health");
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.data.status !== "ok" || !res.data.stats) throw new Error("Invalid health payload");
  });

  // 2. Real Stats Endpoint
  await check("GET /api/stats", async () => {
    const res = await request("GET", "/api/stats");
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (typeof res.data.totalRequests !== "number" || typeof res.data.activeRequests !== "number") {
      throw new Error("Stats not returned as numbers");
    }
  });

  // 3. Create Emergency Request (Red Alert)
  let reqId = "";
  await check("POST /api/emergency-requests", async () => {
    const res = await request("POST", "/api/emergency-requests", {
      category: "Injury",
      priority: "Critical",
      description: "Severe laceration on highway with bystander assistance",
      latitude: 37.7749,
      longitude: -122.4194,
      contactName: "John Citizen",
      contactPhone: "+1 (555) 123-4567"
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    if (!res.data.id || !res.data.id.startsWith("REQ-")) throw new Error("ID generation failed");
    reqId = res.data.id;
  });

  // 4. Fetch Emergency Request by ID
  await check("GET /api/emergency-requests/:id", async () => {
    const res = await request("GET", `/api/emergency-requests/${reqId}`);
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.data.id !== reqId) throw new Error("ID mismatch");
  });

  // 5. Update Status & Timeline Log
  await check("PATCH /api/emergency-requests/:id/status", async () => {
    const res = await request("PATCH", `/api/emergency-requests/${reqId}/status`, {
      status: "en_route",
      note: "Volunteer paramedic dispatched"
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (res.data.status !== "en_route") throw new Error("Status was not updated");
  });

  // 6. Register Volunteer
  let volunteerId = "";
  await check("POST /api/volunteers", async () => {
    const res = await request("POST", "/api/volunteers", {
      name: "Samira Khan",
      role: "Emergency EMT",
      phone: "+1 (555) 777-8888",
      cprCertified: true,
      firstAidCertified: true,
      latitude: 37.775,
      longitude: -122.418
    });
    if (res.status !== 201) throw new Error(`Status ${res.status}`);
    volunteerId = res.data.id;
  });

  // 7. Volunteer Respond to Emergency Request
  await check("POST /api/volunteers/:id/respond", async () => {
    const res = await request("POST", `/api/volunteers/${volunteerId}/respond`, {
      requestId: reqId
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
  });

  // 8. List Verified Hospitals
  await check("GET /api/hospitals", async () => {
    const res = await request("GET", "/api/hospitals");
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.data.hospitals) || res.data.hospitals.length === 0) throw new Error("Empty hospitals list");
  });

  // 9. AI Assistant Smart First-Aid Engine
  await check("POST /api/ai/chat (Clinical CPR Guidance)", async () => {
    const res = await request("POST", "/api/ai/chat", {
      message: "How to perform adult CPR compressions?"
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.reply || !res.data.reply.includes("CPR")) throw new Error("No CPR advice in reply");
  });

  // 10. Admin Verify Passcode
  await check("POST /api/admin/verify", async () => {
    const res = await request("POST", "/api/admin/verify", {
      passcode: "admin123"
    });
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!res.data.authenticated) throw new Error("Admin authentication failed");
  });

  // 11. Cryptographic Audit Logs
  await check("GET /api/audit-logs", async () => {
    const res = await request("GET", "/api/audit-logs");
    if (res.status !== 200) throw new Error(`Status ${res.status}`);
    if (!Array.isArray(res.data.logs) || res.data.logs.length === 0) throw new Error("Audit log empty");
  });

  // 12. QR Emergency Profile Endpoints
  let profileToken = "";
  await check("POST & GET /api/emergency-profiles", async () => {
    const createRes = await request("POST", "/api/emergency-profiles", {
      name: "Jane Doe",
      bloodGroup: "A+",
      allergies: "Aspirin",
      conditions: "Asthma",
      emergencyContactName: "Dr. Smith",
      emergencyContactPhone: "+1 (555) 999-0000"
    });
    if (createRes.status !== 201) throw new Error(`Create Status ${createRes.status}`);
    profileToken = createRes.data.token;

    const getRes = await request("GET", `/api/emergency-profiles/${profileToken}`);
    if (getRes.status !== 200) throw new Error(`Get Status ${getRes.status}`);
    if (getRes.data.name !== "Jane Doe") throw new Error("Profile name mismatch");
  });

  // 13. Location Sharing Beacon Endpoints
  let shareToken = "";
  await check("POST & GET /api/location-shares", async () => {
    const createRes = await request("POST", "/api/location-shares", {
      latitude: 37.7749,
      longitude: -122.4194
    });
    if (createRes.status !== 201) throw new Error(`Create Status ${createRes.status}`);
    shareToken = createRes.data.token;

    const getRes = await request("GET", `/api/location-shares/${shareToken}`);
    if (getRes.status !== 200) throw new Error(`Get Status ${getRes.status}`);
    if (!getRes.data.latitude) throw new Error("Location data missing");
  });

  // Close IPC server
  await new Promise((resolve) => server.close(resolve));
  console.log("IPC test server closed cleanly.");

  console.log(`\n========================================`);
  const allPassed = checks.every((c) => c.passed);
  if (allPassed) {
    console.log(`🎉 ALL ${checks.length} INJURYAI API INTEGRATION CHECKS PASSED!`);
    process.exit(0);
  } else {
    console.error(`❌ Some checks failed!`);
    process.exit(1);
  }
}

runTests();
