const http = require('http');  
const https = require('https');  

const initSession = async (req, res, next) => {
  try {
    const sessionUrl = process.env.SESSION_URL; 
    const client = sessionUrl.startsWith('https') ? https : http;

    const options = {
      headers: {}
    };

    // 🔹 مقدار کوکی را از کلاینت بگیر
    if (req.headers.cookie) {
      options.headers['Cookie'] = req.headers.cookie;
    }

    const request = client.get(sessionUrl, options, (response) => {
      let data = '';

      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        req.sessionCookie = setCookieHeader[0]; // ذخیره در req به جای متغیر سراسری
      }

      response.on('data', chunk => {
        data += chunk;
      });

      response.on('end', () => {
        try {
          const sessionData = JSON.parse(data);
          console.log("Session created or found:", sessionData);
          req.sessionData = sessionData;
          next();
        } catch (error) {
          console.error("Error parsing session data:", error);
          res.status(500).json({ message: "Failed to parse session data" });
        }
      });
    });

    request.on('error', (err) => {
      console.error("Error while creating session:", err);
      res.status(500).json({ message: "Internal server error" });
    });

  } catch (err) {
    console.error("Error while creating session:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

module.exports = {
  initSession
};
