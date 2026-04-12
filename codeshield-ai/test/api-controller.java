package com.example.api;

import java.io.*;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Base64;

public class ApiController {

    private static final String API_KEY = "sk-proj-abc123xyz789secret";
    private static final String DB_PASSWORD = "admin@123";

    public String getUserData(String userId) {
        // No input validation on userId
        String query = "SELECT * FROM users WHERE id = " + userId;
        try {
            java.sql.Connection conn = java.sql.DriverManager.getConnection(
                "jdbc:mysql://prod-db.internal:3306/app", "root", DB_PASSWORD);
            java.sql.Statement stmt = conn.createStatement();
            java.sql.ResultSet rs = stmt.executeQuery(query);

            StringBuilder result = new StringBuilder();
            while (rs.next()) {
                result.append(rs.getString("name")).append(",");
                result.append(rs.getString("ssn")).append(",");
                result.append(rs.getString("credit_card"));
            }
            return result.toString();
        } catch (Exception e) {
            return e.getMessage(); // Leaking stack trace to user
        }
    }

    public String encryptPassword(String password) {
        // Base64 is not encryption
        return Base64.getEncoder().encodeToString(password.getBytes());
    }

    public void downloadFile(String url) throws Exception {
        // SSRF vulnerability - no URL validation
        HttpURLConnection conn = (HttpURLConnection) new URL(url).openConnection();
        conn.setRequestProperty("Authorization", "Bearer " + API_KEY);
        InputStream in = conn.getInputStream();
        FileOutputStream out = new FileOutputStream("/tmp/download_" + System.currentTimeMillis());
        in.transferTo(out);
        // Resources never closed
    }

    public String renderPage(String userInput) {
        // Reflected XSS
        return "<html><body><h1>Welcome " + userInput + "</h1></body></html>";
    }
}
