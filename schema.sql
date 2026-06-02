CREATE TABLE IF NOT EXISTS mentor_availability (
    id INT AUTO_INCREMENT PRIMARY KEY,
    mentor_id INT NOT NULL,
    day VARCHAR(20),
    start_time TIME,
    end_time TIME,
    FOREIGN KEY (mentor_id) REFERENCES users(id)
);
