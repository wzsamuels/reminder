import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";

const sesClient = new SESClient({
    region: process.env.AWS_REGION || "us-east-1",
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
});

export async function sendReminderEmail(
    toAddress: string,
    userName: string,
    subscriptionName: string,
    renewalDate: string,
    price: string
) {
    const params = {
        Source: process.env.AWS_SES_FROM_EMAIL || "noreply@example.com",
        Destination: {
            ToAddresses: [toAddress],
        },
        Message: {
            Subject: {
                Data: `Renewal Reminder: ${subscriptionName}`,
            },
            Body: {
                Text: {
                    Data: `Hi ${userName},\n\nThis is a reminder that your subscription for ${subscriptionName} is set to renew on ${renewalDate}. The cost is ${price}.\n\nIf you wish to cancel, please do so before the renewal date.\n\nBest,\nRemindMe App`,
                },
                Html: {
                    Data: `<p>Hi ${userName},</p>
                 <p>This is a reminder that your subscription for <strong>${subscriptionName}</strong> is set to renew on <strong>${renewalDate}</strong>.</p>
                 <p>The cost is <strong>${price}</strong>.</p>
                 <p>If you wish to cancel, please do so before the renewal date.</p>
                 <p>Best,<br>RemindMe App</p>`,
                },
            },
        },
    };

    try {
        const command = new SendEmailCommand(params);
        await sesClient.send(command);
        console.log(`Email sent to ${toAddress} for ${subscriptionName}`);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}
