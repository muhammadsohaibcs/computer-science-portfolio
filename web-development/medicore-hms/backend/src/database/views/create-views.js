/**
 * MongoDB Views Setup
 * Creates useful views for common queries and reporting
 * 
 * Run with: node backend/src/database/views/create-views.js
 */

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hms';

/**
 * View Definitions
 */
const views = [
  {
    name: 'activeAppointments',
    source: 'appointments',
    pipeline: [
      {
        $match: {
          status: { $in: ['Scheduled', 'In Progress'] },
          date: { $gte: new Date() }
        }
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $unwind: { path: '$patientInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          date: 1,
          time: 1,
          status: 1,
          reason: 1,
          'patientInfo.name': 1,
          'patientInfo.contact': 1,
          'doctorInfo.name': 1,
          'doctorInfo.specialization': 1,
          createdAt: 1
        }
      },
      {
        $sort: { date: 1, time: 1 }
      }
    ],
    description: 'Active appointments with patient and doctor details'
  },
  
  {
    name: 'lowStockInventory',
    source: 'inventories',
    pipeline: [
      {
        $match: {
          $expr: { $lte: ['$quantity', '$reorderThreshold'] }
        }
      },
      {
        $project: {
          itemCode: 1,
          name: 1,
          category: 1,
          quantity: 1,
          reorderThreshold: 1,
          unit: 1,
          stockStatus: {
            $cond: {
              if: { $eq: ['$quantity', 0] },
              then: 'Out of Stock',
              else: 'Low Stock'
            }
          },
          deficit: { $subtract: ['$reorderThreshold', '$quantity'] }
        }
      },
      {
        $sort: { quantity: 1 }
      }
    ],
    description: 'Inventory items that are low or out of stock'
  },
  
  {
    name: 'unpaidBills',
    source: 'bills',
    pipeline: [
      {
        $match: { paid: false }
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $unwind: { path: '$patientInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          'patientInfo.name': 1,
          'patientInfo.contact': 1,
          subtotal: 1,
          taxes: 1,
          total: 1,
          items: 1,
          createdAt: 1,
          daysOverdue: {
            $dateDiff: {
              startDate: '$createdAt',
              endDate: '$$NOW',
              unit: 'day'
            }
          }
        }
      },
      {
        $sort: { createdAt: 1 }
      }
    ],
    description: 'Unpaid bills with patient information and days overdue'
  },
  
  {
    name: 'recentMedicalRecords',
    source: 'medicalrecords',
    pipeline: [
      {
        $match: {
          visitDate: {
            $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) // Last 90 days
          }
        }
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $unwind: { path: '$patientInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $unwind: { path: '$doctorInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          visitDate: 1,
          diagnosis: 1,
          treatment: 1,
          'patientInfo.name': 1,
          'patientInfo._id': 1,
          'doctorInfo.name': 1,
          'doctorInfo.specialization': 1,
          createdAt: 1
        }
      },
      {
        $sort: { visitDate: -1 }
      }
    ],
    description: 'Medical records from the last 90 days with patient and doctor details'
  },
  
  {
    name: 'activeInsurance',
    source: 'insurances',
    pipeline: [
      {
        $match: {
          validTo: { $gte: new Date() }
        }
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $unwind: { path: '$patientInfo', preserveNullAndEmptyArrays: true }
      },
      {
        $project: {
          providerName: 1,
          policyNumber: 1,
          validFrom: 1,
          validTo: 1,
          details: 1,
          'patientInfo.name': 1,
          'patientInfo.contact': 1,
          daysUntilExpiry: {
            $dateDiff: {
              startDate: '$$NOW',
              endDate: '$validTo',
              unit: 'day'
            }
          }
        }
      },
      {
        $sort: { validTo: 1 }
      }
    ],
    description: 'Active insurance policies with expiry countdown'
  },
  
  {
    name: 'doctorSchedule',
    source: 'appointments',
    pipeline: [
      {
        $match: {
          date: { $gte: new Date() },
          status: { $ne: 'Cancelled' }
        }
      },
      {
        $lookup: {
          from: 'doctors',
          localField: 'doctor',
          foreignField: '_id',
          as: 'doctorInfo'
        }
      },
      {
        $lookup: {
          from: 'patients',
          localField: 'patient',
          foreignField: '_id',
          as: 'patientInfo'
        }
      },
      {
        $unwind: '$doctorInfo'
      },
      {
        $unwind: '$patientInfo'
      },
      {
        $group: {
          _id: {
            doctor: '$doctor',
            date: { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
          },
          doctorName: { $first: '$doctorInfo.name' },
          specialization: { $first: '$doctorInfo.specialization' },
          date: { $first: '$date' },
          appointments: {
            $push: {
              time: '$time',
              patient: '$patientInfo.name',
              reason: '$reason',
              status: '$status'
            }
          },
          totalAppointments: { $sum: 1 }
        }
      },
      {
        $sort: { date: 1, doctorName: 1 }
      }
    ],
    description: 'Doctor schedules grouped by date with appointment details'
  },
  
  {
    name: 'patientSummary',
    source: 'patients',
    pipeline: [
      {
        $lookup: {
          from: 'appointments',
          localField: '_id',
          foreignField: 'patient',
          as: 'appointments'
        }
      },
      {
        $lookup: {
          from: 'medicalrecords',
          localField: '_id',
          foreignField: 'patient',
          as: 'medicalRecords'
        }
      },
      {
        $lookup: {
          from: 'bills',
          localField: '_id',
          foreignField: 'patient',
          as: 'bills'
        }
      },
      {
        $project: {
          name: 1,
          dob: 1,
          gender: 1,
          contact: 1,
          primaryDoctor: 1,
          totalAppointments: { $size: '$appointments' },
          totalMedicalRecords: { $size: '$medicalRecords' },
          totalBills: { $size: '$bills' },
          totalBillAmount: { $sum: '$bills.total' },
          unpaidBills: {
            $size: {
              $filter: {
                input: '$bills',
                as: 'bill',
                cond: { $eq: ['$$bill.paid', false] }
              }
            }
          },
          lastVisit: { $max: '$appointments.date' },
          createdAt: 1
        }
      }
    ],
    description: 'Patient summary with appointment, record, and billing statistics'
  }
];

/**
 * Create all views
 */
async function createViews() {
  try {
    console.log('🔄 Connecting to MongoDB...\n');
    await mongoose.connect(MONGO_URI);
    
    const db = mongoose.connection.db;
    const existingCollections = await db.listCollections().toArray();
    const existingNames = existingCollections.map(c => c.name);
    
    console.log('📊 Creating MongoDB Views...\n');
    console.log('='.repeat(60));
    
    for (const view of views) {
      try {
        // Drop view if it exists
        if (existingNames.includes(view.name)) {
          await db.dropCollection(view.name);
          console.log(`♻️  Dropped existing view: ${view.name}`);
        }
        
        // Create view
        await db.createCollection(view.name, {
          viewOn: view.source,
          pipeline: view.pipeline
        });
        
        console.log(`✅ Created view: ${view.name}`);
        console.log(`   Source: ${view.source}`);
        console.log(`   Description: ${view.description}`);
        console.log('');
      } catch (err) {
        console.error(`❌ Failed to create view ${view.name}:`, err.message);
      }
    }
    
    console.log('='.repeat(60));
    console.log(`\n✅ Successfully created ${views.length} views!\n`);
    
    console.log('📖 Usage Examples:\n');
    console.log('// Query a view like a regular collection');
    console.log('db.activeAppointments.find()');
    console.log('db.lowStockInventory.find()');
    console.log('db.unpaidBills.find({ daysOverdue: { $gt: 30 } })');
    console.log('\n// In your application:');
    console.log('const activeAppts = await mongoose.connection.db.collection("activeAppointments").find().toArray();');
    
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  createViews();
}

module.exports = { createViews, views };
