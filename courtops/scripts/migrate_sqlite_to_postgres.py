import sys
import subprocess
import json
import sqlite3
import os
from datetime import datetime
import psycopg2

# Force log to file to avoid console buffer issues
log_file = open("MIG_RESULT.log", "w", encoding="utf-8")
sys.stdout = log_file
sys.stderr = log_file

print(f"Migration started at {datetime.now()}")

# Force UTF-8 encoding for stdout/stderr
sys.stdout.reconfigure(encoding='utf-8')
sys.stderr.reconfigure(encoding='utf-8')

# --- CONFIGURATION ---
SQLITE_DB_PATH = os.path.join('prisma', 'dev.db')
DATABASE_URL = None

TABLES = [
    "Club", "User", "Court", "Client", "Product", "PriceRule", "WaitingList",
    "CashRegister", "Booking", "BookingPlayer", "BookingItem", "Transaction",
    "TransactionItem", "AuditLog"
]

def load_env_manual():
    print("Reading .env manually...")
    env_path = os.path.join(os.getcwd(), '.env')
    if not os.path.exists(env_path):
        print(".env file not found")
        return None

    content = ""
    # Try encodings
    for enc in ['utf-8-sig', 'utf-8', 'utf-16', 'utf-16-le', 'latin1']:
        try:
            with open(env_path, 'r', encoding=enc) as f:
                content = f.read()
            if "DATABASE_URL" in content:
                break
        except:
            continue
            
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith('#'): continue
        if '=' in line:
            key, val = line.split('=', 1)
            key = key.strip()
            if key.endswith('DATABASE_URL'):
                val = val.strip().strip('"').strip("'")
                if "sslmode" not in val:
                    val += "&sslmode=require" if "?" in val else "?sslmode=require"
                masked = val.replace(val.split(':')[2].split('@')[0], '******') if '@' in val else "Found"
                print(f"DATABASE_URL loaded manually: {masked}")
                return val
    print("DATABASE_URL not found in .env content")
    return None

def get_sqlite_connection():
    try:
        conn = sqlite3.connect(SQLITE_DB_PATH)
        conn.row_factory = sqlite3.Row
        return conn
    except Exception as e:
        print(f"Error connecting to SQLite: {e}")
        sys.exit(1)

def convert_value(value, column_name):
    if value is None: return None
    
    col_lower = column_name.lower()
    
    # Handle Booleans (SQLite stores as 0/1, Postgres needs True/False)
    if col_lower.startswith('is') or col_lower.startswith('has'):
        if value == 1: return True
        if value == 0: return False
        
    # Handle Timestamps
    # Common date column names
    if any(x in col_lower for x in ['date', 'time', 'at']) and not col_lower.endswith('duration'):
        if isinstance(value, (int, float)):
             # Unix timestamp to datetime
             try:
                 # Check if milliseconds (huge number)
                 if value > 100000000000:
                     return datetime.fromtimestamp(value / 1000.0)
                 return datetime.fromtimestamp(value)
             except:
                 pass
        elif isinstance(value, str):
            # Try to handle strings if needed, though psycopg2 handles ISO strings well usually.
            # But if SQLite has "2024-01-01 10:00:00" (no T), Postgres might want T or generic handling.
            pass

    return value

def migrate():
    global DATABASE_URL
    print("Starting Migration from SQLite to PostgreSQL...")
    
    if not os.path.exists(SQLITE_DB_PATH):
        print(f"SQLite database not found at {SQLITE_DB_PATH}")
        sys.exit(1)

    print("Forcing reload of DATABASE_URL from .env...")
    DATABASE_URL = load_env_manual()
    
    if not DATABASE_URL:
        print("DATABASE_URL environment variable is missing.")
        sys.exit(1)

    # --- RUN PRISMA DB PUSH ---
    print("\nSyncing Schema (npx prisma db push)...")
    try:
        env_copy = os.environ.copy()
        env_copy["DATABASE_URL"] = DATABASE_URL
        result = subprocess.run(
            ["npx", "prisma", "db", "push", "--accept-data-loss"], 
            cwd=os.getcwd(), env=env_copy, shell=True, capture_output=True, text=True, encoding='utf-8' # force encoding capture
        )
        if result.returncode != 0:
            print(f"[ERROR] Prisma Sync FAILED. Stdout: {result.stdout}")
            print(f"[ERROR] Stderr: {result.stderr}")
            sys.exit(1)
        print("Schema synced successfully.")
    except Exception as e:
        print(f"Schema sync exception: {e}")
        sys.exit(1)

    # --- CONNECT POSTGRES ---
    print("Connecting to PostgreSQL...")
    try:
        pg_conn = psycopg2.connect(DATABASE_URL)
        print("PostgreSQL Connection Successful.")
    except Exception as e:
        print(f"Connection Failed: {e}")
        try:
             with open("ERROR.TXT", "w", encoding="utf-8") as f: f.write(str(e))
        except: pass
        sys.exit(1)
    
    pg_cursor = pg_conn.cursor()
    sqlite_conn = get_sqlite_connection()

    try:
        print("Cleaning target database (TRUNCATE)...")
        for table in reversed(TABLES):
            try:
                pg_cursor.execute(f'TRUNCATE TABLE "{table}" CASCADE;')
            except psycopg2.errors.UndefinedTable:
                print(f"Table {table} does not exist, skipping.")
                pg_conn.rollback() 
            except Exception as e:
                print(f"Could not truncate {table}: {e}")
                pg_conn.rollback()
        pg_conn.commit()

        for table in TABLES:
            print(f"\nMigrating table: {table}")
            try:
                cur = sqlite_conn.cursor()
                cur.execute(f'SELECT * FROM "{table}"')
                rows = cur.fetchall()
            except sqlite3.OperationalError:
                continue
            if not rows: continue

            # Introspect target columns to avoid "column does not exist" errors
            try:
                pg_cursor.execute(f'SELECT * FROM "{table}" LIMIT 0')
                pg_target_cols = set([desc[0] for desc in pg_cursor.description])
            except Exception as e:
                print(f"Start check failed for {table}: {e}")
                pg_conn.rollback()
                continue

            # Filter source columns
            src_columns = [description[0] for description in cur.description]
            valid_columns = []
            valid_indices = []
            
            for idx, col in enumerate(src_columns):
                # Prisma case sensitivity usually matches, but be careful
                if col in pg_target_cols:
                    valid_columns.append(col)
                    valid_indices.append(idx)
                else:
                    print(f"   ⚠️ Skipping column '{col}' (not in target)")

            if not valid_columns:
                print(f"   ⛔ No matching columns for {table}!")
                continue

            column_list = ', '.join([f'"{c}"' for c in valid_columns])
            placeholders = ', '.join(['%s'] * len(valid_columns))
            
            # Filter data row by row
            data = []
            for row in rows:
                converted_row = []
                for idx in valid_indices:
                    val = row[idx] # raw value
                    col_name = src_columns[idx]
                    converted_row.append(convert_value(val, col_name))
                data.append(converted_row)

            insert_query = f'INSERT INTO "{table}" ({column_list}) VALUES ({placeholders})'
            try:
                pg_cursor.executemany(insert_query, data)
                pg_conn.commit()
                print(f"   Migrated {len(data)} rows.")
            except Exception as e:
                pg_conn.rollback()
                print(f"   Failed to insert {table}: {e}")
                sys.exit(1)

        print("\nResetting sequences...")
        for table in TABLES:
            try:
                pg_cursor.execute(f"SELECT setval(pg_get_serial_sequence('\"{table}\"', 'id'), COALESCE(MAX(id), 1)) FROM \"{table}\";")
                pg_conn.commit()
            except Exception:
                pg_conn.rollback()

        print("\nMigration Complete!")

    except Exception as e:
        print(f"\nCritical Error: {e}")
    finally:
        sqlite_conn.close()
        pg_conn.close()

if __name__ == "__main__":
    migrate()
