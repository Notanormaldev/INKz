import { BrevoClient } from "@getbrevo/brevo";

const brevo = new BrevoClient({
    apiKey: process.env.BREVO_API_KEY,
});

/**
 * Sends an email using Brevo API.
 * 
 * @param {Object} options
 * @param {string|Array<string|{email: string, name?: string}>} options.to - Recipient email address or array of recipient objects/emails
 * @param {string} options.subject - Email subject
 * @param {string} [options.htmlContent] - Email HTML body
 * @param {string} [options.textContent] - Email plain text body
 * @param {{email: string, name?: string}} [options.sender] - Custom sender details. Defaults to EMAIL_USER.
 * @param {Object} [options.params] - Dynamic parameters for email template
 * @returns {Promise<any>} Response from Brevo API
 */
export const sendEmail = async ({ to, subject, htmlContent, textContent, sender, params }) => {
    try {
        const recipients = typeof to === 'string'
            ? [{ email: to }]
            : Array.isArray(to)
                ? to.map(item => (typeof item === 'string' ? { email: item } : item))
                : [to];

        const emailSender = sender || {
            email: process.env.EMAIL_USER,
            name: "INKz"
        };

        const response = await brevo.transactionalEmails.sendTransacEmail({
            to: recipients,
            subject,
            ...(htmlContent && { htmlContent }),
            ...(textContent && { textContent }),
            ...(params && { params }),
            sender: emailSender,
        });

        return response;
    } catch (error) {
        console.error("Failed to send email via Brevo:", error);
        throw error;
    }
};

export default sendEmail;
