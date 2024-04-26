CREATE TABLE processing_batches (
    batch_id SERIAL PRIMARY KEY
);

CREATE TABLE uploaded_files (
    file_id SERIAL PRIMARY KEY,
    original_name VARCHAR(255),
    storage_name VARCHAR(255),
    file_path TEXT,
    batch_id INT NOT NULL,
    upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES processing_batches(batch_id)
);

CREATE TABLE conversion_status (
    status_id SERIAL PRIMARY KEY,
    batch_id INT NOT NULL,
    process_type VARCHAR(50),
    file_type VARCHAR(50),
    status VARCHAR(50),
    file_id INT NOT NULL,
    FOREIGN KEY (batch_id) REFERENCES processing_batches(batch_id)
    FOREIGN KEY (file_id) REFERENCES uploaded_files(file_id)
);

CREATE TABLE batch_status (
    status_id SERIAL PRIMARY KEY,
    batch_id INT NOT NULL,
    process_type VARCHAR(50),
    started TIMESTAMP,
    completed TIMESTAMP,
    FOREIGN KEY (batch_id) REFERENCES processing_batches(batch_id)
);


CREATE TABLE detection_results (
    result_id SERIAL PRIMARY KEY,
    batch_id INT NOT NULL,
    result_file_name TEXT,
    FOREIGN KEY (batch_id) REFERENCES processing_batches(batch_id)
);


CREATE TABLE ocr_results (
    ocr_id SERIAL PRIMARY KEY,
    batch_id INT NOT NULL,
    extracted_text JSON,
    FOREIGN KEY (batch_id) REFERENCES processing_batches(batch_id)
);


CREATE TABLE classification_results (
    class_id SERIAL PRIMARY KEY,
    batch_id INT NOT NULL,
    class_result JSON,
    FOREIGN KEY (batch_id) REFERENCES processing_batches(batch_id)
);

CREATE TABLE ner_results (
    ner_id SERIAL PRIMARY KEY,
    batch_id INT NOT NULL,
    keywords JSON,
    FOREIGN KEY (batch_id) REFERENCES processing_batches(batch_id)
);
