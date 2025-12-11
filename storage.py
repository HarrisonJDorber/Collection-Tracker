import sqlite3
import os

db_name = 'database.db'

def initialise_database():
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Collections (
            collection_id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            description TEXT,
            category TEXT
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS Items (
            item_id INTEGER PRIMARY KEY AUTOINCREMENT,
            collection_id INTEGER,
            name TEXT NOT NULL,
            set_name TEXT,
            status TEXT NOT NULL DEFAULT 'Owned' CHECK (status IN ('Owned', 'Wishlist', 'Ordered')),
            quantity INTEGER DEFAULT 1,
            date_acquired TEXT,
            value REAL DEFAULT 0.0,
            FOREIGN KEY (collection_id) REFERENCES Collections(collection_id) ON DELETE CASCADE
        )
    ''')
    conn.commit()
    conn.close()

def add_collection(name, description, category):
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Collections (name, description, category)
        VALUES (?, ?, ?)
    ''', (name, description, category))
    conn.commit()
    collection_id = cursor.lastrowid
    conn.close()
    return collection_id

def edit_collection(collection_id, name, description, category):
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE Collections
        SET name = ?, description = ?, category = ?
        WHERE collection_id = ?
    ''', (name, description, category, collection_id))
    conn.commit()
    conn.close()

def delete_collection(collection_id):
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM Collections
        WHERE collection_id = ?
    ''', (collection_id,))
    conn.commit()
    conn.close()

def read_collections():
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM Collections')
    collection = cursor.fetchall()
    conn.close()
    return collection

def add_item(collection_id, name, set_name, status='Owned', quantity=1, date_acquired=None, value=0.0):
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO Items (collection_id, name, set_name, status, quantity, date_acquired, value)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (collection_id, name, set_name, status, quantity, date_acquired, value))
    conn.commit()
    conn.close()

def edit_item(item_id, collection_id, name, set_name, status, quantity, date_acquired, value):
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE Items
        SET collection_id = ?, name = ?, set_name = ?, status = ?, quantity = ?, date_acquired = ?, value = ?
        WHERE item_id = ?
    ''', (collection_id, name, set_name, status, quantity, date_acquired, value, item_id))
    conn.commit()
    conn.close()

def delete_item(item_id):
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
        DELETE FROM Items
        WHERE item_id = ?
    ''', (item_id,))
    conn.commit()
    conn.close()

def read_items(collection_id):
    conn = sqlite3.connect(db_name)
    conn.execute("PRAGMA foreign_keys = ON")
    cursor = conn.cursor()
    cursor.execute('''
    SELECT item_id, name, set_name, status, quantity, date_acquired, value
    FROM Items
    WHERE collection_id = ?
    ORDER BY item_id
    ''', (collection_id,))
    items = cursor.fetchall()
    conn.close()
    return items

def clear_all_data():
    conn = sqlite3.connect(db_name)
    try:
        conn.execute("PRAGMA foreign_keys = ON")
        cursor = conn.cursor()
        cursor.execute('DELETE FROM Items')
        cursor.execute('DELETE FROM Collections')
        conn.commit()
    finally:
        conn.close()