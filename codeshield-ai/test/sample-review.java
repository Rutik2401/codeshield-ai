package com.example.test;

import java.sql.*;
import java.util.Scanner;

public class SampleReview {

    private static final String DB_URL = "jdbc:mysql://localhost:3306/mydb";
    private static final String DB_USER = "root";
    private static final String DB_PASS = "password123";

    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        System.out.print("Enter username: ");
        String username = scanner.nextLine();

        try {
            Connection conn = DriverManager.getConnection(DB_URL, DB_USER, DB_PASS);
            // SQL Injection vulnerability
            String query = "SELECT * FROM users WHERE username = '" + username + "'";
            Statement stmt = conn.createStatement();
            ResultSet rs = stmt.executeQuery(query);

            while (rs.next()) {
                System.out.println("User: " + rs.getString("username"));
                System.out.println("Email: " + rs.getString("email"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public String hashPassword(String password) {
        // Weak hashing - should use bcrypt
        return Integer.toHexString(password.hashCode());
    }

    public void processData(String input) {
        // No input validation
        Runtime runtime = Runtime.getRuntime();
        try {
            runtime.exec("cmd /c " + input);
        } catch (Exception e) {
            // Swallowing exception silently
        }
    }
}
