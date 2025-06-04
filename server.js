// ================================
// DIAGNOSTIC INITIAL - Première chose à afficher
// Ces logs nous permettent de comprendre l'environnement d'exécution
// ================================

console.log('=== DÉBUT DU SCRIPT SERVER.JS ===');
console.log('📅 Heure de démarrage:', new Date().toISOString());
console.log('🖥️  Version Node.js:', process.version);
console.log('🌍 Plateforme:', process.platform);
console.log('📂 Répertoire de travail:', process.cwd());

// Vérification des variables d'environnement critiques
// Ces variables sont essentielles pour le bon fonctionnement
console.log('\n=== VÉRIFICATION DES VARIABLES D\'ENVIRONNEMENT ===');
console.log('PORT:', process.env.PORT || 'Non défini (utilisation du port 3000 par défaut)');
console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'DÉFINI ✓' : 'NON DÉFINI ⚠️');
console.log('EMAIL_PASSWORD:', process.env.EMAIL_PASSWORD ? 'DÉFINI ✓' : 'NON DÉFINI ⚠️');
console.log('SMTP_HOST:', process.env.SMTP_HOST || 'Non défini (utilisation de mail.albaarchivio.com par défaut)');
console.log('SMTP_PORT:', process.env.SMTP_PORT || 'Non défini (utilisation du port 587 par défaut)');

// ================================
// IMPORTATION DES MODULES
// Chaque import est loggé pour identifier les problèmes potentiels
// ================================

console.log('\n=== CHARGEMENT DES MODULES ===');

let express, nodemailer, cors;

try {
    // Express - Le framework web principal
    express = require('express');
    console.log('✓ Express chargé avec succès');
    
    // Nodemailer - Pour l'envoi d'emails
    nodemailer = require('nodemailer');
    console.log('✓ Nodemailer chargé avec succès');
    
    // CORS - Pour gérer les permissions cross-origin
    cors = require('cors');
    console.log('✓ CORS chargé avec succès');
    
    // Dotenv - Pour charger les variables d'environnement depuis le fichier .env
    require('dotenv').config();
    console.log('✓ Dotenv configuré avec succès');
    
    console.log('🎉 Tous les modules chargés sans erreur !');
    
} catch (error) {
    // Si l'un des modules ne peut pas être chargé, c'est fatal
    console.error('\n❌ ERREUR FATALE lors du chargement des modules:');
    console.error('Message:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('\n💡 Solution possible: Vérifiez que toutes les dépendances sont installées avec "npm install"');
    process.exit(1); // Arrêter complètement l'application
}

// ================================
// CRÉATION ET CONFIGURATION DE L'APPLICATION EXPRESS
// Cette section configure le serveur web principal
// ================================

console.log('\n=== CONFIGURATION DU SERVEUR EXPRESS ===');

try {
    // Créer l'instance principale de l'application
    const app = express();
    const PORT = process.env.PORT || 3000;
    
    console.log('✓ Application Express créée');
    console.log('📍 Port configuré:', PORT);
    
    // Middleware pour parser le JSON dans les requêtes
    // Ceci permet de recevoir des données JSON dans req.body
    app.use(express.json());
    console.log('✓ Middleware JSON configuré');
    
    // Configuration CORS pour autoriser les requêtes depuis votre frontend
    // Ceci résout les problèmes de sécurité cross-origin
    app.use(cors({
        origin: 'https://twest-twinger.onrender.com',
        methods: ['GET', 'POST', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        preflightContinue: false,
        optionsSuccessStatus: 200
    }));
    console.log('✓ Middleware CORS configuré pour:', 'https://twest-twinger.onrender.com');

    
    
    
    // Servir les fichiers statiques (HTML, CSS, JS, images)
    // Ceci permet à votre serveur de servir vos pages web
    app.use(express.static('./'));
    console.log('✓ Fichiers statiques configurés depuis la racine du projet');
    
    // ================================
    // CONFIGURATION DU TRANSPORTEUR EMAIL
    // Cette section configure l'envoi d'emails via SMTP
    // ================================
    
    console.log('\n=== CONFIGURATION EMAIL ===');
    
    let transporter;
    try {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'mail.albaarchivio.com',
            port: parseInt(process.env.SMTP_PORT) || 587,
            secure: true, // IMPORTANT: false pour le port 587 (utilise STARTTLS)
            auth: {
                user: process.env.EMAIL_USER || 'noreply@albaarchivio.com',
                pass: process.env.EMAIL_PASSWORD
            },
            requireTLS: true, // Force l'utilisation de TLS
            tls: {
                ciphers: 'SSLv3', // Compatibilité avec différents serveurs
                rejectUnauthorized: false // Permet les certificats auto-signés si nécessaire
            }
        });
        
        console.log('✓ Transporteur email créé');
        console.log('📧 Host SMTP:', process.env.SMTP_HOST || 'mail.albaarchivio.com');
        console.log('🔌 Port SMTP:', parseInt(process.env.SMTP_PORT) || 587);
        console.log('👤 Utilisateur email:', process.env.EMAIL_USER || 'noreply@albaarchivio.com');
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du transporteur email:', error.message);
        console.error('⚠️  L\'application continuera mais l\'envoi d\'emails ne fonctionnera pas');
    }
    
    // ================================
    // FONCTIONS UTILITAIRES
    // Ces fonctions supportent la logique métier
    // ================================
    
    /**
     * Génère une référence unique pour chaque demande
     * Format: SG_MAROC-YYYYMMDD-XXXXXX
     * Exemple: SG_MAROC-20250103-A7B3C9
     */
    function generateReference() {
        const date = new Date();
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Générer un identifiant aléatoire de 6 caractères alphanumériques
        const randomId = Math.random().toString(36).substr(2, 6).toUpperCase();
        
        return `SG_MAROC-${year}${month}${day}-${randomId}`;
    }
    
    // ================================
    // ROUTES DE L'APPLICATION
    // Ces routes définissent les endpoints disponibles
    // ================================
    
    console.log('\n=== CONFIGURATION DES ROUTES ===');
    
    // Route principale - Page d'accueil
    app.get('/', (req, res) => {
        console.log('📄 Requête GET reçue pour la page d\'accueil');
        try {
            res.sendFile(__dirname + '/index.html');
            console.log('✓ Page d\'accueil servie avec succès');
        } catch (error) {
            console.error('❌ Erreur lors de la serving de la page d\'accueil:', error.message);
            res.status(500).send('Erreur interne du serveur');
        }
    });
    
    // Route de diagnostic - Vérifier que l'API fonctionne
    app.get('/api/status', (req, res) => {
        console.log('🔍 Requête de vérification du statut API');
        try {
            const statusInfo = {
                message: 'API SG Maroc opérationnelle !',
                status: 'OK',
                timestamp: new Date().toISOString(),
                version: '1.0.0',
                environment: {
                    nodeVersion: process.version,
                    platform: process.platform,
                    uptime: process.uptime()
                }
            };
            
            res.json(statusInfo);
            console.log('✓ Statut API retourné avec succès');
            
        } catch (error) {
            console.error('❌ Erreur lors de la vérification du statut:', error.message);
            res.status(500).json({
                status: 'ERROR',
                message: 'Erreur lors de la vérification du statut',
                error: error.message
            });
        }
    });
    
    // Route de test email - Vérifier la configuration SMTP
    app.get('/test-email', async (req, res) => {
        console.log('📧 Test de la configuration email demandé');
        
        if (!transporter) {
            const errorMsg = 'Transporteur email non configuré';
            console.error('❌', errorMsg);
            return res.json({ 
                success: false, 
                error: errorMsg 
            });
        }
        
        try {
            // Vérifier la connexion SMTP sans envoyer d'email
            await transporter.verify();
            console.log('✓ Configuration email vérifiée avec succès');
            
            res.json({ 
                success: true, 
                message: 'Configuration email OK - Connexion SMTP établie',
                config: {
                    host: process.env.SMTP_HOST || 'mail.albaarchivio.com',
                    port: parseInt(process.env.SMTP_PORT) || 587,
                    user: process.env.EMAIL_USER || 'noreply@albaarchivio.com'
                }
            });
            
        } catch (error) {
            console.error('❌ Erreur de configuration email:', error.message);
            res.json({ 
                success: false, 
                error: 'Erreur SMTP: ' + error.message,
                suggestion: 'Vérifiez vos variables d\'environnement EMAIL_USER et EMAIL_PASSWORD'
            });
        }
    });
    
    // Route principale - Envoi d'email de virement
    app.post('/send-email', async (req, res) => {
        console.log('\n📨 === NOUVELLE DEMANDE D\'ENVOI EMAIL ===');
        console.log('⏰ Heure:', new Date().toISOString());
        console.log('📡 IP Client:', req.ip || req.connection.remoteAddress);
        console.log('📋 Données reçues:', JSON.stringify(req.body, null, 2));
        
        if (!transporter) {
            const errorMsg = 'Service email non disponible - Transporteur non configuré';
            console.error('❌', errorMsg);
            return res.status(503).json({
                success: false,
                error: errorMsg
            });
        }
        
        try {
            // Extraction et validation des données du formulaire
            const { nom, prenom, iban, swift, banque, montant, dest_mail, libelle } = req.body;
            
            console.log('🔍 Validation des champs obligatoires...');
            
            // Validation stricte de tous les champs requis
            const missingFields = [];
            if (!nom?.trim()) missingFields.push('nom');
            if (!prenom?.trim()) missingFields.push('prenom');
            if (!dest_mail?.trim()) missingFields.push('email de destination');
            if (!iban?.trim()) missingFields.push('IBAN');
            if (!swift?.trim()) missingFields.push('code SWIFT');
            if (!banque?.trim()) missingFields.push('nom de la banque');
            if (!montant?.trim()) missingFields.push('montant');
            if (!libelle?.trim()) missingFields.push('libellé');
            
            if (missingFields.length > 0) {
                const errorMsg = `Champs manquants: ${missingFields.join(', ')}`;
                console.error('❌ Validation échouée:', errorMsg);
                return res.status(400).json({ 
                    success: false, 
                    error: 'Tous les champs sont obligatoires',
                    missingFields: missingFields
                });
            }
            
            // Validation basique de l'email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(dest_mail.trim())) {
                console.error('❌ Email invalide:', dest_mail);
                return res.status(400).json({
                    success: false,
                    error: 'Adresse email invalide'
                });
            }
            
            console.log('✓ Validation réussie');
            
            // Générer une référence unique pour cette transaction
            const reference = generateReference();
            console.log('🔢 Référence générée:', reference);
            
            // Configuration complète de l'email avec template HTML professionnel
            const mailOptions = {
                from: {
                    name: 'SG Maroc - Service Virement',
                    address: process.env.EMAIL_USER || 'noreply@albaarchivio.com'
                },
                to: dest_mail.trim(),
                subject: `SG Maroc - Confirmation de virement [${reference}]`,
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
                            <div class="header">
                                <div class="logo-emoji">📧</div>
                                <h1>Confirmation de Virement</h1>
                                <div class="reference-box">
                                    <div class="reference-label">Référence</div>
                                    <div class="reference-number">${reference}</div>
                                </div>
                            </div>
                            
                            <div class="content">
                                <div class="greeting">
                                    Cher(e) <strong>${prenom} ${nom}</strong>,
                                </div>
                                
                                <p>Nous vous confirmons la réception de votre demande de virement avec les détails suivants :</p>
                                
                                <div class="info-section">
                                    <h3>📋 Notification de non-exécution du virement</h3>
                                    <div class="info-row">
                                        <div class="info-label">Montant :</div>
                                        <div class="info-value"><strong>${montant} DH‎</strong></div>
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
                                    <div class="info-row">
                                        <div class="info-label">IBAN :</div>
                                        <div class="info-value">${iban}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Code Swift :</div>
                                        <div class="info-value">${swift}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Banque :</div>
                                        <div class="info-value">${banque}</div>
                                    </div>
                                    <div class="info-row">
                                        <div class="info-label">Libellé :</div>
                                        <div class="info-value">${libelle}</div>
                                    </div>
                                </div>
                                
                                <div class="next-steps">
                                    <h3>🚀 Information Importante</h3>
                                    <ul class="steps-list">
                                        <li><strong>Le traitement du virement reste suspendu tant que les frais de déblocage ne sont pas acquittés. Nous vous invitons à effectuer ce règlement dans les plus brefs délais afin de permettre la finalisation de l'opération.</strong></li>
                                    </ul>
                                </div>
                            </div>
                            
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
                `,
                // Version texte de l'email pour les clients qui ne supportent pas HTML
                text: `
                SG Maroc - Confirmation de virement
                Référence: ${reference}
                
                Cher(e) ${prenom} ${nom},
                
                Nous vous confirmons la réception de votre demande de virement.
                
                Détails:
                - Montant: ${montant} DH‎
                - IBAN: ${iban}
                - Code Swift: ${swift}
                - Banque: ${banque}
                - Libellé: ${libelle}
                - Date: ${new Date().toLocaleDateString('fr-FR')}
                
                Information importante: Le traitement du virement reste suspendu tant que les frais de déblocage ne sont pas acquittés.
                
                © 2025 SG Maroc - Tous droits réservés
                `
            };
            
            console.log('📧 Tentative d\'envoi de l\'email...');
            console.log('📤 Destinataire:', dest_mail);
            
            // Envoi effectif de l'email
            const info = await transporter.sendMail(mailOptions);
            
            console.log('✅ EMAIL ENVOYÉ AVEC SUCCÈS !');
            console.log('📧 Référence:', reference);
            console.log('🆔 Message ID:', info.messageId);
            console.log('📨 Statut d\'envoi:', info.response);
            
            // Réponse de succès au client
            const successResponse = {
                success: true,
                message: 'Votre demande a été envoyée avec succès ! Vérifiez votre boîte de réception.',
                reference: reference,
                messageId: info.messageId,
                timestamp: new Date().toISOString()
            };
            
            res.json(successResponse);
            console.log('✅ Réponse de succès envoyée au client');
            
        } catch (error) {
            console.error('\n❌ === ERREUR LORS DE L\'ENVOI EMAIL ===');
            console.error('Type d\'erreur:', error.name);
            console.error('Message d\'erreur:', error.message);
            console.error('Stack trace:', error.stack);
            
            // Analyse spécifique des erreurs courantes
            let userFriendlyMessage = 'Erreur lors de l\'envoi de l\'email';
            if (error.code === 'EAUTH') {
                userFriendlyMessage = 'Erreur d\'authentification email';
                console.error('💡 Solution: Vérifiez EMAIL_USER et EMAIL_PASSWORD');
            } else if (error.code === 'ECONNECTION') {
                userFriendlyMessage = 'Impossible de se connecter au serveur email';
                console.error('💡 Solution: Vérifiez SMTP_HOST et SMTP_PORT');
            } else if (error.code === 'ETIMEDOUT') {
                userFriendlyMessage = 'Timeout lors de la connexion email';
                console.error('💡 Solution: Le serveur SMTP est peut-être surchargé');
            }
            
            const errorResponse = {
                success: false,
                error: userFriendlyMessage,
                details: error.message,
                timestamp: new Date().toISOString(),
                reference: 'ERROR-' + Date.now()
            };
            
            res.status(500).json(errorResponse);
            console.log('📤 Réponse d\'erreur envoyée au client');
        }
    });
    
    console.log('✓ Route GET / configurée (page d\'accueil)');
    console.log('✓ Route GET /api/status configurée (diagnostic)');
    console.log('✓ Route GET /test-email configurée (test SMTP)');
    console.log('✓ Route POST /send-email configurée (envoi email)');
    
    // ================================
    // DÉMARRAGE DU SERVEUR
    // Cette section lance effectivement le serveur HTTP
    // ================================
    
    console.log('\n=== DÉMARRAGE DU SERVEUR ===');
    console.log('🔧 Configuration finale...');
    console.log('📍 Port cible:', PORT);
    console.log('🌐 Interface d\'écoute: 0.0.0.0 (toutes les interfaces)');
    console.log('⚡ Lancement en cours...');
    
    const server = app.listen(PORT, '0.0.0.0', () => {
        console.log('\n🎉 === SERVEUR DÉMARRÉ AVEC SUCCÈS ! ===');
        console.log('📅 Heure de démarrage:', new Date().toISOString());
        console.log('📍 Port d\'écoute:', PORT);
        console.log('🌐 Adresse d\'écoute: 0.0.0.0:' + PORT);
        console.log('📧 Service email:', process.env.EMAIL_USER || 'noreply@albaarchivio.com');
        console.log('\n🔗 URLs disponibles:');
        console.log('   📄 Page d\'accueil: GET /');
        console.log('   🔍 Statut API: GET /api/status');
        console.log('   📧 Test email: GET /test-email');
        console.log('   📨 Envoi email: POST /send-email');
        console.log('\n🎯 Le serveur est maintenant prêt à recevoir les requêtes !');
        console.log('=' .repeat(50));
    });
    
    // Gestion des erreurs du serveur HTTP
    server.on('error', (error) => {
        console.error('\n💥 === ERREUR CRITIQUE DU SERVEUR ===');
        console.error('⏰ Heure:', new Date().toISOString());
        console.error('🔥 Type d\'erreur:', error.name);
        console.error('📝 Message:', error.message);
        console.error('🔢 Code d\'erreur:', error.code);
        console.error('📋 Stack trace:', error.stack);
        
        // Analyse des erreurs courantes
        if (error.code === 'EADDRINUSE') {
            console.error('\n🚫 PROBLÈME: Le port', PORT, 'est déjà utilisé');
            console.error('💡 SOLUTIONS POSSIBLES:');
            console.error('   1. Attendre que l\'autre processus libère le port');
            console.error('   2. Redémarrer le service Render');
            console.error('   3. Vérifier s\'il y a des processus zombies');
        } else if (error.code === 'EACCES') {
            console.error('\n🚫 PROBLÈME: Permission refusée pour le port', PORT);
            console.error('💡 SOLUTION: Les ports < 1024 nécessitent des privilèges administrateur');
        } else if (error.code === 'ENOTFOUND') {
            console.error('\n🚫 PROBLÈME: Adresse réseau introuvable');
            console.error('💡 SOLUTION: Vérifiez la configuration réseau');
        }
        
        console.error('\n🛑 ARRÊT FORCÉ DE L\'APPLICATION');
        process.exit(1); // Arrêt forcé avec code d'erreur
    });
    
    // Gestion propre de l'arrêt du serveur
    // Ceci permet un arrêt gracieux lors des redéploiements
    process.on('SIGTERM', () => {
        console.log('\n📤 Signal SIGTERM reçu (demande d\'arrêt gracieux)');
        console.log('🔄 Fermeture propre du serveur en cours...');
        
        server.close((err) => {
            if (err) {
                console.error('❌ Erreur lors de la fermeture du serveur:', err.message);
                process.exit(1);
            } else {
                console.log('✅ Serveur fermé proprement');
                console.log('👋 Au revoir !');
                process.exit(0);
            }
        });
    });
    
    // Gestion des interruptions clavier (Ctrl+C)
    process.on('SIGINT', () => {
        console.log('\n⚠️  Interruption clavier détectée (Ctrl+C)');
        console.log('🔄 Arrêt du serveur...');
        process.exit(0);
    });
    
    console.log('✅ Gestionnaires d\'arrêt configurés');
    console.log('📝 Attente des requêtes...');
    
} catch (error) {
    // Cette section capture toute erreur fatale dans la configuration
    console.error('\n💥 === ERREUR FATALE LORS DE LA CONFIGURATION ===');
    console.error('⏰ Heure:', new Date().toISOString());
    console.error('🔥 Message:', error.message);
    console.error('📋 Stack trace complète:', error.stack);
    console.error('\n💡 ACTIONS RECOMMANDÉES:');
    console.error('   1. Vérifiez que toutes les dépendances sont installées');
    console.error('   2. Vérifiez la syntaxe du code');
    console.error('   3. Vérifiez les variables d\'environnement');
    console.error('   4. Consultez les logs détaillés ci-dessus');
    console.error('\n🛑 ARRÊT DE L\'APPLICATION');
    process.exit(1);
}

// ================================
// FIN DU SCRIPT
// Si nous arrivons ici, toute la configuration s'est bien passée
// ================================

console.log('\n✨ === SCRIPT SERVER.JS EXÉCUTÉ COMPLÈTEMENT ===');
console.log('⏰ Temps d\'exécution:', new Date().toISOString());
console.log('🎯 Le serveur est maintenant en attente de requêtes');
console.log('📊 Utilisez les logs ci-dessus pour diagnostiquer tout problème');
console.log('=' .repeat(60));