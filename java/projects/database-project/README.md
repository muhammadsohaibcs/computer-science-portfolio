# File-Based Database System

## What's Implemented

A command-line database system in `Database.java` that uses text files for data storage and supports SQL-like operations.

### Command Parser

Main method implements interactive command-line interface that:
1. Reads user input
2. Removes multiple spaces
3. Parses SQL-like commands
4. Routes to appropriate handlers

### Supported Commands

#### 1. CREATE TABLE

```
CREATE TABLE tableName (column1, column2, ...)
```
- Creates new `.txt` file with table name
- Writes column headers separated by 4 spaces
- File location: `tableName.txt`
- Validates:
  - File name follows Java variable rules
  - No empty columns
  - No double commas

#### 2. DROP TABLE

```
DROP TABLE tableName
```
- Requires confirmation (user must enter "1")
- Deletes `.txt` file for table
- Shows warning before deletion

#### 3. SHOW TABLES

```
SHOW TABLES
```
- Lists all `.txt` files in project directory
- Shows only table names (without .txt extension)

#### 4. INSERT INTO

```
INSERT INTO tableName VALUES ("value1", "value2", ...)
```
- Adds new row to table file
- Validates column count matches table structure
- Formats values with quotes and 4-space separation
- Checks for data consistency

#### 5. SELECT FROM

```
SELECT FROM tableName
SELECT FROM tableName HAVING column = value [SORT BY column]
```
- Two variants:
  - **Basic SELECT:** Shows all rows with formatted output
  - **SELECT with HAVING:** Filters rows by condition with optional sorting
- Display format: 20-char columns with alignment
- Includes column headers with separator line

#### 6. UPDATE

```
UPDATE tableName SET column = "newValue" HAVING column = "searchValue"
```
- Finds all rows matching search condition
- Updates specified column in matching rows
- Creates temp file, rewrites original file
- Shows row count updated

#### 7. DELETE

```
DELETE FROM tableName HAVING column = "value"
```
- Removes rows matching condition
- Creates temp file without deleted rows
- Replaces original file
- Shows number of rows deleted

### Core Functions

1. **Input Processing**
   - `trim()` - Remove leading/trailing spaces
   - Multiple space removal
   - Special character handling for `=`, `,`, `"`

2. **File Operations**
   - `createTables()` - Create table file with headers
   - `drop()` - Delete table file
   - `show()` - List all tables
   - `write()` - Append row to file

3. **Query Operations**
   - `insert()` - Insert new row
   - `selectfrom()` - Select all rows
   - `selectfromcolumnsort()` - Select with filter and sort
   - `update()` - Update matching rows
   - `deleteLine()` - Delete matching rows

4. **Helper Functions**
   - `checkFileName()` - Validate Java identifier rules
   - `columnCheck()` - Find column index
   - `checkValues()` - Validate data format
   - `findAll()` - Filter rows by condition
   - `updatearray()` - Apply updates to results
   - `replaceFile()` - Swap temp and original files
   - `printList()` - Format output display

### Data Storage Format

**Table File Structure:**
```
column1    column2    column3    
"value1"    "value2"    "value3"    
"value1"    "value2"    "value3"
```

- Headers: column names separated by 4 spaces
- Data rows: values in quotes, 4-space separated
- Each row ends with newline

### Validation Rules

1. **File/Column Names**
   - Must follow Java variable naming rules
   - No digits at start
   - Alphanumeric, underscore, dollar sign only

2. **Data Values**
   - Must be enclosed in quotes
   - No consecutive commas
   - No trailing commas

3. **Column Count**
   - Insert values must match table column count
   - Update operations preserve row structure

### Features

1. **Interactive CLI**
   - Prompt: `>>`
   - Continuous loop for commands
   - Error messages for invalid syntax

2. **File-Based Persistence**
   - No external database
   - Plain text files for storage
   - Manual file management

3. **Basic SQL Operations**
   - CREATE, DROP, INSERT, SELECT, UPDATE, DELETE
   - HAVING clause for filtering
   - SORT BY for ordering results

4. **Data Formatting**
   - Aligned column display (20 chars)
   - Header separators with dashes
   - Clean output formatting

### Helper Commands

```
HELP - Display command syntax
EXIT - Exit the program
```

---

## ✅ What You Accomplished

- ✅ Implemented SQL-like command parser
- ✅ Created CREATE TABLE with file generation
- ✅ Implemented DROP TABLE with confirmation
- ✅ Added INSERT INTO with validation
- ✅ Created SELECT with filtering and sorting
- ✅ Implemented UPDATE with temp file strategy
- ✅ Created DELETE with row removal
- ✅ File-based data persistence without external DB
- ✅ Input validation for Java identifier rules
- ✅ Formatted table output display
- ✅ Error handling and user feedback

