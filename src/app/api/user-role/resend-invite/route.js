// app/api/user-role/resend-invite/route.js
import nodemailer from 'nodemailer';
import { NextResponse } from "next/server";

// Your specific roles array
const ROLES = [
  "Secondary Admin",
  "Salesman",
  "Biller",
  "Biller and Salesman",
  "CA/Accountant",
  "Stock Keeper",
  "CA/Account (Edit Access)",
];

export async function POST(req) {
  try {
    const { id, email, name, role, companyName, senderName } = await req.json();
    console.log(role);
    
    // Validate required fields
    if (!email || !name) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Missing required fields: email and name are required",
          debug: { id, email, name, role }
        },
        { status: 400 }
      );
    }

    // Validate role if provided
    if (role && !isValidRole(role)) {
      return NextResponse.json(
        { 
          status: "error", 
          message: "Invalid role specified",
          validRoles: ROLES,
          providedRole: role
        },
        { status: 400 }
      );
    }

    // Log the request for debugging
    // console.log('Resend invite request:', { id, email, name, role, companyName, senderName });

    // Create transporter using environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST || 'smtp.hostinger.com',
      port: parseInt(process.env.MAIL_PORT) || 465,
      secure: process.env.MAIL_PORT === '465' || true,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASSWORD
      }
    });

    // Generate invitation link
    const invitationToken = generateInvitationToken(id || email);
    const appUrl = process.env.APP_URL || process.env.NEXTAUTH_URL || 'https://yourdomain.com';
    const invitationLink = `${appUrl}/company#shared`;
    // const invitationLink = `${appUrl}/accept-invite?token=${invitationToken}&email=${encodeURIComponent(email)}`;

    // Get role display information
    const roleDisplayName = role ? role : "Member";
    const roleDescription = getRoleDescription(role);
    
    // Get company name (fallback to sender's name or platform name)
    const displayCompanyName = companyName || senderName || process.env.APP_NAME || 'the platform';
    
    // Get sender name for personalization
    const displaySenderName = senderName || process.env.APP_NAME || 'Team';

    // Email content with role information
    const mailOptions = {
      from: {
        name: process.env.APP_NAME || 'Sync & Share Platform',
        address: process.env.MAIL_FROM || process.env.MAIL_USER
      },
      to: email,
      subject: `Invitation to join ${process.env.APP_NAME || 'Sync & Share'} as ${roleDisplayName}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Invitation</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 30px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
            }
            .content { 
              padding: 30px; 
              background-color: #ffffff; 
              border: 1px solid #e5e7eb;
              border-top: none;
              border-radius: 0 0 10px 10px;
            }
            .button { 
              display: inline-block; 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 12px 30px; 
              text-decoration: none; 
              border-radius: 8px; 
              font-weight: bold; 
              margin: 20px 0; 
              font-size: 16px;
            }
            .footer { 
              text-align: center; 
              padding: 20px; 
              color: #6b7280; 
              font-size: 12px; 
              margin-top: 30px;
              border-top: 1px solid #e5e7eb;
            }
            .details { 
              background: #f9fafb; 
              padding: 20px; 
              border-radius: 8px; 
              border-left: 4px solid #667eea; 
              margin: 20px 0; 
            }
            .link-box {
              background: #f3f4f6;
              padding: 12px;
              border-radius: 6px;
              border: 1px dashed #d1d5db;
              margin: 15px 0;
              font-size: 12px;
              word-break: break-all;
            }
            .role-badge {
              display: inline-block;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 8px 16px;
              border-radius: 20px;
              font-size: 16px;
              font-weight: 600;
              margin: 10px 0;
              text-transform: capitalize;
            }
            .role-icon {
              display: inline-block;
              margin-right: 8px;
              font-size: 18px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 style="margin: 0; font-size: 28px;">You're Invited!</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Join ${displayCompanyName} on ${process.env.APP_NAME || 'Sync & Share'}</p>
          </div>
          <div class="content">
            <p>Hello <strong>${name}</strong>,</p>
            
            <p><strong>${displaySenderName}</strong> has invited you to join <strong>${displayCompanyName}</strong> on <strong>${process.env.APP_NAME || 'our Sync & Share platform'}</strong> with the following role:</p>
            
            <div style="text-align: center; margin: 25px 0;">
              <div class="role-badge">
                <span class="role-icon">${getRoleIcon(role)}</span>
                ${roleDisplayName}
              </div>
            </div>
            
            <div class="details">
              <p><strong>Invitation Details:</strong></p>
              <p>👤 <strong>Your Name:</strong> ${name}</p>
              <p>📧 <strong>Your Email:</strong> ${email}</p>
              <p>🏢 <strong>Company/Team:</strong> ${displayCompanyName}</p>
              <p>🎯 <strong>Assigned Role:</strong> ${roleDisplayName}</p>
              ${role ? `<p>📋 <strong>Role Description:</strong> ${roleDescription}</p>` : ''}
              ${role ? `<p>🔑 <strong>Key Permissions:</strong> ${getRolePermissions(role)}</p>` : ''}
              <p>🚀 <strong>Platform:</strong> ${process.env.APP_NAME || 'Sync & Share'}</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${invitationLink}" class="button" style="color: white;">Accept Invitation & Get Started</a>
            </div>
            
            <p>If the button doesn't work, copy and paste this link in your browser:</p>
            <div class="link-box">
              ${invitationLink}
            </div>
            
            <p><strong>⚠️ Important:</strong> This invitation will expire in 7 days.</p>
            
            <p>If you didn't expect this invitation or have any questions, please contact <strong>${displaySenderName}</strong> directly.</p>
            
            <p style="margin-top: 40px;">
              Best regards,<br>
              <strong>The ${process.env.APP_NAME || 'Sync & Share'} Team</strong>
            </p>
          </div>
          <div class="footer">
            <p>${process.env.APP_NAME || 'Sync & Share Platform'}</p>
            <p>© ${new Date().getFullYear()} ${process.env.APP_NAME || 'Sync & Share'}. All rights reserved.</p>
            <p>This is an automated message, please do not reply to this email.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        INVITATION TO JOIN ${process.env.APP_NAME || 'SYNC & SHARE'}
        
        Hello ${name},
        
        ${displaySenderName} has invited you to join ${displayCompanyName} on ${process.env.APP_NAME || 'our Sync & Share platform'} with the role: ${roleDisplayName}
        
        INVITATION DETAILS:
        👤 Your Name: ${name}
        📧 Your Email: ${email}
        🏢 Company/Team: ${displayCompanyName}
        🎯 Assigned Role: ${roleDisplayName}
        ${role ? `📋 Role Description: ${roleDescription}\n` : ''}
        ${role ? `🔑 Key Permissions: ${getRolePermissions(role)}\n` : ''}
        🚀 Platform: ${process.env.APP_NAME || 'Sync & Share'}
        
        TO ACCEPT THIS INVITATION:
        Click the link below or copy and paste it into your browser:
        
        ${invitationLink}
        
        IMPORTANT: This invitation will expire in 7 days.
        
        If you didn't expect this invitation or have any questions, please contact ${displaySenderName} directly.
        
        Best regards,
        The ${process.env.APP_NAME || 'Sync & Share'} Team
        
        © ${new Date().getFullYear()} ${process.env.APP_NAME || 'Sync & Share'}. All rights reserved.
        This is an automated message, please do not reply to this email.
      `
    };

    // Send email
    const mailResponse = await transporter.sendMail(mailOptions);
    // console.log(`✅ Invitation email resent to ${email} as ${roleDisplayName}, Message ID: ${mailResponse.messageId}`);

    // Log the invitation
    logInvitationResend(id, email, name, role, invitationToken);

    return NextResponse.json({ 
      status: "success", 
      message: `Invitation resent successfully to ${name} as ${roleDisplayName}!`,
      data: {
        emailSent: true,
        recipientEmail: email,
        recipientName: name,
        recipientRole: role,
        roleDisplayName: roleDisplayName,
        roleDescription: roleDescription,
        companyName: companyName,
        senderName: senderName,
        messageId: mailResponse.messageId,
        // Only include invitationLink in development for debugging
        ...(process.env.NODE_ENV === 'development' && { invitationLink })
      }
    });

  } catch (error) {
    console.error('❌ Failed to resend invitation:', error);
    
    return NextResponse.json({ 
      status: "error", 
      message: "Failed to resend invitation. Please try again later.",
      error: process.env.NODE_ENV === 'development' ? {
        message: error.message,
        stack: error.stack,
        code: error.code
      } : undefined
    }, { status: 500 });
  }
}

// Helper function to generate invitation token
function generateInvitationToken(identifier) {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const data = `${identifier}-${timestamp}-${randomString}-${process.env.INVITATION_SECRET || 'sync-share-secret'}`;
  
  // Use Buffer for base64 encoding
  return Buffer.from(data).toString('base64url');
}

// Helper function to validate role
function isValidRole(role) {
  return ROLES.includes(role);
}

// Helper function to get role icon
function getRoleIcon(role) {
  if (!role) return '👤';
  
  const iconMap = {
    'Secondary Admin': '👨‍💼',
    'Salesman': '👨‍💼',
    'Biller': '🧾',
    'Biller and Salesman': '👨‍💼🧾',
    'CA/Accountant': '📊',
    'Stock Keeper': '📦',
    'CA/Account (Edit Access)': '📊✏️',
  };
  
  return iconMap[role] || '👤';
}

// Helper function to get role description
function getRoleDescription(role) {
  if (!role) return 'Standard member with basic access to the platform.';
  
  const descriptionMap = {
    'Secondary Admin': 'Secondary administrator with most administrative privileges except primary system settings.',
    'Salesman': 'Responsible for managing sales, customer interactions, and generating sales reports.',
    'Biller': 'Handles billing, invoices, payment processing, and financial documentation.',
    'Biller and Salesman': 'Combined role with both billing and sales responsibilities.',
    'CA/Accountant': 'Chartered Accountant or Accountant role for financial management, auditing, and reporting.',
    'Stock Keeper': 'Manages inventory, stock levels, warehouse operations, and supply chain tracking.',
    'CA/Account (Edit Access)': 'Chartered Accountant with edit permissions for financial records and accounts.',
  };
  
  return descriptionMap[role] || 'Custom role with specific responsibilities and permissions.';
}

// Helper function to get role permissions
function getRolePermissions(role) {
  if (!role) return 'Basic viewing and limited editing capabilities';
  
  const permissionsMap = {
    'Secondary Admin': 'User management, content editing, settings configuration (except primary admin functions)',
    'Salesman': 'Customer management, sales order creation, quotation generation, sales analytics',
    'Biller': 'Invoice creation, payment processing, billing reports, tax calculations',
    'Biller and Salesman': 'Both billing and sales permissions including invoices, payments, and customer management',
    'CA/Accountant': 'Financial reporting, ledger access, audit trails, tax management, compliance monitoring',
    'Stock Keeper': 'Inventory management, stock adjustments, warehouse operations, supply tracking',
    'CA/Account (Edit Access)': 'Financial data editing, journal entries modification, account reconciliation, report generation',
  };
  
  return permissionsMap[role] || 'Custom permissions based on role requirements';
}

// Function to log invitation
function logInvitationResend(userId, email, name, role, token) {
  try {
    const logEntry = {
      userId: userId || 'N/A',
      email,
      name,
      role: role || 'Not specified',
      roleDisplayName: role || 'Member',
      roleDescription: getRoleDescription(role),
      timestamp: new Date().toISOString(),
      tokenHash: token ? token.substring(0, 10) + '...' : 'N/A',
      status: 'INVITATION_RESENT'
    };
    
    // console.log(`📝 Invitation logged:`, logEntry);
    
    // Optional: You can add additional logging mechanisms here:
    // - Save to a JSON file
    // - Send to external logging service
    // - Store in local database
    // - Send notification to admin
    
  } catch (error) {
    console.error('Failed to log invitation:', error);
  }
}

// Optional: Export the ROLES array if needed elsewhere
export { ROLES };