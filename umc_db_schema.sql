-- DB 생성
CREATE DATABASE IF NOT EXISTS umc_db;
USE umc_db;

-- 1. region
CREATE TABLE IF NOT EXISTS region (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    region_name VARCHAR(50) NOT NULL
);

-- 2. food
CREATE TABLE IF NOT EXISTS food (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_name VARCHAR(15) NOT NULL
);

-- 3. member
CREATE TABLE IF NOT EXISTS member (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(10),
    gender VARCHAR(10),
    birth DATE,
    address VARCHAR(255),
    nickname VARCHAR(20),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    status VARCHAR(15),
    inactive_date DATETIME(6),
    total_point BIGINT
);

-- 4. store
CREATE TABLE IF NOT EXISTS store (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    region_id BIGINT,
    food_id BIGINT,
    store_name VARCHAR(15),
    store_address TEXT,
    score FLOAT(5),
    business_status VARCHAR(15),
    image_url TEXT,
    FOREIGN KEY (region_id) REFERENCES region(id),
    FOREIGN KEY (food_id) REFERENCES food(id)
);

-- 5. mission
CREATE TABLE IF NOT EXISTS mission (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT,
    mission_name VARCHAR(30),
    created_at DATETIME(6),
    finished_at DATETIME(6),
    point INT,
    minimum_amount INT,
    FOREIGN KEY (store_id) REFERENCES store(id)
);

-- 6. member_mission (N:M)
CREATE TABLE IF NOT EXISTS member_mission (
    member_id BIGINT,
    mission_id BIGINT,
    created_at DATETIME(6),
    completed_at DATETIME(6),
    status VARCHAR(15),
    PRIMARY KEY (member_id, mission_id),
    FOREIGN KEY (member_id) REFERENCES member(id),
    FOREIGN KEY (mission_id) REFERENCES mission(id)
);

-- 7. member_favorite_food (N:M)
CREATE TABLE IF NOT EXISTS member_favorite_food (
    member_id BIGINT,
    food_id BIGINT,
    PRIMARY KEY (member_id, food_id),
    FOREIGN KEY (member_id) REFERENCES member(id),
    FOREIGN KEY (food_id) REFERENCES food(id)
);

-- 8. inquiry
CREATE TABLE IF NOT EXISTS inquiry (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    member_id BIGINT,
    title VARCHAR(100),
    contents TEXT,
    status VARCHAR(15),
    created_at DATETIME(6),
    updated_at DATETIME(6),
    FOREIGN KEY (member_id) REFERENCES member(id)
);

-- 9. inquiry_image
CREATE TABLE IF NOT EXISTS inquiry_image (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    inquiry_id BIGINT,
    inquiry_image_name VARCHAR(255),
    inquiry_image_url TEXT,
    FOREIGN KEY (inquiry_id) REFERENCES inquiry(id)
);

-- 10. store_review
CREATE TABLE IF NOT EXISTS store_review (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_id BIGINT,
    member_id BIGINT,
    nickname VARCHAR(10),
    score FLOAT(5),
    contents TEXT,
    created_at DATETIME(6),
    updated_at DATETIME(6),
    FOREIGN KEY (store_id) REFERENCES store(id),
    FOREIGN KEY (member_id) REFERENCES member(id)
);

-- 11. store_review_image
CREATE TABLE IF NOT EXISTS store_review_image (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    store_review_id BIGINT,
    store_review_image_name VARCHAR(255), -- 길이 확장
    store_review_image_url TEXT,
    FOREIGN KEY (store_review_id) REFERENCES store_review(id)
);
