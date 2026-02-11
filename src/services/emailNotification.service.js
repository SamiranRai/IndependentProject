const Mailgun = require("mailgun.js");
const FormData = require("form-data");
const ProjectModel = require("../models/project.model");
const { normalizePayload } = require("../utils/normalizePayload");
const { env } = require("../config/env");

const mailgun = new Mailgun(FormData);
const mg = mailgun.client({
  username: "api",
  key: env.MAILGUN_API_KEY,
});

exports.sendEmailNotificationService = async (message) => {
  const normalized = normalizePayload(message);
  const project = await ProjectModel.findById(message.projectId);
  const destinationEmail =
    project.output?.type === "email"
      ? project.output?.config?.email ?? null
      : null;

  if (!destinationEmail) {
    throw new Error("No destination email found");
  }

  const html = buildEmailHTML(normalized);

  try {
    const response = await mg.messages.create(env.MAILGUN_DOMAIN, {
      from: env.MAILGUN_FROM,
      to: destinationEmail,
      subject: "New form submission received",
      html,
    });

    return response;
  } catch (err) {
    throw new Error(`Mailgun send failed: ${err.message}`);
  }
};

function buildEmailHTML({ fields, meta }) {
  const rows = Object.entries(fields)
    .map(
      ([key, value]) =>
        `<tr>
          <td><strong>${key}</strong></td>
          <td>${typeof value === "object" ? JSON.stringify(value) : value}</td>
        </tr>`
    )
    .join("");

  return `
    <h2>New Form Submission</h2>

    <table border="1" cellpadding="8" cellspacing="0">
      ${rows}
    </table>

    <p><strong>Source:</strong> ${meta.provider}</p>
    ${meta.pageUrl ? `<p><a href="${meta.pageUrl}">View page</a></p>` : ""}
  `;
}
