import dotenv from "dotenv";
import nodemailer from "nodemailer";
import https from "https";

dotenv.config();
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

export async function sendSMSNotification({ to, body }) {
    if (process.env.SPEEDSMS_ENABLE !== "true") {
        console.log("SpeedSMS is disabled.");
        return false;
    }

    return new Promise((resolve) => {
        try {
            const formattedTo = formatVietnamPhoneNumber(to).replace("+", ""); // SpeedSMS expects 84xxxx
            const ACCESS_TOKEN = process.env.SPEEDSMS_ACCESS_TOKEN;

            // If SPEEDSMS_SENDER is set, use it. Otherwise, leave empty string.
            const sender =
                typeof process.env.SPEEDSMS_SENDER === "string"
                    ? process.env.SPEEDSMS_SENDER
                    : "";

            const params = JSON.stringify({
                to: [formattedTo],
                content: body,
                sms_type: 2, // 2 = brandname, 3 = OTP, 1 = ad, 4 = notify. Use 2 or 4 for normal notify.
                sender: sender // use env var or empty string
            });

            const buf = Buffer.from(ACCESS_TOKEN + ':x');
            const auth = "Basic " + buf.toString('base64');
            const options = {
                hostname: 'api.speedsms.vn',
                port: 443,
                path: '/index.php/sms/send',
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth
                }
            };

            const req = https.request(options, function (res) {
                res.setEncoding('utf8');
                let bodyData = '';
                res.on('data', function (d) {
                    bodyData += d;
                });
                res.on('end', function () {
                    try {
                        const json = JSON.parse(bodyData);
                        if (json.status === 'success') {
                            console.log("✅ SMS sent:", json);
                            resolve(true);
                        } else {
                            // Special handling for "sender not found" error
                            if (
                                json.status === 'error' &&
                                typeof json.message === 'string' &&
                                json.message.toLowerCase().includes('sender not found')
                            ) {
                                console.error(`❌ SMS failed: sender not found. Please check your SPEEDSMS_SENDER environment variable or register your brandname sender with SpeedSMS.`);
                            } else if (json.status === 'error' && json.code && json.message) {
                                console.error(`❌ SMS failed: [${json.code}] ${json.message}`);
                            } else {
                                console.error("❌ SMS failed:", bodyData);
                            }
                            resolve(false);
                        }
                    } catch (e) {
                        console.error("❌ SMS response parse error:", e, bodyData);
                        resolve(false);
                    }
                });
            });

            req.on('error', function (e) {
                console.error("send sms failed:", e);
                resolve(false);
            });

            req.write(params);
            req.end();
        } catch (err) {
            console.error("SpeedSMS error:", err.message);
            resolve(false);
        }
    });
}