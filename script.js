// A. CONFIGURATION DE L'IA ET VARIABLES CLÉS
// ----------------------------------------------------

// 1. Importation du constructeur directement depuis le CDN
import { GoogleGenAI } from 'https://esm.run/@google/genai'; 

// ⚠️ REMPLACEZ PAR VOTRE NOUVELLE CLÉ API SÉCURISÉE ⚠️
const API_KEY = 'VOTRE_NOUVELLE_CLE_API'; 
const ai = new GoogleGenAI({ apiKey: API_KEY }); 

// Définition du rôle de l'IA (System Instruction)
const systemInstruction = `
    Vous êtes un professeur de technologie de collège en cycle 4. 
    Votre objectif est de dialoguer avec l'élève (de niveau collège) pour identifier la cause probable de sa demande en posant des questions de vérification en suivant les recommandations pédagogiques des académies française...
    
    Règles de dialogue :
    1. **Message Initial :** Commencez toujours le dialogue en demandant la classe et le Prénom exacts de l'élève, ainsi qu'une brève description de l'aide et du soutien que vous pouvez proposer.
    2. Ton message DOIT commencer par un titre clair.
    3. Pose toujours UNE SEULE question à la fois.
    4. Maintiens un ton professoral, patient et toujours encourageant et bienveillant.
    5. Base toujours ta prochaine question sur l'historique de la conversation.
    6. N'offre jamais de réponse directe à une question avant d'avoir posé au moins 3 questions de difficulté progressives.
    8. Utilise la langue de l'élève pour communiquer.
    9. Répondre toujours en français.
`;

// Déclaration de la variable de chat
let chat; 

// ---
// B. LOGIQUE DE L'INTERFACE UTILISATEUR ET DÉCLARATION DES ÉLÉMENTS HTML
// ----------------------------------------------------------------------
const chatMessages = document.getElementById('messages');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button'); 
const newDiagnosisButton = document.getElementById('new-diagnosis-button'); 

// ---
// C. DÉFINITION DES FONCTIONS
// ---------------------------------------------------------------------------

function displayMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`); 
    
    if (text === 'loading-ia') {
        messageDiv.classList.add('loading-placeholder'); 
        messageDiv.innerHTML = '<span></span><span></span><span></span>';
    } else {
        messageDiv.textContent = text;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return messageDiv;
}

/**
 * Initialise une nouvelle session de chat avec la bonne syntaxe du SDK v1
 */
function startNewChat() {
    // Correction de la syntaxe pour coller au SDK @google/genai
    chat = ai.chats.create({
        model: 'gemini-2.5-flash', 
        config: {
            systemInstruction: systemInstruction,
            // Activation des outils (recherche Google) si nécessaire
            tools: [{ googleSearch: {} }]
        }
    });
    
    // Message d'accueil initial respectant vos règles métiers
    const welcomeMessage = "**Bienvenue en classe de Technologie !**\n\nBonjour ! Quel est le chapitre que vous voulez aborder, et pourriez-vous m'indiquer votre niveau de classe et votre prénom ? Décrivez brièvement ce que vous voulez savoir.";
    displayMessage(welcomeMessage, 'ia');
}

/**
 * Appelle l'API Gemini via l'instance de chat active
 */
async function getDiagnosticResponse(userText) {
    try {
        // Syntaxe correcte pour envoyer un message dans le chat avec le nouveau SDK
        const response = await chat.sendMessage({
            message: userText
        });
        return response.text;
    } catch (error) {
        console.error("Erreur lors de l'appel à l'API Gemini :", error);
        return "Désolé, une erreur est survenue lors de la communication avec le professeur virtuel. Vérifiez la console et votre clé API.";
    }
}

async function handleSendMessage() {
    const userText = userInput.value.trim();
    if (userText === '') return;

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
    
    userInput.focus();
}

function handleNewDiagnosis() {
    chatMessages.innerHTML = ''; 
    startNewChat(); 
}

// ---
// D. EXÉCUTION ET ÉCOUTEURS D'ÉVÉNEMENTS
// -------------------------------------------------------------

// Attendre que le DOM soit chargé si le script est placé dans le <head>
document.addEventListener('DOMContentLoaded', () => {
    startNewChat(); 

    sendButton.addEventListener('click', handleSendMessage);

    userInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            handleSendMessage();
        }
    });

    if (newDiagnosisButton) {
        newDiagnosisButton.addEventListener('click', handleNewDiagnosis);
    }
});
