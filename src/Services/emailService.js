import { userAPI } from "../Api/api";

/**
 * Sends email notifications to all users with specified roles
 * @param {Object} params - Configuration object
 * @param {string[]} params.recipientRoles - Array of role names to notify
 * @param {string} params.subject - Email subject
 * @param {string} params.messageBody - Message body for the email
 * @param {string} params.patientName - Name of the patient (for personalization)
 * @returns {Promise<{success: boolean, message: string, sentCount?: number}>}
 *
 */

const SERVICE_ID = "service_5s6i8dt";
const TEMPLATE_ID = "template_5szgn4w";
const USER_ID = "8Ug4IEpPnV-R1K_N4";

export const sendEmailNotification = async ({
  recipientRoles,
  subject,
  messageBody,
  patientName = "New Patient",
}) => {
  try {
    const response = await userAPI.getUserList(-1);
    if (!response.data?.success) {
      throw new Error("Failed to fetch recipient list");
    }

    const recipients = response.data.data.filter(
      (user) => recipientRoles.includes(user.RoleName) && user.Email
    );

    if (recipients.length === 0) {
      console.warn("No recipients found for roles:", recipientRoles);
      return { success: false, message: "No recipients found" };
    }

    const emailPromises = recipients.map((user) =>
      sendSingleEmail({
        to: user.Email,
        subject,
        templateParams: {
          to_name: user.UserName,
          from_name: "MedSKLS System",
          message: messageBody,
          patient_name: patientName,
          to_email: user.Email, // <-- MUST pass recipient email here dynamically!
        },
      })
    );

    const results = await Promise.allSettled(emailPromises);
    const successfulSends = results.filter(
      (r) => r.status === "fulfilled" && r.value.success
    );

    return {
      success: successfulSends.length > 0,
      message: `Sent ${successfulSends.length}/${recipients.length} emails`,
      sentCount: successfulSends.length,
    };
  } catch (error) {
    console.error("Email notification error:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Email content template for new patient submission
 * @param {string} patientName
 * @returns {{ subject: string, messageBody: string }}
 */
export const newPatientSubmissionTemplate = (patientName) => ({
  subject: `New Patient Submission: ${patientName}`,
  messageBody: `A new patient, ${patientName}, has completed their onboarding survey. Please review their information in the admin dashboard.`,
});

// ==============================================
// PRIVATE HELPER FUNCTIONS
// ==============================================

/**
 * Sends a single email using EmailJS with dynamic template variables
 * @private
 */
const sendSingleEmail = async ({ to, subject, templateParams }) => {
  return sendWithEmailJS(to, subject, templateParams);
};

/**
 * Implementation using EmailJS
 * @private
 */
const sendWithEmailJS = async (to, subject, templateParams) => {
  try {
    const emailjs = (await import("emailjs-com")).default;

    // Pass templateParams with to_email set inside it, so EmailJS knows recipient
    await emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams, USER_ID);

    return { success: true };
  } catch (error) {
    console.error(`EmailJS error for ${to}:`, error);
    return { success: false, error: error.text || error.message };
  }
};
