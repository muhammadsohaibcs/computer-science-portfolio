/**
 * patients.service.js
 * Handles patient CRUD + email notification on creation.
 */

const mongoose = require('mongoose');
const crypto   = require('crypto');
const PatientsRepo     = require('../repositories/patients.repo');
const MedicalRecordsRepo = require('../repositories/medical-records.repo');
const UsersRepo        = require('../repositories/users.repo');
const OtpService       = require('./otp.service');   // reuse nodemailer setup
const logger           = require('../utils/logger');
const nodemailer       = require('nodemailer');

function createTransporter() {
  if (process.env.SMTP_HOST) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT) || 587,
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    });
  }
  if (process.env.SENDGRID_API_KEY) {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net', port: 587,
      auth: { user: 'apikey', pass: process.env.SENDGRID_API_KEY },
    });
  }
  return null;
}

async function sendWelcomeEmail(patient, tempPassword) {
  const transporter = createTransporter();
  const loginUrl = `${process.env.FRONTEND_ORIGIN || 'http://localhost:3000'}/login`;

  if (!transporter) {
    logger.warn({ patientId: patient._id }, '⚠️ No email provider — patient welcome email skipped (DEV)');
    console.log(`\n📧 [DEV] Patient Welcome Email\nEmail: ${patient.contact?.email}\nTemp Password: ${tempPassword}\nLogin URL: ${loginUrl}\n`);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@medicore-hms.com',
      to: patient.contact?.email,
      subject: 'Welcome to MediCore HMS — Your Account is Ready',
      html: `
        <div style="font-family:'DM Sans',Arial,sans-serif;max-width:520px;margin:0 auto;padding:32px 24px;background:#f8fafc;border-radius:16px;">
          <div style="background:linear-gradient(135deg,#1557c9,#2579e8);border-radius:12px;padding:28px;text-align:center;margin-bottom:24px;">
            <h1 style="color:white;margin:0;font-size:24px;font-weight:800;">MediCore HMS</h1>
            <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:13px;">Hospital Management System</p>
          </div>
          <h2 style="color:#1e293b;font-size:20px;margin:0 0 8px;">Welcome, ${patient.name}!</h2>
          <p style="color:#64748b;font-size:14px;line-height:1.7;margin:0 0 20px;">
            Your patient account at <strong>MediCore Hospital</strong> has been created.
            Use the credentials below to log in and access your health records, appointments, lab results, and messages.
          </p>
          <div style="background:white;border:2px solid #e2e8f0;border-radius:12px;padding:20px;margin-bottom:20px;">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="color:#94a3b8;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Login URL</td>
                <td style="color:#2579e8;font-size:13px;padding:6px 0;"><a href="${loginUrl}" style="color:#2579e8;">${loginUrl}</a></td>
              </tr>
              <tr>
                <td style="color:#94a3b8;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Username</td>
                <td style="color:#1e293b;font-size:13px;padding:6px 0;font-weight:600;">${patient.contact?.email}</td>
              </tr>
              <tr>
                <td style="color:#94a3b8;font-size:12px;padding:6px 0;text-transform:uppercase;letter-spacing:1px;font-weight:600;">Temp Password</td>
                <td style="font-size:18px;padding:6px 0;font-weight:800;color:#1557c9;font-family:monospace;letter-spacing:3px;">${tempPassword}</td>
              </tr>
            </table>
          </div>
          <div style="background:#fef3c7;border:1px solid #fbbf24;border-radius:10px;padding:14px;margin-bottom:20px;">
            <p style="color:#92400e;font-size:13px;margin:0;font-weight:600;">
              ⚠️ Please change your password after your first login for security.
            </p>
          </div>
          <p style="color:#94a3b8;font-size:12px;text-align:center;">
            If you did not expect this email, please contact the hospital reception desk.<br/>
            © ${new Date().getFullYear()} MediCore Hospital. All rights reserved.
          </p>
        </div>
      `,
    });
    logger.info({ patientId: patient._id, email: patient.contact?.email }, 'Welcome email sent');
  } catch (err) {
    logger.error({ err }, 'Failed to send welcome email');
  }
}

class PatientsService {
  async create(data, createdBy) {
    data.createdBy = createdBy;
    const p = await PatientsRepo.create(data);

    // Auto-create a user account for the patient if they have an email
    if (p.contact?.email) {
      try {
        const tempPassword = crypto.randomBytes(6).toString('base64url'); // 8-char URL-safe
        const argon2 = require('argon2');
        const hash = await argon2.hash(tempPassword);

        const existing = await UsersRepo.findByUsername(p.contact.email).catch(() => null);
        if (!existing) {
          await UsersRepo.create({
            username: p.contact.email,
            passwordHash: hash,
            role: 'Patient',
            email: p.contact.email,
            profileRef: { kind: 'Patient', item: p._id },
          });
          logger.info({ patientId: p._id }, 'Patient user account created');
          await sendWelcomeEmail(p, tempPassword);
        }
      } catch (err) {
        logger.error({ err, patientId: p._id }, 'Failed to create patient user account');
      }
    }

    logger.info({ patientId: p._id, createdBy }, 'Patient created');
    return p;
  }

  async list({ page = 1, limit = 20, q = null } = {}) {
    const filter = {};
    if (q) filter.name = new RegExp(q, 'i');
    const totalItems = await PatientsRepo.count(filter);
    const data = await PatientsRepo.find(filter, null, { page, limit });
    return { data, pagination: { currentPage: page, totalPages: Math.ceil(totalItems / limit), totalItems, itemsPerPage: limit } };
  }

  async get(id) { return PatientsRepo.getWithRecords(id); }

  async update(id, data) {
    if (data.version !== undefined && data.version !== null) {
      const version = data.version; delete data.version;
      return PatientsRepo.optimisticUpdate(id, version, { $set: data });
    }
    return PatientsRepo.updateById(id, data);
  }

  async remove(id) { return PatientsRepo.deleteById(id); }

  async addMedicalRecord(patientId, recordData, userId) {
    const session = await mongoose.startSession();
    try {
      let created;
      await session.withTransaction(async () => {
        recordData.createdBy = userId;
        created = await MedicalRecordsRepo.createAndLinkToPatient(recordData, patientId, session);
      });
      session.endSession();
      return created;
    } catch (err) { session.endSession(); throw err; }
  }
}

module.exports = new PatientsService();
