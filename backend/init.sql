-- DeFi Risk Guardian Database Initialization
-- This file is executed when the PostgreSQL container starts

-- Create database if it doesn't exist
-- (This is handled by POSTGRES_DB environment variable)

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Create indexes for better performance
-- (These will be created by SQLAlchemy migrations, but we can add some here)

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE defi_risk TO defi_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO defi_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO defi_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO defi_user;

-- Set default privileges for future objects
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO defi_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO defi_user;
