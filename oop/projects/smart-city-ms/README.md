# Smart City Management System

## What's Implemented

A Java application in `SmartCityMS.java` demonstrating object-oriented programming with generics and file-based persistence.

### Core Classes

1. **CityRepository<T extends CityResource>**
   - Generic repository pattern for CRUD operations
   - Methods:
     - `addResource(T res)` - Add new resource
     - `removeResource(String id)` - Delete resource
     - `getResourceByID(String id, Class<S> clazz)` - Retrieve by ID
     - `updateResource(CityResource updated)` - Update existing
     - `selectByLocation(String location)` - Filter by location
     - `displayAll(Class<S> clazz)` - Get all resources of type
   - File-based persistence using serialization
   - Reads/writes to `SmartCityRecord.ser`

2. **CityResource (Abstract Base Class)**
   - Properties: resourceID, location, status, hubId, zoneId
   - Abstract method: `calcMaintanenceCost()`
   - Static method: `updateStatus(String id, String st)`
   - Implements: `Reportable`, `Serializable`

3. **TransportUnit (Abstract)**
   - Extends: CityResource
   - Properties: passengerCount, fuelCost, distance
   - Static method: `inactiveUnits()` - Get inactive transport
   - Subclasses:
     - **Bus**
       - Maintenance cost = fuelCost × distance
       - Usage report generation
     - **Train**
       - Same calculation as Bus
       - Specialized toString()

4. **PowerStation**
   - Properties: outputRate, costPerHour, riskToOutages, gridId
   - Static variable: totalOutputRate (tracks all stations)
   - Static method: `atRiskStations()` - Get risky power stations
   - Static method: `updateRisk(String id, String st)` - Mark as risk
   - Implements: `Alertable`
   - Method: `sendEmergencyAlert()` - Generate alerts

5. **SmartGrid**
   - Properties: gridId, girdName, powerStations, consumers
   - Methods:
     - `addPowerStation(PowerStation p)`
     - `addConsumer(Consumer c)`
     - Getters for all properties

6. **Consumer**
   - Properties: consumerId, consumerType, location
   - Simple data class with getters/setters

7. **EmergencyService**
   - Properties: type, noOfEmployees, noOfEquipments, costPerEntity
   - Methods:
     - `calcMaintanenceCost()` - (noOfEmployees + noOfEquipments) × costPerEntity
     - `generateUsageReport()` - Return service details
   - Implements: `Alertable`

### Interfaces

- **Reportable**
  - Method: `generateUsageReport()` - Return service metrics

- **Alertable**
  - Method: `sendEmergencyAlert()` - Generate emergency notification

### File Structure

```
SmartCityMS.java
├── CityRepository (Generic CRUD)
├── CityResource (Abstract base)
├── TransportUnit (Abstract)
│   ├── Bus
│   └── Train
├── PowerStation
├── SmartGrid
├── Consumer
├── EmergencyService
├── Reportable (Interface)
└── Alertable (Interface)
```

### Key Features

1. **Generic Repository Pattern**
   - Works with any CityResource subclass
   - Type-safe operations
   - Flexible filtering

2. **File Serialization**
   - Saves all resources to `SmartCityRecord.ser`
   - ObjectInputStream/ObjectOutputStream for persistence
   - Handles EOFException for proper file reading

3. **Inheritance Hierarchy**
   - CityResource base for all city assets
   - TransportUnit for transport services
   - Specialized subclasses for specific resources

4. **Static Operations**
   - Track total power output across all stations
   - Query inactive transport units
   - Query at-risk power stations

### Data Flow

```
CityRepository
    ↓
readAllResources() ← SmartCityRecord.ser
    ↓
ObjectInputStream reads CityResource objects
    ↓
Adds to ArrayList<CityResource>
    ↓
displayAll() filters by type (generics)
```

---

## ✅ What You Accomplished

✅ Created generic Repository<T> class with CRUD operations
✅ Designed abstract CityResource hierarchy
✅ Implemented multiple resource types (Transport, Power, Emergency)
✅ Used interfaces (Reportable, Alertable) for polymorphism
✅ Implemented file-based persistence with serialization
✅ Used generics for type-safe filtering and display
✅ Created SmartGrid management for power distribution
✅ Static methods for tracking and querying resources

