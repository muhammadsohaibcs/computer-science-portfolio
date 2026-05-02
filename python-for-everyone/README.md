# 🐍 Python for Everyone — Applied Data & APIs Mastery

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.8+-blue?style=for-the-badge&logo=python)](.)
[![REST%20APIs](https://img.shields.io/badge/REST%20APIs-JSON%20%2F%20XML-green?style=for-the-badge)](.)
[![Databases](https://img.shields.io/badge/Databases-SQLite-orange?style=for-the-badge)](.)
[![Geospatial](https://img.shields.io/badge/Geospatial-Mapping-red?style=for-the-badge)](.)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](.)

**Real-world Python for web data access, API integration, databases, and geospatial analysis**

</div>

---

## 📂 Directory Structure

```
python-for-everyone/
├── python1.py                 # Python fundamentals
├── roaster.py                 # Data processing
├── tracks.py                  # Music database
├── urllib_test.py             # Web scraping
├── urllib_test2.py            # Advanced scraping
│
├── data/                      # Sample datasets
│   ├── countries.xml
│   ├── music.json
│   └── ...
│
├── geolocation/               # Geospatial analysis
│   ├── mapping.py
│   ├── location_services.py
│   └── GIS operations
│
├── web-data/                  # Web data processing
│   ├── api_requests.py
│   ├── json_parsing.py
│   ├── xml_handling.py
│   └── data_extraction.py
│
└── README.md
```

---

## 🎯 Key Topics & Projects

### 🌐 Web Data Access

#### HTTP & Web Scraping (urllib_test.py, urllib_test2.py)
- **URL Handling:**
  - Sending HTTP requests
  - URL encoding and parameters
  - Request headers and authentication
  - Response handling

- **Data Extraction:**
  - Parsing HTML
  - Identifying relevant content
  - Regular expression patterns
  - Data cleaning

**Key Libraries:**
```python
import urllib.request
import urllib.error
import urllib.parse
import requests
```

---

### 📊 Data Format Processing

#### JSON Processing
- **Reading JSON:**
  - JSON parsing with `json` module
  - Nested data structures
  - Type conversion

- **Writing JSON:**
  - Serialization
  - Pretty printing
  - Custom encoders

**Example:**
```python
import json

# Parse JSON
data = json.loads(json_string)

# Serialize
json_str = json.dumps(data, indent=2)

# Work with nested data
for item in data['items']:
    print(item['name'])
```

#### XML Processing
- **Reading XML:**
  - DOM parsing
  - SAX parsing
  - ElementTree API

- **XPath Queries:**
  - Element selection
  - Attribute access
  - Namespace handling

**Example:**
```python
import xml.etree.ElementTree as ET

tree = ET.parse('data.xml')
root = tree.getroot()

for child in root:
    print(child.tag, child.attrib)
```

---

### 🔗 REST API Integration

#### API Communication
- **HTTP Methods:**
  - GET - Retrieve data
  - POST - Send data
  - PUT - Update data
  - DELETE - Remove data

- **Authentication:**
  - API keys
  - OAuth 2.0
  - JWT tokens

- **Error Handling:**
  - Status code checking
  - Exception handling
  - Retry logic

**Example:**
```python
import requests

# GET request
response = requests.get('https://api.example.com/data')
data = response.json()

# POST request with data
payload = {'key': 'value'}
response = requests.post('https://api.example.com/create', json=payload)
```

#### Popular APIs
- OpenWeather API - Weather data
- Google Maps API - Geolocation services
- Twitter API - Social data
- REST JSON APIs - General data services

---

### 🗄️ Database Operations

#### SQLite Database
- **Creating Tables:**
  - Schema definition
  - Data types
  - Constraints

- **CRUD Operations:**
  - INSERT - Add records
  - SELECT - Query data
  - UPDATE - Modify records
  - DELETE - Remove records

- **Advanced Queries:**
  - JOINs - Multi-table queries
  - Aggregations - COUNT, SUM, AVG
  - Ordering and filtering
  - Group by clauses

**Example:**
```python
import sqlite3

conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Create table
cursor.execute('''CREATE TABLE users
                  (id INTEGER PRIMARY KEY, name TEXT, email TEXT)''')

# Insert data
cursor.execute("INSERT INTO users VALUES (1, 'John', 'john@example.com')")

# Query data
cursor.execute("SELECT * FROM users WHERE name = ?", ('John',))
results = cursor.fetchall()

conn.commit()
conn.close()
```

---

### 🗺️ Geospatial Analysis (geolocation/)

#### Geographic Concepts
- **Coordinates:**
  - Latitude and Longitude
  - Coordinate systems
  - Projection transforms

- **Distance Calculation:**
  - Haversine formula
  - Great-circle distance
  - Euclidean distance

- **Mapping:**
  - OpenStreetMap integration
  - Map visualization
  - Location clustering
  - Heat maps

#### Geospatial Libraries
```python
import geopy                    # Geocoding
from geopy.geocoders import Nominatim

# Geocoding
locator = Nominatim(user_agent="myapp")
location = locator.geocode("175 W Main St")
print(location.latitude, location.longitude)

# Reverse geocoding
location = locator.reverse("40.7128, -74.0060")
```

---

### 🎵 Practical Applications

#### Music Database Project (tracks.py)
- **Database Schema:**
  - Artists table
  - Albums table
  - Tracks table
  - Relationships

- **Queries:**
  - Artist information
  - Album listing
  - Track details
  - Statistics and analysis

#### Data Processing (roaster.py)
- File reading and writing
- Data transformation
- Cleaning and validation
- Summary statistics

---

## 🏆 Curriculum Coverage

### Week 1-2: Python Fundamentals
- Variables and data types
- Control flow
- Functions
- Basic data structures

### Week 3-4: Web Data Access
- HTTP requests
- HTML parsing
- Web scraping basics
- Error handling

### Week 5-6: Data Formats
- JSON processing
- XML parsing
- Data extraction
- Format conversion

### Week 7-8: REST APIs
- API fundamentals
- Authentication
- API clients
- Rate limiting

### Week 9-10: Databases
- SQL fundamentals
- SQLite operations
- Data modeling
- Query optimization

### Week 11-12: Geospatial
- Geographic concepts
- Geocoding
- Mapping
- Distance calculations

### Week 13-14: Integration Projects
- Multi-API projects
- Database design
- Complete pipelines
- Real-world applications

---

## 💻 Technology Stack

```
Python 3.8+          - Programming language
requests             - HTTP client
json/xml             - Data parsing
sqlite3              - Database
geopy                - Geospatial
urllib               - Web scraping
```

---

## 🎓 Learning Outcomes

✅ Access and parse web data (JSON, XML)  
✅ Integrate with REST APIs  
✅ Design and query databases  
✅ Perform geospatial analysis  
✅ Build data pipelines  
✅ Handle errors and edge cases  
✅ Work with real-world datasets  
✅ Create complete data applications  

---

## 🚀 Quick Start

```bash
# Install dependencies
pip install requests geopy

# Run examples
python urllib_test.py
python tracks.py
python geolocation/mapping.py

# Interactive database work
python -i tracks.py
```

---

## 📚 Resources

- **Course:** Dr. Chuck Severance's "Programming for Everybody"
- **Documentation:**
  - Python docs: docs.python.org
  - Requests: requests.readthedocs.io
  - GeoPy: geopy.readthedocs.io
- **APIs:** 
  - OpenWeather: openweathermap.org
  - Google Maps: developers.google.com/maps

---

## 🔗 Quick Links

- **Main Portfolio:** [../PROJECTS.md](../PROJECTS.md)
- **ICT Python Basics:** [../ict](../ict)
- **Machine Learning:** [../machine-learning](../machine-learning)

---

<div align="center">

**Python connects the world of data. Learn to extract value from anywhere.**

*From APIs to databases to maps—Python is the universal tool.*

</div>
- Visualize geographic information
- Understand web protocols and data formats

---

## 📚 Course Content Overview

### Module 1: Network & HTTP Fundamentals
**Focus**: Understanding web communication protocols

**Topics**:
- HTTP requests and responses
- URL structure and parameters
- Request headers and methods
- Status codes (200, 404, 500, etc.)
- Network sockets in Python

**Files**:
- `urllib_test.py` - Basic URL operations
- `urllib_test2.py` - Advanced URL handling

### Module 2: Data Format Processing
**Focus**: Parsing and manipulating different data formats

#### XML Data
- Document Object Model (DOM) parsing
- Element Tree parsing
- XPath queries
- Namespace handling

#### JSON Data
- JSON structure and syntax
- Serialization/deserialization
- Nested object navigation
- Data validation

**Topics**:
- Web-based XML/JSON sources
- Parsing hierarchical data
- Error handling for malformed data
- Performance optimization

**Files in `web-data/`**:
- `xml_parser.py` - XML document handling
- `json_processor.py` - JSON data manipulation
- `email_database.py` - Database integration
- `network_io.py` - Network communication

### Module 3: Geolocation & Mapping
**Focus**: Geographic data processing and visualization

**Key Concepts**:
- Latitude/longitude coordinates
- Geocoding (address → coordinates)
- Reverse geocoding (coordinates → address)
- Distance calculations
- Map visualization

**Files in `geolocation/`**:
- `opencourseware_map.py` - OpenCourseWare location scraping
- `location_pipeline.py` - Geocoding pipeline
- `map_visualizer.py` - HTML/interactive maps
- `distance_calculator.py` - Geographic calculations

**Technologies**:
- OpenStreetMap API
- Nominatim geocoding service
- Folium (interactive maps)
- Geographic distance formulas

### Module 4: Data & Databases
**Focus**: Persistent data storage and retrieval

**Concepts**:
- Database fundamentals
- SQL basics (SELECT, INSERT, UPDATE, DELETE)
- Database design
- Connection pooling
- Data integrity

**Files in `data/`**:
- CSV datasets for practice
- JSON data samples
- Database schema examples

**Use Cases**:
- Storing scraped web data
- Indexing for fast queries
- Data aggregation
- Analytics and reporting

---

## 📁 Directory Structure

```
python-for-everyone/
├── README.md                      # This file
├── Introduction Exercises
│   ├── python1.py                   # First program
│   └── basics.py                   # Basic concepts
├── Web Data Exercises
│   ├── urllib_test.py               # Basic URL access
│   ├── urllib_test2.py              # Advanced URL operations
│   └── web-data/                   # Web scraping & parsing
│       ├── xml_parsing.py            # XML/HTML parsing
│       ├── json_processing.py         # JSON manipulation
│       ├── email_database.py          # Email data storage
│       └── network_io.py              # Network operations
├── Geolocation Module
│   ├── geolocation/
│   │   ├── opencourseware_map.py     # University location finder
│   │   ├── location_data.txt          # Extracted locations
│   │   ├── mapping_pipeline.py        # Geocoding pipeline
│   │   ├── where.html                 # Interactive map output
│   │   └── distance_calc.py           # Geographic calculations
│   └── visualization/
│       └── map_viewer.html            # Map in browser
├── Data & Databases
│   ├── data/
│   │   ├── sample.csv                 # Sample dataset
│   │   │── sample.json                # JSON data
│   │   └── schema.sql                 # Database schema
│   └── database_examples.py        # Database operations
├── Utility Programs
│   ├── roaster.py                  # Data processing
│   └── tracks.py                   # Music/track data
└── requirements.txt              # Python dependencies
```

---

## 🔧 Technology Stack

### Core Libraries
```python
import urllib.request          # HTTP requests
import json                    # JSON parsing
import xml.etree.ElementTree   # XML parsing
import sqlite3                 # Database (SQLite)
import csv                     # CSV handling
import re                      # Regular expressions
```

### Web & Geolocation
```python
from geopy import geocoders     # Geocoding
import folium                  # Interactive maps
import requests                # HTTP library
from bs4 import BeautifulSoup  # HTML parsing
```

### Data Processing
```python
import pandas as pd            # Data manipulation
import numpy as np             # Numerical computing
```

---

## 📖 Key Learning Topics

### 1. Web Data Access

#### URLs and HTTP
```python
import urllib.request

# Basic request
response = urllib.request.urlopen('http://api.example.com/data')
data = response.read()
print(data)

# With parameters
params = {'key': 'value'}
url = 'http://api.example.com/data?' + urllib.parse.urlencode(params)
```

#### Error Handling
```python
import urllib.error

try:
    response = urllib.request.urlopen(url)
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
```

### 2. Data Format Parsing

#### JSON Processing
```python
import json

# Parse JSON
json_string = '{"name": "John", "age": 30}'
data = json.loads(json_string)
print(data['name'])  # "John"

# Create JSON
data = {'name': 'John', 'age': 30}
json_string = json.dumps(data)
print(json_string)
```

#### XML Parsing
```python
import xml.etree.ElementTree as ET

tree = ET.parse('data.xml')
root = tree.getroot()

for item in root.findall('item'):
    name = item.find('name').text
    value = item.find('value').text
    print(f"{name}: {value}")
```

### 3. Geolocation Services

#### Geocoding
```python
from geopy.geocoders import Nominatim

geolocator = Nominatim(user_agent="my_app")
location = geolocator.geocode("175 West 200 South Salt Lake City UT")
print(location.latitude, location.longitude)
```

#### Creating Maps
```python
import folium

# Create map
m = folium.Map([40.758, -73.985], zoom_start=12)

# Add marker
folium.Marker(
    location=[40.758, -73.985],
    popup="Empire State Building"
).add_to(m)

m.save('map.html')
```

### 4. Database Operations

#### SQLite
```python
import sqlite3

# Connect
conn = sqlite3.connect('database.db')
cursor = conn.cursor()

# Create table
cursor.execute('''
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        name TEXT,
        email TEXT
    )
''')

# Insert
cursor.execute("INSERT INTO users (name, email) VALUES (?, ?)",
              ('John Doe', 'john@example.com'))
conn.commit()

# Query
cursor.execute("SELECT * FROM users")
for row in cursor.fetchall():
    print(row)

conn.close()
```

---

## 💻 Getting Started

### Prerequisites
- Python 3.8+
- pip package manager
- Internet connection (for API access)

### Installation

```bash
# Navigate to directory
cd python-for-everyone

# Install dependencies
pip install -r requirements.txt

# Or install individually
pip install requests
pip install geopy folium
pip install pandas
```

### Running Examples

```bash
# Basic URL access
python urllib_test.py

# Geolocation pipeline
python geolocation/opencourseware_map.py

# Generate map
python geolocation/mapping_pipeline.py
# Opens map in: geolocation/where.html

# Database operations
python data/database_examples.py
```

---

## 📊 Real-World Projects

### Project 1: OpenCourseWare University Locator
**Objective**: Scrape university names and create an interactive map

**Steps**:
1. Fetch OpenCourseWare website
2. Parse HTML to extract university names
3. Geocode each university location
4. Create interactive map with markers
5. Display distances and information

**Output**: `geolocation/where.html` - Interactive map viewable in browser

**Skills**: Web scraping, geocoding, geospatial visualization

### Project 2: Email Database System
**Objective**: Collect emails and store in database

**Workflow**:
1. Parse email URLs
2. Extract email addresses
3. Store in SQLite database
4. Query and analyze data
5. Generate reports

**Skills**: Web scraping, database design, data analysis

### Project 3: JSON API Integration
**Objective**: Consume web APIs and process JSON data

**Example**: Weather API
```python
import urllib.request
import json

url = 'https://api.open-meteo.com/v1/forecast?latitude=40&longitude=-74'
response = urllib.request.urlopen(url)
data = json.loads(response.read())

print(data['hourly']['temperature_2m'])
```

---

## 🎓 Learning Outcomes

✅ Access web data programmatically
✅ Parse XML and JSON documents
✅ Work with REST APIs
✅ Perform geocoding and geolocation
✅ Create interactive maps
✅ Store and retrieve data from databases
✅ Build data pipelines
✅ Understand web protocols
✅ Handle errors gracefully
✅ Visualize geographic information

---

## 📚 Recommended Resources

- **Course**: Python for Everybody (Dr. Chuck Severance)
- **Website**: www.pythonforeverybody.com
- **Books**:
  - "Automate the Boring Stuff with Python" (Al Sweigart)
  - "Web Scraping with Python" (Ryan Mitchell)

- **API Documentation**:
  - OpenStreetMap
  - Nominatim Geocoding
  - JSON APIs

---

## 📄 License

MIT License - See LICENSE file

---

## 👨‍🎨 Course Credit

Based on "Python for Everybody" by Dr. Charles Severance
- Website: www.dr-chuck.com
- Course: Coursera
- Free and open materials
