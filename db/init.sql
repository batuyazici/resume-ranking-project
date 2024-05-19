CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE "batch_process" (
  "batch_id" SERIAL PRIMARY KEY,
  "results_path" text,
  "crops_path" text,
  "start_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "uploaded_files" (
  "file_id" SERIAL PRIMARY KEY,
  "original_name" VARCHAR(255),
  "storage_name" VARCHAR(255),
  "file_path" TEXT,
  "batch_id" INT NOT NULL,
  "file_type" VARCHAR(50),
  "upload_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "conversion_status" (
  "conv_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "process_type" VARCHAR(50),
  "status" VARCHAR(50),
  "number_of_pages" INT,
  "save_path" VARCHAR(255),
  "file_id" INT NOT NULL,
  "conv_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "batch_status" (
  "status_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "detect_id" INT NOT NULL,
  "ocr_id" INT NOT NULL,
  "class_id" INT NOT NULL,
  "ner_id" INT NOT NULL
);

CREATE TABLE "detection_results" (
  "detect_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "status" VARCHAR(50),
  "start_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "ocr_results" (
  "ocr_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "status" VARCHAR(50),
  "start_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "classification_results" (
  "class_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "status" VARCHAR(50),
  "start_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "ner_results" (
  "ner_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "status" VARCHAR(50),
  "start_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "job_process" (
  "job_id" SERIAL PRIMARY KEY,
  "job_path" TEXT,
  "create_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP),
  "status" VARCHAR(50)
);

CREATE TABLE "match_process" (
  "match_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "job_id" INT NOT NULL,
  "match_name" VARCHAR(255),
  "match_path" TEXT,
  "match_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "resume_embeddings" (
  "embedding_id" SERIAL PRIMARY KEY,
  "file_id" INT NOT NULL,
  "sentence_index" INT,
  "category" VARCHAR(50),
  "embedding" vector,
  "create_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

CREATE TABLE "job_embeddings" (
  "embedding_id" SERIAL PRIMARY KEY,
  "job_id" INT NOT NULL,
  "sentence_index" INT,
  "embedding" vector,
  "create_date" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP)
);

ALTER TABLE "uploaded_files" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "conversion_status" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "conversion_status" ADD FOREIGN KEY ("file_id") REFERENCES "uploaded_files" ("file_id");

ALTER TABLE "batch_status" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "batch_status" ADD FOREIGN KEY ("detect_id") REFERENCES "detection_results" ("detect_id");

ALTER TABLE "detection_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "ocr_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "classification_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "ner_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "match_process" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "match_process" ADD FOREIGN KEY ("job_id") REFERENCES "job_process" ("job_id");

ALTER TABLE "resume_embeddings" ADD FOREIGN KEY ("file_id") REFERENCES "uploaded_files" ("file_id");

ALTER TABLE "job_embeddings" ADD FOREIGN KEY ("job_id") REFERENCES "job_process" ("job_id");

CREATE INDEX idx_detection_results_batch_id ON detection_results(batch_id);
CREATE INDEX idx_ocr_results_batch_id ON ocr_results(batch_id);
CREATE INDEX idx_classification_results_batch_id ON classification_results(batch_id);
CREATE INDEX idx_ner_results_batch_id ON ner_results(batch_id);

CREATE INDEX idx_batch_process_batch_id ON batch_process(batch_id);
CREATE INDEX idx_uploaded_files_batch_id ON uploaded_files(batch_id);
CREATE INDEX idx_conversion_status_file_id ON conversion_status(file_id);
CREATE INDEX idx_conversion_status_batch_id ON conversion_status(batch_id);
