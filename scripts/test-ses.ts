import 'dotenv/config'; // Loads variables from .env
import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

// 1. Setup the Client
const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

// 2. Define the Function (Your logic)
async function sendReminderEmail(
    toAddress: string,
    userName: string,
    subscriptionName: string,
    renewalDate: string,
    price: string
) {
    const fromAddress = process.env.AWS_SES_FROM_EMAIL;

    if (!fromAddress) {
        console.error("❌ Error: AWS_SES_FROM_EMAIL is missing in .env");
        return;
    }

    const params = {
        Source: fromAddress,
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Subject: {
                Data: `TEST: Renewal Reminder for ${subscriptionName}`,
            },
            Body: {
                Text: {
                    Data: `Hi ${userName},\n\nThis is a test email for your subscription: ${subscriptionName}.\nCost: ${price}\n\nBest,\nRemindMe App`,
                },
                Html: {
                    Data: `<p>Hi ${userName},</p>
                 <p>This is a <strong>TEST</strong> email for your subscription: <strong>${subscriptionName}</strong>.</p>
                 <p>It is set to renew on <strong>${renewalDate}</strong>.</p>
                 <p>The cost is <strong>${price}</strong>.</p>
                 <p>Best,<br>RemindMe App</p>`,
                },
            },
        },
    };

    try {
        console.log(`Attempting to send email to ${toAddress}...`);
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
        console.log(`✅ Success! Email sent to ${toAddress}`);
        return true;
    } catch (error: any) {
        console.error("❌ Error sending email:", error.message);

        // Helpful debugging for common errors
        if (error.name === 'MessageRejected') {
            console.error("\n💡 TIP: You are likely in the SES Sandbox. You must verify the 'To' address in the AWS Console, just like you verified the sender.");
        }
        return false;
    }
}

// 3. Run the Test
(async () => {
    // We send TO the same email we send FROM to ensure it works in the SES Sandbox
    const testEmail = "wzsamuels@gmail.com";

    if (!testEmail) {
        console.error("❌ Setup incomplete: Add AWS_SES_FROM_EMAIL to your .env file.");
        process.exit(1);
    }

    await sendReminderEmail(
        testEmail,           // Sending to self for safety
        "Test User",
        "Netflix",
        "2025-12-01",
        "$15.99"
    );
})();