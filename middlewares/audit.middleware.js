const pool = require("../config/db");

// ==========================================
// USER EXTRACTION
// ==========================================
const getUserName = (req) => {
    // Priority: req.user.name > first_name + last_name > email > "System"
    if (req.user && req.user.name) {
        return req.user.name.trim();
    }
    
    if (req.user && (req.user.first_name || req.user.last_name)) {
        const name = `${req.user.first_name || ""} ${req.user.last_name || ""}`.trim();
        if (name) return name;
    }
    
    if (req.user && req.user.email) {
        return req.user.email;
    }
    
    return "System";
};

// ==========================================
// MODULE DETECTION
// ==========================================
const getModule = (url) => {
    const path = url.split("?")[0].toLowerCase();
    
    // Check in order of specificity
    if (path.includes("/auth")) return "Authentication";
    if (path.includes("/employees")) return "Employee";
    if (path.includes("/department")) return "Department";
    if (path.includes("/attendance")) return "Attendance";
    if (path.includes("/leave")) return "Leave";
    if (path.includes("/shift")) return "Shift";
    if (path.includes("/payroll")) return "Payroll";
    if (path.includes("/performance")) return "Performance";
    if (path.includes("/compliance")) return "Compliance";
    if (path.includes("/document")) return "Documents";
    if (path.includes("/asset")) return "Asset";
    if (path.includes("/holiday")) return "Holiday";
    if (path.includes("/candidate")) return "Candidate";
    if (path.includes("/interview")) return "Interview";
    if (path.includes("/job")) return "Job";
    if (path.includes("/loan")) return "Loan";
    if (path.includes("/lifecycle")) return "Lifecycle";
    
    return "System";
};

// ==========================================
// ACTION DETECTION
// ==========================================
const getAction = (method, url) => {
    const path = url.split("?")[0].toLowerCase();
    
    // ===== AUTH ACTIONS =====
    if (path.includes("/auth/login")) return "User Logged In";
    if (path.includes("/auth/logout")) return "User Logged Out";
    if (path.includes("/register")) return "User Registered";
    if (path.includes("/auth") && method === "POST") return "User Authenticated";
    
    // ===== EMPLOYEE ACTIONS =====
    if (path.includes("/employees") && method === "POST") return "Created Employee";
    if (path.includes("/employees") && (method === "PUT" || method === "PATCH")) return "Updated Employee";
    if (path.includes("/employees") && method === "DELETE") return "Deleted Employee";
    
    // ===== DEPARTMENT ACTIONS =====
    if (path.includes("/department") && method === "POST") return "Created Department";
    if (path.includes("/department") && (method === "PUT" || method === "PATCH")) return "Updated Department";
    if (path.includes("/department") && method === "DELETE") return "Deleted Department";
    
    // ===== ATTENDANCE ACTIONS =====
    if (path.includes("/attendance/checkin") || path.includes("/check-in")) return "Check-in Marked";
    if (path.includes("/attendance/checkout") || path.includes("/check-out")) return "Check-out Marked";
    if (path.includes("/attendance") && method === "POST") return "Created Attendance Record";
    if (path.includes("/attendance") && (method === "PUT" || method === "PATCH")) return "Updated Attendance Record";
    if (path.includes("/attendance") && method === "DELETE") return "Deleted Attendance Record";
    
    // ===== LEAVE ACTIONS =====
    if (path.includes("/leave") && path.includes("apply")) return "Applied for Leave";
    if (path.includes("/leave") && path.includes("approve")) return "Approved Leave Request";
    if (path.includes("/leave") && path.includes("reject")) return "Rejected Leave Request";
    if (path.includes("/leave") && method === "POST") return "Created Leave Request";
    if (path.includes("/leave") && (method === "PUT" || method === "PATCH")) return "Updated Leave Request";
    if (path.includes("/leave") && method === "DELETE") return "Deleted Leave Request";
    
    // ===== SHIFT ACTIONS =====
    if (path.includes("/shift") && path.includes("assign")) return "Assigned Shift to Employee";
    if (path.includes("/shift") && method === "POST") return "Created Shift";
    if (path.includes("/shift") && (method === "PUT" || method === "PATCH")) return "Updated Shift";
    if (path.includes("/shift") && method === "DELETE") return "Deleted Shift";
    
    // ===== PAYROLL ACTIONS =====
    if (path.includes("/payroll") && path.includes("process")) return "Processed Payroll";
    if (path.includes("/payroll") && method === "POST") return "Created Payroll Entry";
    if (path.includes("/payroll") && (method === "PUT" || method === "PATCH")) return "Updated Payroll Entry";
    if (path.includes("/payroll") && method === "DELETE") return "Deleted Payroll Entry";
    
    // ===== PERFORMANCE ACTIONS =====
    if (path.includes("/performance") && method === "POST") return "Added Performance Rating";
    if (path.includes("/performance") && (method === "PUT" || method === "PATCH")) return "Updated Performance Rating";
    if (path.includes("/performance") && method === "DELETE") return "Deleted Performance Rating";
    
    // ===== COMPLIANCE ACTIONS =====
    if (path.includes("/compliance") && method === "POST") return "Created Compliance Record";
    if (path.includes("/compliance") && (method === "PUT" || method === "PATCH")) return "Updated Compliance Record";
    if (path.includes("/compliance") && method === "DELETE") return "Deleted Compliance Record";
    
    // ===== DOCUMENTS ACTIONS =====
    if (path.includes("/document") && method === "POST") return "Uploaded Document";
    if (path.includes("/document") && (method === "PUT" || method === "PATCH")) return "Updated Document";
    if (path.includes("/document") && method === "DELETE") return "Deleted Document";
    
    // ===== ASSET ACTIONS =====
    if (path.includes("/asset") && path.includes("assign")) return "Assigned Asset to Employee";
    if (path.includes("/asset") && path.includes("return")) return "Returned Asset";
    if (path.includes("/asset") && path.includes("maintenance")) return "Scheduled Asset Maintenance";
    if (path.includes("/asset") && method === "POST") return "Created Asset";
    if (path.includes("/asset") && (method === "PUT" || method === "PATCH")) return "Updated Asset";
    if (path.includes("/asset") && method === "DELETE") return "Deleted Asset";
    
    // ===== CANDIDATE ACTIONS =====
    if (path.includes("/candidate") && method === "POST") return "Added Candidate";
    if (path.includes("/candidate") && (method === "PUT" || method === "PATCH")) return "Updated Candidate";
    if (path.includes("/candidate") && method === "DELETE") return "Deleted Candidate";
    
    // ===== INTERVIEW ACTIONS =====
    if (path.includes("/interview") && method === "POST") return "Scheduled Interview";
    if (path.includes("/interview") && (method === "PUT" || method === "PATCH")) return "Updated Interview";
    if (path.includes("/interview") && method === "DELETE") return "Cancelled Interview";
    
    // ===== JOB ACTIONS =====
    if (path.includes("/job") && method === "POST") return "Posted Job";
    if (path.includes("/job") && (method === "PUT" || method === "PATCH")) return "Updated Job Posting";
    if (path.includes("/job") && method === "DELETE") return "Closed Job Posting";
    
    // ===== LOAN ACTIONS =====
    if (path.includes("/loan") && method === "POST") return "Created Loan";
    if (path.includes("/loan") && (method === "PUT" || method === "PATCH")) return "Updated Loan";
    if (path.includes("/loan") && method === "DELETE") return "Deleted Loan";
    
    // ===== LIFECYCLE ACTIONS =====
    if (path.includes("/lifecycle") && method === "POST") return "Created Lifecycle Event";
    if (path.includes("/lifecycle") && (method === "PUT" || method === "PATCH")) return "Updated Lifecycle Event";
    if (path.includes("/lifecycle") && method === "DELETE") return "Deleted Lifecycle Event";
    
    // ===== HOLIDAY ACTIONS =====
    if (path.includes("/holiday") && method === "POST") return "Added Holiday";
    if (path.includes("/holiday") && (method === "PUT" || method === "PATCH")) return "Updated Holiday";
    if (path.includes("/holiday") && method === "DELETE") return "Deleted Holiday";
    
    // ===== DEFAULT FALLBACK =====
    const methodMap = {
        "POST": "Created",
        "PUT": "Updated",
        "DELETE": "Deleted",
        "PATCH": "Updated",
        "GET": "Viewed",
    };
    
    return methodMap[method] || "Modified";
};

// ==========================================
// MANUAL LOG ACTION
// ==========================================
const logAction = async (userName, action, module, details, tenantId = "default") => {
    try {
        const timestamp = new Date().toISOString();
        
        await pool.query(
            `INSERT INTO audit_logs (user_name, action, module, details, created_at, tenant_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userName || "System", action, module, details, timestamp, tenantId]
        );
    } catch (error) {
        console.error("❌ Audit log error:", error);
    }
};

// ==========================================
// AUTO AUDIT MIDDLEWARE
// ==========================================
const autoAudit = (req, res, next) => {
    res.on("finish", async () => {
        try {
            // Only audit state-changing operations
            if (["POST", "PUT", "DELETE", "PATCH"].includes(req.method)) {
                // Only log successful or business-logic error responses (not 4xx/5xx system errors)
                if (res.statusCode >= 200 && res.statusCode < 400) {
                    const userName = getUserName(req);
                    const module = getModule(req.originalUrl);
                    const action = getAction(req.method, req.originalUrl);
                    const timestamp = new Date().toISOString();
                    const tenantId = String(req.user?.tenant_id || "default");
                    
                    try {
                        await pool.query(
                            `INSERT INTO audit_logs (user_name, action, module, details, created_at, tenant_id)
                             VALUES ($1, $2, $3, $4, $5, $6)`,
                            [
                                userName,
                                action,
                                module,
                                `${req.method} ${req.originalUrl} - Status: ${res.statusCode}`,
                                timestamp,
                                tenantId
                            ]
                        );
                    } catch (dbError) {
                        console.error("❌ Audit DB insertion failed:", dbError);
                    }
                }
            }
        } catch (error) {
            console.error("❌ Auto audit middleware error:", error);
        }
    });

    next();
};

module.exports = { autoAudit, logAction, getUserName, getModule, getAction };
