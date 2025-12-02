#!/bin/bash

# Database Migration Script
# Restaurant Management System

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-3306}"
DB_USER="${DB_USER:-root}"
DB_NAME="restaurant_management"
SQL_FILE="./backend/database_setup.sql"

# Functions
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ $1${NC}"
}

# Check if MySQL client is installed
check_mysql() {
    if ! command -v mysql &> /dev/null; then
        print_error "MySQL client not found. Please install MySQL."
        exit 1
    fi
    print_success "MySQL client found"
}

# Check if SQL file exists
check_sql_file() {
    if [ ! -f "$SQL_FILE" ]; then
        print_error "SQL file not found: $SQL_FILE"
        exit 1
    fi
    print_success "SQL file found: $SQL_FILE"
}

# Prompt for password
get_password() {
    echo -e "${YELLOW}Enter MySQL password for user '$DB_USER':${NC}"
    read -s DB_PASSWORD
    export MYSQL_PWD="$DB_PASSWORD"
}

# Test database connection
test_connection() {
    print_info "Testing database connection..."
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "SELECT 1;" &> /dev/null; then
        print_success "Database connection successful"
        return 0
    else
        print_error "Database connection failed"
        return 1
    fi
}

# Backup existing database
backup_database() {
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "USE $DB_NAME;" 2>/dev/null; then
        print_warning "Database '$DB_NAME' exists. Creating backup..."
        BACKUP_FILE="./backup_${DB_NAME}_$(date +%Y%m%d_%H%M%S).sql"
        
        if mysqldump -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" "$DB_NAME" > "$BACKUP_FILE" 2>/dev/null; then
            print_success "Backup created: $BACKUP_FILE"
        else
            print_warning "Backup failed, but continuing with migration..."
        fi
    else
        print_info "No existing database found. Proceeding with fresh installation."
    fi
}

# Run migration
run_migration() {
    print_info "Running database migration..."
    
    if mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" < "$SQL_FILE" 2>&1 | tee /tmp/migration.log; then
        if grep -qi "error" /tmp/migration.log; then
            print_error "Migration completed with errors. Check /tmp/migration.log"
            return 1
        else
            print_success "Migration completed successfully"
            return 0
        fi
    else
        print_error "Migration failed"
        return 1
    fi
}

# Verify migration
verify_migration() {
    print_info "Verifying database structure..."
    
    # Check if database exists
    if ! mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -e "USE $DB_NAME;" 2>/dev/null; then
        print_error "Database verification failed: Database does not exist"
        return 1
    fi
    
    # Get table count
    TABLE_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -D "$DB_NAME" -sN -e "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = '$DB_NAME';")
    
    if [ "$TABLE_COUNT" -gt 0 ]; then
        print_success "Database verification successful: $TABLE_COUNT tables created"
        
        # List tables
        print_info "Tables in database:"
        mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -D "$DB_NAME" -e "SHOW TABLES;" | tail -n +2 | while read table; do
            echo "  - $table"
        done
        return 0
    else
        print_error "Database verification failed: No tables found"
        return 1
    fi
}

# Check for admin user
verify_admin() {
    print_info "Checking for admin user..."
    
    ADMIN_COUNT=$(mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -D "$DB_NAME" -sN -e "SELECT COUNT(*) FROM users WHERE role = 'admin';")
    
    if [ "$ADMIN_COUNT" -gt 0 ]; then
        print_success "Admin user(s) found: $ADMIN_COUNT"
    else
        print_warning "No admin users found. You may need to create one manually."
    fi
}

# Main execution
main() {
    print_header "Database Migration Tool"
    
    # Step 1: Check prerequisites
    print_header "Step 1: Checking Prerequisites"
    check_mysql
    check_sql_file
    
    # Step 2: Get credentials
    print_header "Step 2: Database Authentication"
    get_password
    
    # Step 3: Test connection
    print_header "Step 3: Testing Connection"
    if ! test_connection; then
        print_error "Cannot proceed without database connection"
        exit 1
    fi
    
    # Step 4: Backup (if exists)
    print_header "Step 4: Backup Existing Database"
    backup_database
    
    # Step 5: Confirm migration
    print_header "Step 5: Confirm Migration"
    echo -e "${YELLOW}This will drop and recreate the database '$DB_NAME'.${NC}"
    echo -e "${YELLOW}Do you want to continue? (yes/no):${NC}"
    read -r CONFIRM
    
    if [ "$CONFIRM" != "yes" ] && [ "$CONFIRM" != "y" ]; then
        print_warning "Migration cancelled by user"
        exit 0
    fi
    
    # Step 6: Run migration
    print_header "Step 6: Running Migration"
    if ! run_migration; then
        print_error "Migration failed. Check error messages above."
        exit 1
    fi
    
    # Step 7: Verify
    print_header "Step 7: Verification"
    if ! verify_migration; then
        print_error "Verification failed"
        exit 1
    fi
    
    verify_admin
    
    # Success
    print_header "Migration Complete"
    print_success "Database '$DB_NAME' has been successfully migrated!"
    print_info "You can now start the backend server with: cd backend && npm run dev"
    
    # Cleanup
    unset MYSQL_PWD
    rm -f /tmp/migration.log
}

# Run main function
main
