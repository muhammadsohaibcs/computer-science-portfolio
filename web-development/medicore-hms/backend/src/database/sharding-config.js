/**
 * Sharding configuration and documentation for HMS collections
 * 
 * NOTE: Sharding must be enabled at the MongoDB cluster level.
 * These configurations provide the recommended shard keys and setup commands.
 */

module.exports = {
  enabled: process.env.ENABLE_SHARDING === 'true',
  
  collections: {
    patients: {
      shardKey: { _id: 'hashed' },
      rationale: 'Hashed _id provides even distribution. Patients are accessed by ID in most queries.',
      command: 'sh.shardCollection("hms.patients", { "_id": "hashed" })'
    },
    
    appointments: {
      shardKey: { doctor: 1, appointmentDate: 1 },
      rationale: 'Compound key on doctor and date supports common query patterns (doctor schedule queries).',
      command: 'sh.shardCollection("hms.appointments", { "doctor": 1, "appointmentDate": 1 })',
      note: 'Ensure doctor field is always included in queries for targeted shard routing'
    },
    
    medicalRecords: {
      shardKey: { patient: 1, createdAt: 1 },
      rationale: 'Records are queried by patient. createdAt provides range-based distribution.',
      command: 'sh.shardCollection("hms.medicalRecords", { "patient": 1, "createdAt": 1 })'
    },
    
    inventory: {
      shardKey: { itemCode: 'hashed' },
      rationale: 'Hashed itemCode for even distribution. Inventory accessed by itemCode.',
      command: 'sh.shardCollection("hms.inventory", { "itemCode": "hashed" })'
    },
    
    bills: {
      shardKey: { patient: 1, createdAt: 1 },
      rationale: 'Bills queried by patient. Time-based component for range queries.',
      command: 'sh.shardCollection("hms.bills", { "patient": 1, "createdAt": 1 })'
    }
  },
  
  /**
   * Get setup commands for MongoDB shell
   * @returns {string} MongoDB shell commands to enable sharding
   */
  getSetupCommands() {
    const commands = ['// Enable sharding on database', 'sh.enableSharding("hms")', ''];
    
    Object.entries(this.collections).forEach(([name, config]) => {
      commands.push(`// ${name}: ${config.rationale}`);
      commands.push(config.command);
      if (config.note) commands.push(`// Note: ${config.note}`);
      commands.push('');
    });
    
    return commands.join('\n');
  }
};
