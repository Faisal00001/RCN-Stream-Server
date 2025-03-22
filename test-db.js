const db = require("./db");

// Run a test query
db.query("SELECT 1 + 1 AS result", (err, results) => {
    if (err) {
        console.error("❌ Database query failed:", err);
    } else {
        console.log("✅ Database connection is working. Test result:", results[0].result);
    }
    db.end(); // Close connection after test
});
