CREATE TABLE "batch_process" (
  "batch_id" SERIAL PRIMARY KEY
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
  "file_id" INT NOT NULL
);

CREATE TABLE "batch_status" (
  "status_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "process_type" VARCHAR(50)
);

CREATE TABLE "detection_results" (
  "result_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "status" VARCHAR(50)
);

CREATE TABLE "ocr_results" (
  "ocr_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "ocr_path" TEXT
);

CREATE TABLE "classification_results" (
  "class_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "clasf_path" TEXT
);

CREATE TABLE "ner_results" (
  "ner_id" SERIAL PRIMARY KEY,
  "batch_id" INT NOT NULL,
  "ner_path" TEXT
);

ALTER TABLE "uploaded_files" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "conversion_status" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "conversion_status" ADD FOREIGN KEY ("file_id") REFERENCES "uploaded_files" ("file_id");

ALTER TABLE "batch_status" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "detection_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "ocr_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "classification_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");

ALTER TABLE "ner_results" ADD FOREIGN KEY ("batch_id") REFERENCES "batch_process" ("batch_id");
