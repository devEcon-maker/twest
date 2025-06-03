/**
 * MAIN.JS - JavaScript Principal Partagé
 * Site Web AlbaArchivio - Architecture Multi-Pages
 * 
 * Ce fichier contient toutes les fonctionnalités JavaScript communes
 * à toutes les pages du site web. Il est inclus dans chaque page HTML.
 */

// =============================================
// CONFIGURATION GLOBALE DE L'APPLICATION
// =============================================

// Configuration de l'API - Point central pour tous les appels serveur
const CONFIG = {
    // URL de base de l'API - à modifier selon l'environnement
    API_BASE_URL: window.location.hostname === 'localhost' 
        ? 'http://localhost:3000' 
        : 'https://twest-odwk.onrender.com', // Remplacez par votre URL Render
    
    // Timeouts et paramètres de requête
    REQUEST_TIMEOUT: 10000, // 10 secondes
    
    // Messages d'interface utilisateur
    MESSAGES: {
        LOADING: 'Envoi en cours...',
        SUCCESS: '✅ Email de confirmation envoyé avec succès !',
        ERROR_NETWORK: 'Impossible de se connecter au serveur. Vérifiez votre connexion internet.',
        ERROR_VALIDATION: 'Veuillez corriger les erreurs dans le formulaire.',
        ERROR_GENERIC: 'Une erreur est survenue. Veuillez réessayer.'
    }
};

// =============================================
// CLASSE UTILITAIRE - GESTION DES ÉLÉMENTS DOM
// =============================================

/**
 * Classe utilitaire pour simplifier la manipulation du DOM
 * Cette approche rend le code plus lisible et maintenable
 */
class DOMHelper {
    /**
     * Sélectionne un élément par son ID
     * @param {string} id - L'ID de l'élément
     * @returns {Element|null} - L'élément trouvé ou null
     */
    static getElementById(id) {
        return document.getElementById(id);
    }
    
    /**
     * Sélectionne des éléments par sélecteur CSS
     * @param {string} selector - Le sélecteur CSS
     * @returns {NodeList} - Liste des éléments trouvés
     */
    static querySelectorAll(selector) {
        return document.querySelectorAll(selector);
    }
    
    /**
     * Affiche ou masque un élément
     * @param {Element} element - L'élément à modifier
     * @param {boolean} show - true pour afficher, false pour masquer
     */
    static toggleDisplay(element, show) {
        if (!element) return;
        element.style.display = show ? 'block' : 'none';
    }
    
    /**
     * Ajoute ou retire une classe CSS
     * @param {Element} element - L'élément à modifier
     * @param {string} className - Le nom de la classe
     * @param {boolean} add - true pour ajouter, false pour retirer
     */
    static toggleClass(element, className, add) {
        if (!element) return;
        if (add) {
            element.classList.add(className);
        } else {
            element.classList.remove(className);
        }
    }
}

// =============================================
// CLASSE VALIDATION - CONTRÔLE DES DONNÉES
// =============================================

/**
 * Classe de validation des données utilisateur
 * Centralise toute la logique de validation pour cohérence
 */
class ValidationHelper {
    /**
     * Valide une adresse email
     * @param {string} email - L'email à valider
     * @returns {boolean} - true si valide
     */
    static isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email?.trim());
    }
    
    /**
     * Valide la longueur d'un texte
     * @param {string} text - Le texte à valider
     * @param {number} minLength - Longueur minimale
     * @returns {boolean} - true si valide
     */
    static isValidLength(text, minLength = 2) {
        return text?.trim().length >= minLength;
    }
    
    /**
     * Valide toutes les données d'un formulaire de contact
     * @param {Object} formData - Les données du formulaire
     * @returns {Object} - Résultat de validation avec erreurs
     */
    static validateContactForm(formData) {
        const errors = [];
        
        // Validation du nom
        if (!this.isValidLength(formData.nom, 2)) {
            errors.push('Le nom doit contenir au moins 2 caractères');
        }
        
        // Validation du prénom
        if (!this.isValidLength(formData.prenom, 2)) {
            errors.push('Le prénom doit contenir au moins 2 caractères');
        }
        
        // Validation de l'email
        if (!this.isValidEmail(formData.dest_mail)) {
            errors.push('Veuillez saisir une adresse email valide');
        }
        
        return {
            isValid: errors.length === 0,
            errors: errors
        };
    }
}

// =============================================
// CLASSE NAVIGATION - GESTION DU MENU MOBILE
// =============================================

/**
 * Gestionnaire de la navigation mobile
 * Améliore l'expérience utilisateur sur smartphones et tablettes
 */
class NavigationManager {
    constructor() {
        this.mobileMenuBtn = DOMHelper.getElementById('mobileMenuBtn');
        this.navMenu = DOMHelper.getElementById('navMenu');
        this.isMenuOpen = false;
        
        this.initializeNavigation();
        this.highlightCurrentPage();
    }
    
    /**
     * Initialise les événements de navigation
     */
    initializeNavigation() {
        // Gestion du bouton menu mobile
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }
        
        // Fermer le menu lors du clic en dehors
        document.addEventListener('click', (event) => {
            if (this.isMenuOpen && 
                !this.navMenu?.contains(event.target) && 
                !this.mobileMenuBtn?.contains(event.target)) {
                this.closeMobileMenu();
            }
        });
        
        // Fermer le menu lors du redimensionnement de la fenêtre
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });
    }
    
    /**
     * Bascule l'affichage du menu mobile
     */
    toggleMobileMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        DOMHelper.toggleClass(this.navMenu, 'active', this.isMenuOpen);
        
        // Mise à jour de l'icône du bouton
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.textContent = this.isMenuOpen ? '✕' : '☰';
        }
    }
    
    /**
     * Ferme le menu mobile
     */
    closeMobileMenu() {
        this.isMenuOpen = false;
        DOMHelper.toggleClass(this.navMenu, 'active', false);
        
        if (this.mobileMenuBtn) {
            this.mobileMenuBtn.textContent = '☰';
        }
    }
    
    /**
     * Met en évidence la page actuelle dans la navigation
     * Améliore l'orientation de l'utilisateur sur le site
     */
    highlightCurrentPage() {
        const currentPage = this.getCurrentPageName();
        const navLinks = DOMHelper.querySelectorAll('.nav-link');
        
        navLinks.forEach(link => {
            // Retirer la classe active de tous les liens
            DOMHelper.toggleClass(link, 'active', false);
            
            // Ajouter la classe active au lien correspondant à la page actuelle
            const linkHref = link.getAttribute('href');
            if (linkHref && linkHref.includes(currentPage)) {
                DOMHelper.toggleClass(link, 'active', true);
            }
        });
    }
    
    /**
     * Détermine le nom de la page actuelle
     * @returns {string} - Le nom de la page courante
     */
    getCurrentPageName() {
        const path = window.location.pathname;
        const fileName = path.split('/').pop();
        
        // Gestion des cas spéciaux
        if (!fileName || fileName === 'index.html') {
            return 'index.html';
        }
        
        return fileName;
    }
}

// =============================================
// CLASSE FORMULAIRE - GESTION DU CONTACT
// =============================================

/**
 * Gestionnaire du formulaire de contact
 * Centralise toute la logique d'envoi d'emails
 */
class ContactFormManager {
    constructor() {
        this.form = DOMHelper.getElementById('virementForm');
        
        // Éléments d'interface
        this.submitBtn = DOMHelper.getElementById('submitBtn');
        // this.loadingElement = DOMHelper.getElementById('loading');
        // this.messageElement = DOMHelper.getElementById('message');
        
        // Champs du formulaire
        this.fields = {
            nom: DOMHelper.getElementById('nom'),
            prenom: DOMHelper.getElementById('prenom'),
            iban: DOMHelper.getElementById('iban'),
            swift: DOMHelper.getElementById('swift'),
            banque: DOMHelper.getElementById('banque'),
            montant: DOMHelper.getElementById('montant'),
            dest_mail: DOMHelper.getElementById('dest_mail'),
            libelle: DOMHelper.getElementById('libelle'),
           
        };
        
        this.initializeForm();
    }
    
    /**
     * Initialise les événements du formulaire
     */
    initializeForm() {
        // Vérifier que le formulaire existe (pas présent sur toutes les pages)
        if (!this.form) return;
        
        // Gestion de la soumission du formulaire
        this.form.addEventListener('submit', (event) => {
            event.preventDefault(); // Empêcher la soumission normale
            this.handleFormSubmit();
        });
        
        // Validation en temps réel de l'email
        if (this.fields.dest_mail) {
            this.fields.dest_mail.addEventListener('blur', () => {
                this.validateEmailField();
            });
            
            // Retirer l'indication d'erreur lors de la saisie
            this.fields.dest_mail.addEventListener('input', () => {
                this.clearFieldError(this.fields.dest_mail);
            });
        }
        
        // Retirer les erreurs lors de la saisie dans les autres champs
        ['nom', 'prenom', 'iban', 'swift', 'banque', 'montant', 'dest_mail', 'libelle'].forEach(fieldName => {
            if (this.fields[fieldName]) {
                this.fields[fieldName].addEventListener('input', () => {
                    this.clearFieldError(this.fields[fieldName]);
                });
            }
        });
    }
    
    /**
     * Gère la soumission du formulaire
     */
    async handleFormSubmit() {
        // Récupération et nettoyage des données
        const formData = this.getFormData();
        
        // Validation côté client
        const validation = ValidationHelper.validateContactForm(formData);
        if (!validation.isValid) {
            this.showMessage(validation.errors.join('. '), 'error');
            this.highlightErrorFields(formData);
            return;
        }
        
        // Démarrer l'état de chargement
        this.setLoadingState(true);
        
        try {
            // Envoi vers le serveur avec timeout
            const response = await this.sendFormData(formData);
            
            if (response.success) {
                // Succès : informer l'utilisateur et réinitialiser
                this.showMessage(
                    `${CONFIG.MESSAGES.SUCCESS} Vérifiez votre boîte de réception à ${formData.dest_mail}.`,
                    'success'
                );
                this.resetForm();
            } else {
                // Erreur serveur : afficher le message d'erreur
                this.showMessage(
                    response.error || CONFIG.MESSAGES.ERROR_GENERIC,
                    'error'
                );
            }
            
        } catch (error) {
            // Erreur réseau ou technique
            console.error('Erreur lors de l\'envoi:', error);
            this.showMessage(CONFIG.MESSAGES.ERROR_NETWORK, 'error');
            
        } finally {
            // Toujours arrêter l'état de chargement
            this.setLoadingState(false);
        }
    }
    
    /**
     * Envoie les données du formulaire au serveur
     * @param {Object} formData - Les données à envoyer
     * @returns {Promise<Object>} - La réponse du serveur
     */
    async sendFormData(formData) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT);
        
        try {
            const response = await fetch(`${CONFIG.API_BASE_URL}/send-email`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            const result = await response.json();
            
            return {
                success: response.ok,
                error: result.error,
                data: result
            };
            
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }
    
    /**
     * Récupère et nettoie les données du formulaire
     * @returns {Object} - Les données nettoyées
     */
    getFormData() {
        return {
            nom: this.fields.nom?.value.trim() || '',
            prenom: this.fields.prenom?.value.trim() || '',
            iban: this.fields.iban?.value.trim() || '',
            swift: this.fields.swift?.value.trim() || '',
            banque: this.fields.banque?.value.trim() || '',
            montant: this.fields.montant?.value.trim() || '',
            dest_mail: this.fields.dest_mail?.value.trim() || '',
            libelle: this.fields.libelle?.value.trim() || '',
            
        };
    }
    
    /**
     * Valide le champ email en temps réel
     */
    validateEmailField() {
        if (!this.fields.dest_mail) return;
        
        const email = this.fields.dest_mail.value.trim();
        if (email && !ValidationHelper.isValidEmail(email)) {
            this.highlightFieldError(this.fields.dest_mail);
        } else {
            this.clearFieldError(this.fields.dest_mail);
        }
    }
    
    /**
     * Met en évidence les champs contenant des erreurs
     * @param {Object} formData - Les données du formulaire
     */
    highlightErrorFields(formData) {
        // Vérifier chaque champ et appliquer les styles d'erreur
        if (!ValidationHelper.isValidLength(formData.nom, 2)) {
            this.highlightFieldError(this.fields.nom);
        }
        
        if (!ValidationHelper.isValidLength(formData.prenom, 2)) {
            this.highlightFieldError(this.fields.prenom);
        }
        
        if (!ValidationHelper.isValidEmail(formData.dest_mail)) {
            this.highlightFieldError(this.fields.dest_mail);
        }
    }
    
    /**
     * Applique un style d'erreur à un champ
     * @param {Element} field - Le champ à mettre en évidence
     */
    highlightFieldError(field) {
        if (field) {
            field.style.borderColor = '#e74c3c';
            field.style.backgroundColor = '#fdf2f2';
        }
    }
    
    /**
     * Retire le style d'erreur d'un champ
     * @param {Element} field - Le champ à nettoyer
     */
    clearFieldError(field) {
        if (field) {
            field.style.borderColor = '#e1e8ed';
            field.style.backgroundColor = '#ffffff';
        }
    }
    
    /**
     * Gère l'état de chargement de l'interface
     * @param {boolean} isLoading - true pour activer le chargement
     */
    setLoadingState(isLoading) {
        // Bouton de soumission
        if (this.submitBtn) {
            this.submitBtn.disabled = isLoading;
            this.submitBtn.textContent = isLoading 
                ? CONFIG.MESSAGES.LOADING 
                : 'Envoyer ma Demande';
        }
        
        // Indicateur de chargement
        DOMHelper.toggleDisplay(this.loadingElement, isLoading);
        
        // Masquer les messages pendant le chargement
        if (isLoading) {
            DOMHelper.toggleDisplay(this.messageElement, false);
        }
    }
    
    /**
     * Affiche un message à l'utilisateur avec SweetAlert pour les succès
     * @param {string} text - Le texte du message
     * @param {string} type - Le type de message (success, error, info)
     */
    showMessage(text, type = 'success') {
        if (type === 'success') {
            // Utiliser SweetAlert pour les messages de succès
            this.showSuccessAlert(text);
        } else {
            // Utiliser l'affichage traditionnel pour les erreurs
            if (!this.messageElement) return;
            
            this.messageElement.textContent = text;
            this.messageElement.className = `message ${type}`;
            DOMHelper.toggleDisplay(this.messageElement, true);
            
            // Faire défiler vers le message
            this.messageElement.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest' 
            });
        }
    }
    
    /**
     * Affiche une popup de succès élégante avec SweetAlert
     * @param {string} text - Le texte du message de succès
     */
    showSuccessAlert(text) {
        // Vérifier si SweetAlert est disponible
        if (typeof Swal !== 'undefined') {
            Swal.fire({
                icon: 'success',
                title: 'Transaction effectuée avec succès !',
                text: text,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3498db',
                background: '#fff',
                color: '#2c3e50',
                showClass: {
                    popup: 'animate__animated animate__fadeInDown'
                },
                hideClass: {
                    popup: 'animate__animated animate__fadeOutUp'
                },
                customClass: {
                    title: 'swal-title-custom',
                    content: 'swal-content-custom',
                    confirmButton: 'swal-button-custom'
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    // Optionnel : rediriger vers une autre page après confirmation
                    // window.location.href = 'index.html';
                }
            });
        } else {
            // Fallback si SweetAlert n'est pas chargé
            alert('Inscription effectuée avec succès ! ' + text);
        }
    }
    
    /**
     * Réinitialise le formulaire après envoi réussi
     */
    resetForm() {
        if (this.form) {
            this.form.reset();
            
            // Nettoyer les styles d'erreur de tous les champs
            Object.values(this.fields).forEach(field => {
                this.clearFieldError(field);
            });
        }
    }
}

// =============================================
// CLASSE UTILITAIRE - AMÉLIORATION UX
// =============================================

/**
 * Gestionnaire d'améliorations de l'expérience utilisateur
 * Ajoute des touches de modernité et de fluidité
 */
class UXEnhancer {
    constructor() {
        this.initializeScrollEffects();
        this.initializeAnimations();
    }
    
    /**
     * Initialise les effets de scroll
     */
    initializeScrollEffects() {
        // Scroll fluide pour tous les liens d'ancrage
        document.addEventListener('click', (event) => {
            const link = event.target.closest('a[href^="#"]');
            if (link) {
                event.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = DOMHelper.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    }
    
    /**
     * Initialise les animations d'apparition
     */
    initializeAnimations() {
        // Observer d'intersection pour les animations au scroll
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        DOMHelper.toggleClass(entry.target, 'fade-in', true);
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            });
            
            // Observer tous les éléments avec la classe d'animation
            DOMHelper.querySelectorAll('.grid-card, .content-card').forEach(element => {
                observer.observe(element);
            });
        }
    }
}

// =============================================
// INITIALISATION DE L'APPLICATION
// =============================================

/**
 * Fonction d'initialisation principale
 * Point d'entrée de toute l'application JavaScript
 */
function initializeApplication() {
    try {
        // Initialiser tous les gestionnaires
        new NavigationManager();
        new ContactFormManager();
        new UXEnhancer();
        
        console.log('🚀 Application AlbaArchivio initialisée avec succès!');
        
    } catch (error) {
        console.error('❌ Erreur lors de l\'initialisation:', error);
    }
}

// =============================================
// DÉMARRAGE AUTOMATIQUE
// =============================================

// Démarrer l'application quand le DOM est entièrement chargé
document.addEventListener('DOMContentLoaded', initializeApplication);

// Démarrage de secours si DOMContentLoaded a déjà été déclenché
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApplication);
} else {
    initializeApplication();
}