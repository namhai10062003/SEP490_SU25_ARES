import nodemailer from "nodemailer";
import twilio from "twilio";

function formatVietnamPhoneNumber(number) {
    if (!number) return number;
    const cleaned = number.replace(/[\s-]/g, '');
    if (cleaned.startsWith('+84')) return cleaned;
    if (/^0\d{9}$/.test(cleaned)) {
        return '+84' + cleaned.slice(1);
    }
    throw new Error(`Invalid phone number format: ${number}`);
}

// Nodemailer setup (use Gmail for free, or any SMTP)
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: process.env.EMAIL_USER, // your Gmail address
        pass: process.env.EMAIL_PASS, // app password or Gmail password
    },
});

export async function sendEmailNotification({ to, subject, text, html }) {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html,
        });
        return true;
    } catch (err) {
        console.error("Nodemailer error:", err.message);
        return false;
    }
}

// Twilio setup
const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

export async function sendSMSNotification({ to, body }) {
    try {
        const formattedTo = formatVietnamPhoneNumber(to);
        console.log("Sending SMS to:", formattedTo);
        await twilioClient.messages.create({
            body,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: formattedTo,
        });

        return true;
    } catch (err) {
        console.error("Twilio error:", err.message);
        return false;
    }
}