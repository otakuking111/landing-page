// bot.js
const chatWindow = document.getElementById('chatWindow');
const inputArea = document.getElementById('inputArea');
const userInput = document.getElementById('userInput');
const languageSelect = document.getElementById('languageSelect');
const toggleVoiceBtn = document.getElementById('toggleVoiceBtn');

let voiceEnabled = false;

// Knowledge base (expandable with more data)
const knowledgeBase = {
  greeting: {
    en: "Hello! I'm SekAI, your smart multilingual chatbot. How can I assist you today?",
    ar: "مرحباً! أنا SekAI، بوت الدردشة الذكي متعدد اللغات. كيف يمكنني مساعدتك اليوم؟",
    fr: "Bonjour! Je suis SekAI, votre chatbot multilingue intelligent. Comment puis-je vous aider aujourd'hui?",
    es: "¡Hola! Soy SekAI, tu chatbot multilingüe inteligente. ¿En qué puedo ayudarte hoy?",
    de: "Hallo! Ich bin SekAI, dein intelligenter mehrsprachiger Chatbot. Wie kann ich dir heute helfen?",
    zh: "你好！我是SekAI，你的智能多语言聊天机器人。今天我能帮你什么？",
    ru: "Здравствуйте! Я SekAI, ваш умный многоязычный чат-бот. Чем я могу помочь сегодня?",
    hi: "नमस्ते! मैं SekAI हूँ, आपका स्मार्ट बहुभाषी चैटबोट। आज मैं आपकी कैसे मदद कर सकता हूँ?"
  },
  who_is_salmane: {
    en: "Salmane ELKADDANI is the visionary developer and owner of SekAI chatbot, dedicated to building intelligent and user-friendly AI solutions.",
    ar: "سلمان القَدّاني هو المطور والرائد خلف بوت SekAI، مكرّس لبناء حلول ذكاء اصطناعي ذكية وسهلة الاستخدام.",
    fr: "Salmane ELKADDANI est le développeur visionnaire et propriétaire du chatbot SekAI, dédié à créer des solutions d'IA intelligentes et conviviales.",
    es: "Salmane ELKADDANI es el desarrollador visionario y propietario del chatbot SekAI, dedicado a construir soluciones de IA inteligentes y fáciles de usar.",
    de: "Salmane ELKADDANI ist der visionäre Entwickler und Eigentümer des SekAI-Chatbots, der sich der Entwicklung intelligenter und benutzerfreundlicher KI-Lösungen widmet.",
    zh: "Salmane ELKADDANI 是 SekAI 机器人背后的开发者和创始人，致力于打造智能且易用的 AI 解决方案。",
    ru: "Salmane ELKADDANI — визионер и разработчик чатбота SekAI, посвятивший себя созданию умных и удобных AI решений.",
    hi: "Salmane ELKADDANI SekAI चैटबोट के दृष्टिवान डेवलपर और मालिक हैं, जो बुद्धिमान और उपयोगकर्ता-अनुकूल AI समाधान बनाने के लिए समर्पित हैं।"
  }
};

// Detect language from text (very simple heuristic)
function detectLanguage(text) {
  // Arabic
  if (/[ء-ي]/.test(text)) return 'ar';
  // Cyrillic (Russian)
  if (/[А-Яа-яЁё]/.test(text)) return 'ru';
  // Chinese (Han characters)
  if (/[\u4e00-\u9fff]/.test(text)) return 'zh';
  // Hindi Devanagari
  if (/[\u0900-\u097F]/.test(text)) return 'hi';
  // Latin script default English / French / Spanish / German fallback:
  return 'en';
}

// Get reply based on input and language
function getReply(input, lang) {
  input = input.toLowerCase().trim();

  // Simple keyword matching
  if (/^(hi|hello|hey|مرحبا|bonjour|hola|hallo|नमस्ते|здравствуйте|你好)/i.test(input)) {
    return knowledgeBase.greeting[lang] || knowledgeBase.greeting.en;
  }

  if (/who.*salmane|من هو سلمان|qui est salmane|quién es salmane|wer ist salmane|салман|सालमाने/i.test(input)) {
    return knowledgeBase.who_is_salmane[lang] || knowledgeBase.who_is_salmane.en;
  }

  if (/how are you|كيف حالك|comment ça va|cómo estás|wie geht's|你好吗|как дела|कैसे हो/i.test(input)) {
    const responses = {
      en: "I'm good, thank you! How about you?",
      ar: "أنا بخير، شكراً! ماذا عنك؟",
      fr: "Je vais bien, merci! Et vous?",
      es: "Estoy bien, ¡gracias! ¿Y tú?",
      de: "Mir geht's gut, danke! Und dir?",
      zh: "我很好，谢谢！你呢？",
      ru: "У меня всё хорошо, спасибо! А у тебя?",
      hi: "मैं ठीक हूँ, धन्यवाद! आप कैसे हैं?"
    };
    return responses[lang] || responses.en;
  }

  // Default fallback
  return {
    en: "Sorry, I didn't understand that. Can you please rephrase?",
    ar: "عذراً، لم أفهم ذلك. هل يمكنك إعادة الصياغة؟",
    fr: "Désolé, je n'ai pas compris. Pouvez-vous reformuler?",
    es: "Lo siento, no entendí eso. ¿Puedes reformularlo?",
    de: "Entschuldigung, das habe ich nicht verstanden. Können Sie das bitte anders formulieren?",
    zh: "抱歉，我不明白。您能换个说法吗？",
    ru: "Извините, я не понял. Можете переформулировать?",
    hi: "माफ़ कीजिए, मैं समझ नहीं पाया। क्या आप फिर से कह सकते हैं?"
  }[lang] || "Sorry, I didn't understand that. Can you please rephrase?";
}

// Add message to chat window
function addMessage(text, sender = 'bot') {
  const messageDiv = document.createElement('div');
  messageDiv.classList.add('message', sender);
  messageDiv.textContent = text;
  chatWindow.appendChild(messageDiv);
  chatWindow.scrollTop = chatWindow.scrollHeight;
}

// Handle voice synthesis
function speak(text, lang) {
  if (!voiceEnabled) return;

  if (!window.speechSynthesis) {
    alert('Speech synthesis not supported in this browser.');
    return;
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang === 'auto' ? 'en-US' : lang;

  // Optional: select voice matching language
  const voices = window.speechSynthesis.getVoices();
  const voice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0]));
  if (voice) utterance.voice = voice;

  window.speechSynthesis.speak(utterance);
}

// Get current language selection or detect automatically
function getCurrentLanguage(text = '') {
  const selected = languageSelect.value;
  if (selected === 'auto') {
    if (text) return detectLanguage(text);
    return 'en'; // default fallback
  }
  return selected;
}

// Event: Toggle voice
toggleVoiceBtn.addEventListener('click', () => {
  voiceEnabled = !voiceEnabled;
  toggleVoiceBtn.textContent = voiceEnabled ? '🔊 Voice: ON' : '🔇 Voice: OFF';
  toggleVoiceBtn.setAttribute('aria-pressed', voiceEnabled);
});

// Event: On form submit
inputArea.addEventListener('submit', e => {
  e.preventDefault();

  const inputText = userInput.value.trim();
  if (!inputText) return;

  // Add user message
  addMessage(inputText, 'user');

  // Detect or get selected language
  const lang = getCurrentLanguage(inputText);

  // Get bot reply
  const reply = getReply(inputText, lang);

  // Add bot reply
  setTimeout(() => {
    addMessage(reply, 'bot');
    speak(reply, lang);
  }, 600);

  userInput.value = '';
  userInput.focus();
});

// Initial greeting message on load (default English)
window.addEventListener('load', () => {
  const lang = getCurrentLanguage();
  addMessage(knowledgeBase.greeting[lang] || knowledgeBase.greeting.en, 'bot');
});
