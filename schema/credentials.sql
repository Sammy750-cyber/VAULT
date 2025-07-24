CREATE TABLE IF NOT EXISTS credentials (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    service_name VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

INSERT INTO credentials (user_id, service_name, username, password, notes)
VALUES
    (1, 'Example Service', 'example_user', 'example_password', 'This is an example credential.'),
    (1, 'Another Service', 'another_user', 'another_password', 'This is another example credential.'),
    (2, 'Test Service', 'test_user', 'test_password', 'This is a test credential.'),
    (2, 'Sample Service', 'sample_user', 'sample_password', 'This is a sample credential.'),
    (3, 'Demo Service', 'demo_user', 'demo_password', 'This is a demo credential.'),
    (3, 'Demo Service 2', 'demo_user2', 'demo_password2', 'This is another demo credential.');