const path = require("node:path");
const fs = require("node:fs");
const nodemailer = require("nodemailer");
const env = require("../config/env");
const ApiError = require("./apiError");

let transporter;
const APP_NAME = env.appName || "Grupo w logist";
const LOGO_CID = "grupo-w-logist-logo";
const VEHICLE_PHOTO_CID = "vehicle-photo";

function getTransporter() {
  const { host, port, secure, user, password } = env.smtp;

  if (!host || !user || !password) {
    throw new ApiError(503, "El envio de correos no esta configurado");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: {
        user,
        pass: password,
      },
    });
  }

  return transporter;
}

function buildVerificationEmailHtml(code) {
  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verificacion de correo</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; color: #201b17;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0; padding: 0; background-color: #ffffff;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 520px; margin: 0 auto;">
                <tr>
                  <td align="center" style="padding: 0 0 18px;">
                    <img src="cid:${LOGO_CID}" width="54" height="54" alt="${APP_NAME}" style="display: block; width: 54px; height: 54px; border: 0; outline: none; text-decoration: none; border-radius: 14px;" />
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 34px 28px; box-shadow: 0 12px 28px rgba(34, 28, 20, 0.08);">
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                      <tr>
                        <td align="center" style="padding: 0;">
                          <h1 style="margin: 0; color: #201b17; font-size: 24px; line-height: 1.25; font-weight: 700;">
                            Verificacion de correo
                          </h1>
                          <p style="margin: 14px 0 0; color: #6f6255; font-size: 15px; line-height: 1.6;">
                            Usa este codigo para verificar tu cuenta y activar tu correo en ${APP_NAME}.
                          </p>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding: 28px 0 24px;">
                          <div style="display: inline-block; min-width: 188px; padding: 18px 26px; border-radius: 12px; border: 1px solid #e5e7eb; background-color: #f8fafc; color: #8f6336; font-size: 36px; line-height: 1; font-weight: 700; letter-spacing: 10px; text-align: center;">
                            ${code}
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <td align="center" style="padding: 0;">
                          <p style="margin: 0; color: #201b17; font-size: 14px; line-height: 1.6;">
                            Este codigo expira en <strong style="color: #b4864b;">30 minutos</strong>.
                          </p>
                          <p style="margin: 8px 0 0; color: #6f6255; font-size: 13px; line-height: 1.6;">
                            Despues de 60 segundos puedes solicitar un nuevo codigo si lo necesitas.
                          </p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 18px 0 0;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      ${APP_NAME}
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
}

function formatEmailDate(value) {
  return new Date(value).toLocaleDateString("es-CO", {
    dateStyle: "long",
    timeZone: "UTC",
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function buildComplianceAlertEmailHtml(alert) {
  const statusColor = alert.status === "Vencido" ? "#b85c4d" : "#3f7d58";
  const vehicleLabel = escapeHtml(alert.vehicleLabel);
  const documentLabel = escapeHtml(alert.documentLabel);
  const title = escapeHtml(alert.title);
  const status = escapeHtml(alert.status);
  const imageMarkup = alert.hasPhoto
    ? `<img src="cid:${VEHICLE_PHOTO_CID}" width="100%" alt="${vehicleLabel}" style="display: block; width: 100%; max-height: 220px; object-fit: cover; border: 0; border-radius: 12px;" />`
    : `<div style="height: 150px; border-radius: 12px; background-color: #f8fafc; border: 1px solid #e5e7eb; color: #6f6255; font-size: 14px; line-height: 150px; text-align: center;">Sin foto registrada</div>`;

  return `
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Alerta de vencimiento</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #ffffff; font-family: Arial, Helvetica, sans-serif; color: #201b17;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; margin: 0; padding: 0; background-color: #ffffff;">
          <tr>
            <td align="center" style="padding: 32px 16px;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="width: 100%; max-width: 560px; margin: 0 auto;">
                <tr>
                  <td align="center" style="padding: 0 0 18px;">
                    <img src="cid:${LOGO_CID}" width="54" height="54" alt="${APP_NAME}" style="display: block; width: 54px; height: 54px; border: 0; outline: none; text-decoration: none; border-radius: 14px;" />
                  </td>
                </tr>
                <tr>
                  <td style="background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 14px; padding: 28px; box-shadow: 0 12px 28px rgba(34, 28, 20, 0.08);">
                    ${imageMarkup}
                    <h1 style="margin: 24px 0 0; color: #201b17; font-size: 24px; line-height: 1.25; font-weight: 700;">
                      ${title}
                    </h1>
                    <p style="margin: 12px 0 0; color: #6f6255; font-size: 15px; line-height: 1.6;">
                      Detectamos una novedad en los documentos de tu vehiculo.
                    </p>
                    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin: 24px 0 0; border: 1px solid #e5e7eb; border-radius: 12px; background-color: #f8fafc;">
                      <tr>
                        <td style="padding: 16px 18px; border-bottom: 1px solid #e5e7eb;">
                          <span style="display: block; color: #9ca3af; font-size: 12px;">Vehiculo</span>
                          <strong style="display: block; margin-top: 4px; color: #1f2937; font-size: 15px;">${vehicleLabel}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 18px; border-bottom: 1px solid #e5e7eb;">
                          <span style="display: block; color: #9ca3af; font-size: 12px;">Documento</span>
                          <strong style="display: block; margin-top: 4px; color: #1f2937; font-size: 15px;">${documentLabel}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 18px; border-bottom: 1px solid #e5e7eb;">
                          <span style="display: block; color: #9ca3af; font-size: 12px;">Fecha de vencimiento</span>
                          <strong style="display: block; margin-top: 4px; color: #1f2937; font-size: 15px;">${formatEmailDate(alert.expiryDate)}</strong>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding: 16px 18px;">
                          <span style="display: block; color: #9ca3af; font-size: 12px;">Estado actual</span>
                          <strong style="display: inline-block; margin-top: 8px; padding: 7px 10px; border-radius: 999px; color: ${statusColor}; background-color: ${alert.status === "Vencido" ? "rgba(184, 92, 77, 0.10)" : "rgba(63, 125, 88, 0.12)"}; font-size: 13px;">
                            ${status}
                          </strong>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding: 18px 0 0;">
                    <p style="margin: 0; color: #9ca3af; font-size: 12px; line-height: 1.5;">
                      ${APP_NAME}
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
}

function buildBaseAttachments() {
  return [
    {
      filename: "iconGrupoW.png",
      path: path.resolve(__dirname, "../../public/media/iconGrupoW.png"),
      cid: LOGO_CID,
    },
  ];
}

async function sendVerificationCode(to, code) {
  const mailer = getTransporter();
  const fromAddress = env.smtp.from || env.smtp.user;

  await mailer.sendMail({
    from: `"${APP_NAME}" <${fromAddress}>`,
    to,
    subject: `Codigo de verificacion - ${APP_NAME}`,
    text: `Verificacion de correo. Usa este codigo para verificar tu cuenta: ${code}. Expira en 30 minutos. Despues de 60 segundos puedes solicitar un nuevo codigo.`,
    html: buildVerificationEmailHtml(code),
    attachments: buildBaseAttachments(),
  });
}

async function sendComplianceAlert(to, alert) {
  const mailer = getTransporter();
  const fromAddress = env.smtp.from || env.smtp.user;
  const attachments = buildBaseAttachments();
  const photoPath = alert.photoUrl ? path.resolve(__dirname, "../..", alert.photoUrl.replace(/^\//, "")) : "";
  const hasPhoto = Boolean(photoPath && fs.existsSync(photoPath));

  if (hasPhoto) {
    attachments.push({
      filename: path.basename(photoPath),
      path: photoPath,
      cid: VEHICLE_PHOTO_CID,
    });
  }

  const payload = {
    ...alert,
    hasPhoto,
  };

  await mailer.sendMail({
    from: `"${APP_NAME}" <${fromAddress}>`,
    to,
    subject: `${alert.documentLabel} ${alert.status.toLowerCase()} - ${alert.plate}`,
    text: `${alert.title}. Vehiculo: ${alert.vehicleLabel}. Documento: ${alert.documentLabel}. Fecha de vencimiento: ${formatEmailDate(alert.expiryDate)}. Estado: ${alert.status}.`,
    html: buildComplianceAlertEmailHtml(payload),
    attachments,
  });
}

module.exports = {
  sendVerificationCode,
  sendComplianceAlert,
};
