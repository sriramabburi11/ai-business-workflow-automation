import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed with comprehensive video demo data...');

  // Clean existing tables safely
  try {
    await prisma.auditLog.deleteMany();
    await prisma.approval.deleteMany();
    await prisma.task.deleteMany();
    await prisma.workflowExecution.deleteMany();
    await prisma.document.deleteMany();
    await prisma.workflowStep.deleteMany();
    await prisma.workflow.deleteMany();
    await prisma.user.deleteMany();
    await prisma.organization.deleteMany();
  } catch (e) {
    console.warn('Table cleanup warning:', e);
  }

  // 1. Create Default Organization
  const org = await prisma.organization.create({
    data: {
      name: 'Smart Automation Technologies Inc.',
      ownerId: 'placeholder'
    }
  });

  // 2. Create Team Users (Admin, Manager, Finance, HR)
  const hashedPassword = await bcrypt.hash('Password123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Sarah Connor',
      email: 'sarah.connor@enterprise.io',
      password: hashedPassword,
      role: 'ADMIN',
      organizationId: org.id
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Alex Rivera',
      email: 'alex.rivera@enterprise.io',
      password: hashedPassword,
      role: 'MANAGER',
      organizationId: org.id
    }
  });

  const financeUser = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'david.chen@enterprise.io',
      password: hashedPassword,
      role: 'FINANCE',
      organizationId: org.id
    }
  });

  const hrUser = await prisma.user.create({
    data: {
      name: 'Maya Lin',
      email: 'maya.lin@enterprise.io',
      password: hashedPassword,
      role: 'HR',
      organizationId: org.id
    }
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: { ownerId: admin.id }
  });

  // 3. Create Demo Workflows
  const wf1 = await prisma.workflow.create({
    data: {
      organizationId: org.id,
      title: 'AI Automated Expense & Vendor Disbursement',
      description: 'Ingests vendor receipts, runs AI OCR extraction, flags compliance anomalies, and routes for manager approval.',
      trigger: 'DOCUMENT_UPLOAD',
      status: 'ACTIVE',
      createdBy: admin.id,
      steps: {
        create: [
          { name: 'Upload & Parse Expense Invoice', type: 'AI_EXTRACT', order: 1, assignedRole: 'MEMBER', config: JSON.stringify({ documentType: 'Invoice' }) },
          { name: 'AI Policy & Duplicate Check', type: 'CONDITION', order: 2, assignedRole: 'SYSTEM', config: JSON.stringify({ maxAutoApprove: 500 }) },
          { name: 'Manager Expense Approval Sign-off', type: 'APPROVAL', order: 3, assignedRole: 'MANAGER', config: JSON.stringify({ approvalThreshold: 500 }) },
          { name: 'Finance ERP Disbursement Sync', type: 'TASK_ASSIGNMENT', order: 4, assignedRole: 'FINANCE', config: JSON.stringify({ integration: 'QuickBooks' }) },
          { name: 'Dispatch Payout Notification Email', type: 'NOTIFICATION', order: 5, assignedRole: 'SYSTEM', config: JSON.stringify({ channel: 'Email' }) }
        ]
      }
    }
  });

  const wf2 = await prisma.workflow.create({
    data: {
      organizationId: org.id,
      title: 'AI HR Employee Onboarding & Provisioning',
      description: 'Automates identity document checks, IT hardware provisioning tasks, e-signatures, and Slack account generation.',
      trigger: 'MANUAL',
      status: 'ACTIVE',
      createdBy: admin.id,
      steps: {
        create: [
          { name: 'Verify Passport / ID Document', type: 'AI_EXTRACT', order: 1, assignedRole: 'HR', config: JSON.stringify({ docType: 'ID' }) },
          { name: 'IT Equipment Allocation Sign-off', type: 'APPROVAL', order: 2, assignedRole: 'MANAGER', config: JSON.stringify({}) },
          { name: 'Provision Workspace & Email Accounts', type: 'API_CALL', order: 3, assignedRole: 'ADMIN', config: JSON.stringify({ service: 'Google Workspace' }) },
          { name: 'Send Digital Welcome Kit', type: 'NOTIFICATION', order: 4, assignedRole: 'SYSTEM', config: JSON.stringify({}) }
        ]
      }
    }
  });

  const wf3 = await prisma.workflow.create({
    data: {
      organizationId: org.id,
      title: 'Customer Escalation & Contract Renewal AI Review',
      description: 'Evaluates high-tier enterprise SLAs, analyzes legal contract terms with Gemini AI, and escalates at-risk customer accounts.',
      trigger: 'SCHEDULE',
      status: 'ACTIVE',
      createdBy: manager.id,
      steps: {
        create: [
          { name: 'Scan Expiring Enterprise Contracts', type: 'AI_EXTRACT', order: 1, assignedRole: 'SYSTEM', config: JSON.stringify({}) },
          { name: 'AI Risk Score & Renewal Recommendation', type: 'CONDITION', order: 2, assignedRole: 'SYSTEM', config: JSON.stringify({}) },
          { name: 'Account Executive Discount Approval', type: 'APPROVAL', order: 3, assignedRole: 'MANAGER', config: JSON.stringify({}) }
        ]
      }
    }
  });

  // 4. Create Demo Tasks
  const task1 = await prisma.task.create({
    data: {
      workflowId: wf1.id,
      title: 'Approve Cloud Infrastructure Invoice #INV-2026-8942',
      description: 'Vendor expense for Acme Cloud Services ($4,590.00). Invoiced on 2026-07-28.',
      assignee: 'MANAGER',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: '2026-08-10'
    }
  });

  const task2 = await prisma.task.create({
    data: {
      workflowId: wf2.id,
      title: 'Provision MacBook Pro & Monitor for New Senior Developer',
      description: 'Hardware requisition ticket for incoming Software Architect.',
      assignee: 'ADMIN',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: '2026-08-12'
    }
  });

  const task3 = await prisma.task.create({
    data: {
      workflowId: wf1.id,
      title: 'Reimburse Travel Expense - Q3 Tech Summit',
      description: 'Flight and hotel receipts submitted by Alex Rivera ($840.00).',
      assignee: 'FINANCE',
      status: 'COMPLETED',
      priority: 'LOW',
      dueDate: '2026-08-05'
    }
  });

  const task4 = await prisma.task.create({
    data: {
      workflowId: wf3.id,
      title: 'Audit Enterprise Master Services Agreement #MSA-2026-441',
      description: 'Contract value $45,000.00. Gemini AI flagged 30-day auto-renewal clause liability.',
      assignee: 'ADMIN',
      status: 'PENDING',
      priority: 'HIGH',
      dueDate: '2026-08-15'
    }
  });

  // 5. Create Demo Approvals (with Gemini Risk Scores)
  await prisma.approval.create({
    data: {
      taskId: task1.id,
      workflowId: wf1.id,
      approver: 'Alex Rivera (Manager)',
      decision: 'PENDING',
      comment: 'Invoice items match purchase order PO-9921; bandwidth add-on verified.',
      aiRiskScore: 18,
      aiRecommendation: 'APPROVE'
    }
  });

  await prisma.approval.create({
    data: {
      taskId: task4.id,
      workflowId: wf3.id,
      approver: 'Sarah Connor (Admin)',
      decision: 'PENDING',
      comment: 'High monetary value ($45,000) & auto-renewal terms require secondary sign-off.',
      aiRiskScore: 78,
      aiRecommendation: 'MANUAL_REVIEW'
    }
  });

  await prisma.approval.create({
    data: {
      taskId: task3.id,
      workflowId: wf1.id,
      approver: 'David Chen (Finance)',
      decision: 'APPROVED',
      comment: 'Receipts verified; paid out via ACH on Aug 05.',
      aiRiskScore: 5,
      aiRecommendation: 'APPROVE'
    }
  });

  // 6. Create Demo Documents (with Gemini OCR extractions)
  await prisma.document.create({
    data: {
      workflowId: wf1.id,
      fileName: 'Acme_Cloud_Invoice_July2026.pdf',
      fileUrl: '/uploads/Acme_Cloud_Invoice_July2026.pdf',
      mimeType: 'application/pdf',
      extractedData: JSON.stringify({
        documentType: 'Invoice / Commercial Receipt',
        extractedFields: {
          vendorName: 'Acme Cloud Solutions Inc.',
          invoiceNumber: 'INV-2026-8942',
          totalAmount: '$4,590.00',
          subtotalAmount: '$4,250.00',
          taxAmount: '$340.00',
          issueDate: '2026-07-28',
          dueDate: '2026-08-28',
          paymentTerms: 'Net 30'
        },
        summary: 'Commercial invoice for enterprise cloud infrastructure services and dedicated hosting for July 2026.',
        riskFlags: ['Total amount exceeds standard $2,500 auto-approval threshold'],
        confidenceScore: 0.98
      })
    }
  });

  await prisma.document.create({
    data: {
      workflowId: wf2.id,
      fileName: 'Employment_Agreement_Signed.pdf',
      fileUrl: '/uploads/Employment_Agreement_Signed.pdf',
      mimeType: 'application/pdf',
      extractedData: JSON.stringify({
        documentType: 'Employment Contract',
        extractedFields: {
          employeeName: 'Jordan Vance',
          roleTitle: 'Senior Full Stack Engineer',
          startDate: '2026-08-15',
          annualSalary: '$165,000.00',
          department: 'Engineering'
        },
        summary: 'Fully executed employment contract with NDA & IP assignment agreement attached.',
        riskFlags: [],
        confidenceScore: 0.99
      })
    }
  });

  await prisma.document.create({
    data: {
      workflowId: wf3.id,
      fileName: 'Enterprise_SLA_Vendor_Contract.pdf',
      fileUrl: '/uploads/Enterprise_SLA_Vendor_Contract.pdf',
      mimeType: 'application/pdf',
      extractedData: JSON.stringify({
        documentType: 'Master Services Agreement',
        extractedFields: {
          partyA: 'Global Tech Enterprises LLC',
          partyB: 'Smart Automation Corp.',
          effectiveDate: '2026-08-01',
          contractValue: '$45,000.00',
          terminationNoticeDays: '30 Days'
        },
        summary: 'Master services agreement governing business automation software licensing and SLAs.',
        riskFlags: ['Auto-renewal clause active unless cancelled 30 days prior'],
        confidenceScore: 0.94
      })
    }
  });

  // 7. Create Workflow Executions
  await prisma.workflowExecution.create({
    data: {
      workflowId: wf1.id,
      status: 'COMPLETED',
      logs: JSON.stringify([
        { timestamp: new Date(Date.now() - 3600000).toISOString(), message: 'Triggered by invoice upload Acme_Cloud_Invoice_July2026.pdf' },
        { timestamp: new Date(Date.now() - 3550000).toISOString(), message: 'Gemini AI OCR parsed total $4,590.00' },
        { timestamp: new Date(Date.now() - 3500000).toISOString(), message: 'Rule check: Exceeds $500 threshold -> Routing to Manager' },
        { timestamp: new Date(Date.now() - 3400000).toISOString(), message: 'Approval task created and assigned to MANAGER' }
      ]),
      startedAt: new Date(Date.now() - 3600000),
      completedAt: new Date(Date.now() - 3400000)
    }
  });

  // 8. Create Audit Logs
  await prisma.auditLog.create({
    data: {
      action: 'SYSTEM_SEED',
      userId: admin.id,
      details: JSON.stringify({ message: 'Enterprise demo dataset initialized successfully' })
    }
  });

  await prisma.auditLog.create({
    data: {
      action: 'WORKFLOW_CREATED',
      userId: admin.id,
      details: JSON.stringify({ title: wf1.title, workflowId: wf1.id })
    }
  });

  await prisma.auditLog.create({
    data: {
      action: 'DOCUMENT_UPLOADED',
      userId: manager.id,
      details: JSON.stringify({ fileName: 'Acme_Cloud_Invoice_July2026.pdf', documentType: 'Invoice' })
    }
  });

  await prisma.auditLog.create({
    data: {
      action: 'APPROVAL_SUBMITTED',
      userId: financeUser.id,
      details: JSON.stringify({ decision: 'APPROVED', amount: '$840.00' })
    }
  });

  console.log('✅ Video demo dataset seeded successfully into PostgreSQL!');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
