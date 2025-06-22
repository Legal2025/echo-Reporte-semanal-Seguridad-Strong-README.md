// Script principal para Railway – Reportes PDF semanales
import nodemailer from 'nodemailer';
import cron from 'node-cron';
import { jsPDF } from 'jspdf';
import fs from 'fs';

// Configuración desde variables de entorno
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.USER_EMAIL,
    pass: process.env.USER_PASS
  }
});

function generarPDF(nombre, contenido) {
  const doc = new jsPDF();
  doc.setFontSize(12);
  doc.text(`REPORTE: ${nombre}`, 10, 10);
  const lineas = contenido.split('\n');
  lineas.forEach((linea, i) => doc.text(linea, 10, 20 + i * 7));
  return doc.output('arraybuffer');
}

function obtenerDatos() {
  // Datos simulados; en producción conectarse a base o fuente real
  const historial = 'Supervisor: Juan Pérez\n2025-06-17 - Cliente A\n2025-06-18 - Cliente B';
  const noVisitados = 'Cliente X – Última visita: 2025-06-15\nCliente Y – Última visita: 2025-06-12';
  return { historial, noVisitados };
}

async function enviarCorreo() {
  const { historial, noVisitados } = obtenerDatos();

  const pdf1 = generarPDF('Historial semanal', historial);
  const pdf2 = generarPDF('Clientes no visitados', noVisitados);

  const mailOptions = {
    from: process.env.USER_EMAIL,
    to: 'controlseguridadstrong@gmail.com',
    subject: 'Reporte semanal Seguridad Strong',
    text: 'Adjuntamos historial y reporte de clientes no visitados.',
    attachments: [
      { filename: 'Historial_Semanal.pdf', content: pdf1 },
      { filename: 'Clientes_No_Visitados.pdf', content: pdf2 }
    ]
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Correo enviado correctamente');
  } catch (err) {
    console.error('❌ Error al enviar correo:', err);
  }
}

// Ejecutar manualmente o por cron
const ejecutarAhora = process.argv.includes('--run');
if (ejecutarAhora) enviarCorreo();

// Cron cada viernes 8am UTC
cron.schedule('0 8 * * 5', () => {
  console.log('⏰ Ejecutando cron semanal...');
  enviarCorreo();
});
