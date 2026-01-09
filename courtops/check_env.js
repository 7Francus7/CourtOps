console.log("Checking DATABASE_URL...");
if (process.env.DATABASE_URL) {
       console.log("DATABASE_URL is defined (length: " + process.env.DATABASE_URL.length + ")");
       console.log("Starts with: " + process.env.DATABASE_URL.substring(0, 10));
} else {
       console.log("DATABASE_URL is NOT defined.");
}
