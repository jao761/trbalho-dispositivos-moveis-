CREATE USER business_db_user WITH PASSWORD 'business_pass';
CREATE USER commerce_db_user WITH PASSWORD 'commerce_pass';
CREATE DATABASE business_db OWNER business_db_user;
CREATE DATABASE commerce_db OWNER commerce_db_user;
GRANT ALL PRIVILEGES ON DATABASE business_db TO business_db_user;
GRANT ALL PRIVILEGES ON DATABASE commerce_db TO commerce_db_user;
