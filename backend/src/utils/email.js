import nodemailer from 'nodemailer';

// Configure email transporter
let transporter = null;
let emailConfigured = false;

try {
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });
    
    // Verify connection
    transporter.verify((error, success) => {
      if (error) {
        console.error('❌ Email configuration error:', error);
        emailConfigured = false;
      } else {
        console.log('✅ Email service configured successfully');
        emailConfigured = true;
      }
    });
  } else {
    console.log('⚠️ Email credentials not found. Email notifications disabled.');
  }
} catch (error) {
  console.error('❌ Email service setup error:', error.message);
}

export const sendEmail = async (to, subject, html) => {
  if (!transporter || !emailConfigured) {
    console.log('📧 Email not sent - service not configured');
    return { message: 'Email service not configured', sent: false };
  }
  
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    };
    
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Email sent successfully to:', to);
    console.log('📧 Message ID:', info.messageId);
    return { sent: true, info };
  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    return { sent: false, error: error.message };
  }
};

// ============================================
// DOCTOR APPROVAL EMAIL - Premium Version
// ============================================
export const sendDoctorApprovalEmail = async (doctorEmail, doctorName) => {
  console.log(`📧 Preparing approval email for ${doctorEmail}...`);
  
  const subject = '🎉 Your MediCareHub Doctor Account Has Been Approved!';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Account Approved</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc;">
      <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <tr>
          <td style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); padding: 40px 35px; border: 1px solid #e8edf2;">
            
            <!-- Header -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #059669, #0d9488); padding: 12px 30px; border-radius: 12px;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">MediCareHub</span>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Greeting -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom: 10px;">
                  <h2 style="color: #0f172a; font-size: 24px; font-weight: 600; margin: 0;">Hello Dr. ${doctorName},</h2>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px;">
                  <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0;">
                    We are pleased to inform you that your account has been <strong style="color: #059669;">approved</strong> by our admin team. 
                    Welcome to the MediCareHub community! 🎉
                  </p>
                </td>
              </tr>
            </table>

            <!-- What You Can Do -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #f0fdf4; border-radius: 12px; margin: 20px 0 25px 0;">
              <tr>
                <td style="padding: 20px 24px;">
                  <p style="color: #065f46; font-size: 15px; font-weight: 600; margin: 0 0 10px 0;">✅ You can now:</p>
                  <ul style="color: #065f46; font-size: 14px; line-height: 2; margin: 0; padding-left: 20px;">
                    <li>Log in to your doctor dashboard</li>
                    <li>Manage your availability and schedule</li>
                    <li>Accept and confirm patient appointments</li>
                    <li>Write prescriptions and request lab tests</li>
                    <li>Access patient medical records</li>
                  </ul>
                </td>
              </tr>
            </table>

            <!-- CTA Button -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding: 15px 0 25px 0;">
                  <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/login" style="display: inline-block; background: linear-gradient(135deg, #059669, #0d9488); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);">
                    🚀 Log In Now
                  </a>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top: 1px solid #e8edf2; padding: 20px 0 5px 0;"></td>
              </tr>
            </table>

            <!-- Spam/Whitelist Note -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fefce8; border-radius: 10px; border-left: 4px solid #eab308; margin: 10px 0 20px 0;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="color: #854d0e; font-size: 14px; line-height: 1.6; margin: 0;">
                    <strong>📌 Important:</strong> To ensure you receive future notifications, please 
                    <strong>add <span style="color: #059669;">${process.env.EMAIL_USER || 'tsstreet@gmail.com'}</span> to your address book</strong> 
                    or <strong>check your spam folder</strong> if you don't see this email in your inbox.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-top: 20px; text-align: center;">
                  <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
                    If you have any questions, please contact our support team at 
                    <a href="mailto:support@medicarehub.com" style="color: #059669; text-decoration: none; font-weight: 500;">support@medicarehub.com</a>
                  </p>
                  <p style="color: #cbd5e1; font-size: 12px; margin: 15px 0 0 0;">
                    &copy; 2026 MediCareHub. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const result = await sendEmail(doctorEmail, subject, html);
  if (result.sent) {
    console.log(`✅ Approval email sent to ${doctorEmail}`);
  } else {
    console.log(`❌ Failed to send approval email to ${doctorEmail}:`, result.error);
  }
  return result;
};

// ============================================
// DOCTOR REJECTION EMAIL - With Rejection Reason
// ============================================
export const sendDoctorRejectionEmail = async (doctorEmail, doctorName, rejectionReason) => {
  console.log(`📧 Preparing rejection email for ${doctorEmail}...`);
  
  const subject = '📋 Update on Your MediCareHub Doctor Application';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Application Update</title>
    </head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f6f9fc;">
      <table align="center" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; padding: 20px;">
        <tr>
          <td style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); padding: 40px 35px; border: 1px solid #e8edf2;">
            
            <!-- Header -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td align="center" style="padding-bottom: 30px;">
                  <div style="display: inline-block; background: linear-gradient(135deg, #059669, #0d9488); padding: 12px 30px; border-radius: 12px;">
                    <span style="color: #ffffff; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">MediCareHub</span>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Greeting -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom: 10px;">
                  <h2 style="color: #0f172a; font-size: 24px; font-weight: 600; margin: 0;">Hello Dr. ${doctorName},</h2>
                </td>
              </tr>
              <tr>
                <td style="padding-bottom: 20px;">
                  <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0;">
                    Thank you for your interest in joining MediCareHub.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Decision with Rejection Reason -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fef2f2; border-radius: 12px; margin: 15px 0 20px 0;">
              <tr>
                <td style="padding: 20px 24px;">
                  <p style="color: #991b1b; font-size: 15px; line-height: 1.7; margin: 0;">
                    After careful review, we are unable to approve your application at this time.
                  </p>
                  ${rejectionReason ? `
                    <div style="margin-top: 12px; padding: 12px 16px; background: #fee2e2; border-radius: 8px;">
                      <p style="color: #991b1b; font-size: 14px; margin: 0;">
                        <strong>📋 Reason for rejection:</strong> ${rejectionReason}
                      </p>
                    </div>
                  ` : ''}
                </td>
              </tr>
            </table>

            <!-- Next Steps -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-bottom: 15px;">
                  <p style="color: #475569; font-size: 16px; line-height: 1.7; margin: 0;">
                    If you believe this is a mistake or would like to appeal this decision, please contact our support team with your credentials and any additional documentation.
                  </p>
                </td>
              </tr>
              <tr>
                <td align="center" style="padding: 15px 0 25px 0;">
                  <a href="mailto:support@medicarehub.com" style="display: inline-block; background: linear-gradient(135deg, #3b82f6, #6366f1); color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 40px; border-radius: 10px; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);">
                    📧 Contact Support
                  </a>
                </td>
              </tr>
            </table>

            <!-- Divider -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="border-top: 1px solid #e8edf2; padding: 20px 0 5px 0;"></td>
              </tr>
            </table>

            <!-- Spam/Whitelist Note -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background: #fefce8; border-radius: 10px; border-left: 4px solid #eab308; margin: 10px 0 20px 0;">
              <tr>
                <td style="padding: 16px 20px;">
                  <p style="color: #854d0e; font-size: 14px; line-height: 1.6; margin: 0;">
                    <strong>📌 Important:</strong> To ensure you receive future communications, please 
                    <strong>add <span style="color: #059669;">${process.env.EMAIL_USER || 'tsstreet@gmail.com'}</span> to your address book</strong> 
                    or <strong>check your spam folder</strong> if you don't see this email in your inbox.
                  </p>
                </td>
              </tr>
            </table>

            <!-- Footer -->
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td style="padding-top: 20px; text-align: center;">
                  <p style="color: #94a3b8; font-size: 13px; line-height: 1.6; margin: 0;">
                    If you have any questions, please contact our support team at 
                    <a href="mailto:support@medicarehub.com" style="color: #059669; text-decoration: none; font-weight: 500;">support@medicarehub.com</a>
                  </p>
                  <p style="color: #cbd5e1; font-size: 12px; margin: 15px 0 0 0;">
                    &copy; 2026 MediCareHub. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>

          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
  
  const result = await sendEmail(doctorEmail, subject, html);
  if (result.sent) {
    console.log(`✅ Rejection email sent to ${doctorEmail} with reason`);
  } else {
    console.log(`❌ Failed to send rejection email to ${doctorEmail}:`, result.error);
  }
  return result;
};