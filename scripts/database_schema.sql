-- Od Cleaning Services Database Schema
-- This script creates all necessary tables for the cleaning service application

-- Users table for client authentication and information
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Quote requests from clients
CREATE TABLE IF NOT EXISTS quote_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    property_type ENUM('home', 'office') NOT NULL,
    rooms INT NOT NULL,
    bathrooms INT NOT NULL,
    square_footage INT,
    cleaning_type ENUM('standard', 'deep', 'post_construction') NOT NULL,
    desired_date DATE,
    special_instructions TEXT,
    status ENUM('pending', 'quoted', 'accepted', 'declined', 'completed') DEFAULT 'pending',
    admin_notes TEXT,
    proposed_price DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bookings created when quotes are accepted
CREATE TABLE IF NOT EXISTS bookings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    quote_request_id INT NOT NULL,
    scheduled_date DATETIME NOT NULL,
    status ENUM('confirmed', 'in_progress', 'completed', 'cancelled') DEFAULT 'confirmed',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (quote_request_id) REFERENCES quote_requests(id) ON DELETE CASCADE
);

-- Services for CMS management
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Testimonials for CMS management
CREATE TABLE IF NOT EXISTS testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_name VARCHAR(255) NOT NULL,
    quote TEXT NOT NULL,
    image_url VARCHAR(500),
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Site configuration for CMS
CREATE TABLE IF NOT EXISTS site_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    hero_title VARCHAR(500) NOT NULL,
    hero_subtitle TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Admin users table for dashboard access
CREATE TABLE IF NOT EXISTS admin_users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager') DEFAULT 'admin',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Notifications for admin alerts
CREATE TABLE IF NOT EXISTS notifications (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('booking_reminder', 'new_quote', 'quote_accepted') NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    related_id INT, -- Can reference booking_id or quote_request_id
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default site configuration
INSERT INTO site_config (hero_title, hero_subtitle) VALUES 
('Premium Cleaning Services for Your Home & Office', 'Experience the difference with Od Cleaning Services. Professional, reliable, and thorough cleaning solutions tailored to your needs.');

-- Insert default services
INSERT INTO services (name, description, display_order) VALUES 
('Standard Cleaning', 'Regular maintenance cleaning including dusting, vacuuming, mopping, and bathroom sanitization.', 1),
('Deep Cleaning', 'Comprehensive cleaning service covering every corner, perfect for seasonal cleaning or move-in preparation.', 2),
('Post-Construction Cleaning', 'Specialized cleaning for newly constructed or renovated spaces, removing dust, debris, and construction residue.', 3),
('Office Cleaning', 'Professional commercial cleaning services to maintain a clean and productive work environment.', 4);

-- Insert sample testimonials
INSERT INTO testimonials (client_name, quote, display_order) VALUES 
('Sarah Johnson', 'Od Cleaning Services transformed my home! Their attention to detail is incredible and the team is so professional.', 1),
('Michael Chen', 'Best cleaning service in the city. They consistently deliver exceptional results for our office space.', 2),
('Emily Rodriguez', 'I trust Od Cleaning with my home completely. They are reliable, thorough, and always exceed expectations.', 3);

-- Create default admin user (password should be hashed in real implementation)
INSERT INTO admin_users (email, name, password_hash, role) VALUES 
('admin@odcleaning.com', 'Admin User', '$2b$10$example_hash_here', 'admin');