/** Email sending utility — plug in SendGrid, AWS SES, or any provider */
export const sendVerificationEmail = async (to, code) => {
    // In production, use SendGrid / AWS SES / Resend:
    //
    // import sgMail from '@sendgrid/mail';
    // sgMail.setApiKey(process.env.SENDGRID_API_KEY!);
    // await sgMail.send({
    //   to,
    //   from: 'noreply@yourdomain.com',
    //   subject: 'Your verification code',
    //   html: `<p>Your verification code is: <strong>${code}</strong></p>
    //          <p>This code expires in 30 minutes.</p>`,
    // });
    // For development — log to console
    console.log(`\n========================================`);
    console.log(`  VERIFICATION EMAIL`);
    console.log(`  To:   ${to}`);
    console.log(`  Code: ${code}`);
    console.log(`========================================\n`);
};
