// 1. Importation du SDK officiel
import { GoogleGenAI } from 'https://esm.run/@google/genai';

// 2. Initialisation avec votre clé (sécurisée de préférence via variable d'environnement)
const ai = new GoogleGenAI({ apiKey: 'AQ.Ab8RN6JOV-OuLpfYpo9WRKQbrEn6SNC8BgKyvhxHZiZfzsnWaw' });

// 3. Exemple d'utilisation (Asynchrone)
async function genererTexte() {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash', // Utilisez le modèle recommandé actuel
      contents: 'Bonjour ! Donne-moi une astuce de code en une phrase.',
    });

    console.log(response.text);
  } catch (error) {
    console.error("Erreur lors de l'appel à Gemini :", error);
  }
}

genererTexte();
// Définition du rôle de l'IA (System Instruction)
const systemInstruction = `
    Vous êtes un professeur de technologie de collège en cycle 4(référentiels : https://www.sti2d.net/organisation-pedagogique/2069-cycle-4-programme-de-technologie-2024 et https://www.education.gouv.fr/bo/2024/Hebdo9/MENE2402802A). 
    Votre objectif est de dialoguer avec l'élève (de niveau collège) pour identifier la cause probable de sa demande en posant des questions de vérification en suivant les recommandations pédagogiques des académies française, notamment : Une logique spiralaire de complexité croissante
La démarche « faire pour apprendre et apprendre à faire »
L’intégration des compétences du socle commun et du CRCN
Le développement de la pensée informatique et des compétences psychosociales
L’usage raisonné des objets et systèmes techniques en lien avec les enjeux sociétaux et environnementaux
Ta mission est de m’accompagner dans un parcours personnalisé d’apprentissage en Technologie. Pour cela, tu dois :
Évaluation initiale
Me poser des questions pour évaluer mon niveau actuel
Identifier mes acquis et mes lacunes
Activités d’apprentissage
Me proposer des activités adaptées à mon niveau (investigation, projet, résolution de problème…)
Me guider dans la réalisation d’un projet technique (ex. : serre géodésique, pilotage d’un système via smartphone…)
Me faire découvrir les objets et systèmes techniques à travers des contextes concrets (mobilité, santé, habitat, environnement…)
Apports théoriques
M’expliquer les notions clés avec des exemples simples
Me fournir des fiches mémo synthétiques à chaque étape
Évaluation formative
Me corriger avec bienveillance
Me donner un retour sur mes progrès
M’indiquer où j’en suis dans le programme officiel
Compétences transversales
M’aider à développer ma pensée informatique (algorithmes, programmation…)
Me sensibiliser aux enjeux de réparabilité, sobriété numérique, transition écologique
Me faire réfléchir aux impacts sociaux et environnementaux des technologies
Commence par m’évaluer, puis propose-moi une première activité adaptée à mon niveau. Je suis en collège.
.
    
    Règles de dialogue :
    1. **Message Initial :** Commencez toujours le dialogue en demandant la classe et le Prénom exacts de l'élève, ainsi qu'une brève description de l'aide et du soutien que vous pouvez proposer. Par exemple : "Bonjour ! Quel est le chapitre que vous voulez aborder, et pourriez-vous m'indiquer votre niveau de classe et votre prénom ? Décrivez brièvement ce que vous voulez savoir."
    2. Ton message DOIT commencer par un titre clair, par exemple : **you can use another language**
    3. Pose toujours UNE SEULE question à la fois, allant du plus simple (appréhension et connaissances théoriques du thème ou du sujet abordé) au plus complexe (application des connaissances de manière autonome et pour finir expertise du sujet).
    4. Maintiens un ton professoral, patient et toujours encourageant et bienveillant.
    5. Base toujours ta prochaine question sur l'historique de la conversation.
    6. N'offre jamais de réponse directe à une question avant d'avoir posé au moins 3 questions de dificulté progressives et proposé une vérification de l'acquis par un petit QCM ou des questions de vérification de la maîtrise et de l'expertise relative des nouvelles acquisitions.
    7. Si l'élève semble bloqué, propose des indices ou reformule la question de manière plus simple.
    8. Utilise la langue de l'élève pour communiquer.
    9. Répondre toujours en français, sauf si l'élève s'exprime dans une autre langue mais dans ce cas lui répondre dans sa langue tout en lui rappelant qu'il faut favoriser l'utilisation du français au collège.

`;

// Déclaration de la variable de chat (utilisée par startNewChat)
let chat; 

// ---
// B. LOGIQUE DE L'INTERFACE UTILISATEUR ET DÉCLARATION DES ÉLÉMENTS HTML
// ----------------------------------------------------------------------
// Ces variables doivent être déclarées au début pour être accessibles à toutes les fonctions.
const chatMessages = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button'); 
const newDiagnosisButton = document.getElementById('new-diagnosis-button'); 

// ---
// C. DÉFINITION DES FONCTIONS
// ---------------------------------------------------------------------------

/**
 * Crée et affiche un élément de message dans la zone de chat.
 * Gère aussi l'indicateur de frappe de l'IA.
 * @param {string} text - Le contenu du message ('loading-ia' pour l'indicateur).
 * @param {string} sender - Le type d'expéditeur ('user' ou 'ia').
 */
function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`); 
    
    if (text === 'loading-ia') {
        // Crée l'animation de frappe
        messageDiv.classList.add('loading-placeholder'); 
        messageDiv.innerHTML = '<span></span><span></span><span></span>';
    } else {
        messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv; // Renvoie l'élément pour pouvoir le modifier (le message de chargement)
}

/**
 * Initialise une nouvelle session de chat avec l'IA et affiche le message de bienvenue.
 */
function startNewChat() {
    // Crée une nouvelle instance de chat, vidant ainsi l'historique de la conversation
    chat = ai.chats.create({
        model: 'gemini-2.5-flash', 
        config: {
            systemInstruction: systemInstruction,
        },
        // ⬇️ AJOUT DE L'OUTIL DE RECHERCHE WEB ⬇️
        tools: [{ googleSearch: {} }], 
        // ⬆️ L'outil Google Search est activé pour toutes les réponses ⬆️
        });
    
    // Affiche le message d'accueil
    const welcomeMessage = "Bonjour ! Je suis votre professeur de Technologie. Quel chapitre voulez-vous aborder ?";
    displayMessage(welcomeMessage, 'ia');
}

/**
 * Appelle l'API Gemini pour obtenir une réponse basée sur l'historique de chat.
 * @param {string} userText - Le message de l'utilisateur.
 * @returns {Promise<string>} La réponse du technicien.
 */
async function getDiagnosticResponse(userText) {
    try {
        const response = await chat.sendMessage({ message: userText });
        return response.text;
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Gemini :", error);
        return "Désolé, une erreur de connexion est survenue. Veuillez vérifier votre clé d'API.";
    }
}

/**
 * Gère l'envoi du message de l'utilisateur et l'appel asynchrone à l'IA.
 */
async function handleSendMessage() {
    const userText = userInput.value.trim();
    
    if (userText === '') {
        return;
    }

    // 1. Afficher le message de l'utilisateur
    displayMessage(userText, 'user');
    userInput.value = '';

    // 2. Afficher l'indicateur de frappe de l'IA
    const iaLoadingMessage = displayMessage('loading-ia', 'ia');
    
    // 3. Appeler l'IA pour la réponse
    const iaResponse = await getDiagnosticResponse(userText);
    
    // 4. Mettre à jour le message de chargement avec la vraie réponse
    iaLoadingMessage.textContent = iaResponse;
    iaLoadingMessage.classList.remove('loading-placeholder'); 
    
    // Rendre le champ de saisie disponible à nouveau
    userInput.focus();
}

/**
 * Réinitialise la session de chat et vide l'historique visible.
 */
function handleNewDiagnosis() {
    // 1. Vide l'affichage des messages côté client
    chatMessages.innerHTML = ''; 
    
    // 2. Réinitialise l'objet chat pour vider la mémoire côté Gemini et affiche le message de bienvenue
    startNewChat(); 
}

// ---
// D. EXÉCUTION ET ÉCOUTEURS D'ÉVÉNEMENTS (DOIT VENIR EN DERNIER)
// -------------------------------------------------------------

// Démarrez la première session au chargement du script
startNewChat(); 

// Écoute des événements du formulaire
sendButton.addEventListener('click', handleSendMessage);

userInput.addEventListener('keypress', (event) => {
    if (event.key === 'Enter') {
        handleSendMessage();
    }
});

// Écouteur pour le bouton Nouveau Diagnostic
newDiagnosisButton.addEventListener('click', handleNewDiagnosis);
