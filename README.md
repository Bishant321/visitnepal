# vistnepal App
# Secure IoT Monitor System

## Project Overview
A sophisticated Java application demonstrating OOP principles, network security, and MySQL database integration for IoT sensor monitoring.

## Features
- 🔐 AES-256 & RSA encryption
- 👥 User authentication with PBKDF2 hashing
- 📊 MySQL database with stored procedures
- 🌐 Client-server socket communication
- 📈 Real-time sensor monitoring
- 🚨 Alert system with thresholds

## Setup Instructions
1. Install MySQL 8.0+
2. Run `sql/schema.sql`
3. Run `sql/seed_data.sql`
4. Update `config/database.properties`
5. Compile: `javac -cp "lib/*" src/**/*.java`
6. Run: `java -cp "src;lib/*" com.iotmonitor.Main`

## Test Credentials
- Username: `admin`
- Password: `Admin@123`
- Role: Administrator
