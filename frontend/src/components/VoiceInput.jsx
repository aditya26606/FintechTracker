import React, { useState, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const VoiceInput = ({ onParsed }) => {
  const [isListening, setIsListening] = useState(false);
  const { showToast } = useToast();
  const [recognition, setRecognition] = useState(null);

  
  const categoryRules = {
    Food: ["grocery", "food", "restaurant", "cafe", "snack", "drink", "lunch", "dinner", "breakfast", "burger", "pizza", "starbucks", "eat", "coffee", "tea"],
    Travel: ["taxi", "uber", "bus", "subway", "train", "fuel", "cab", "ola", "metro", "petrol", "ride", "auto", "flight", "ticket"],
    Bills: ["electricity", "water", "gas", "internet", "phone", "recharge", "bill", "broadband", "mobile", "rent", "insurance"],
    Entertainment: ["movie", "cinema", "concert", "game", "netflix", "spotify", "book", "show", "pub", "club", "party"],
    Healthcare: ["doctor", "medicine", "pharmacy", "hospital", "vitamin", "health", "gym", "clinic", "dental"],
    Education: ["school", "college", "book", "course", "tutor", "fees", "stationery", "exam"],
    Shopping: ["cloth", "shirt", "pants", "shoes", "mall", "amazon", "flipkart", "grocery", "gift", "watch"],
    Others: []
  };

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;

      rec.onstart = () => {
        setIsListening(true);
        showToast('Listening... Speak your expense description and amount.', 'info');
      };

      rec.onend = () => {
        setIsListening(false);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        parseSpeech(transcript);
      };

      setRecognition(rec);
    }
  }, [showToast]);

  const toggleListening = () => {
    if (!recognition) {
      showToast('Speech Recognition API not supported in this browser.', 'error');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      recognition.start();
    }
  };

  const categorizeExpense = (desc) => {
    const text = desc.toLowerCase();
    for (const [cat, keywords] of Object.entries(categoryRules)) {
      if (keywords.some(word => text.includes(word))) {
        return cat;
      }
    }
    return "Others";
  };

  const parseSpeech = (transcript) => {
    showToast(`Voice heard: "${transcript}"`, 'info');

    
    let parsedAmount = null;
    const numericMatch = transcript.match(/(?:rs\.?|rupees?|spent|cost|of)?\s*(\d+(?:\.\d{1,2})?)/i);
    
    if (numericMatch) {
      parsedAmount = parseFloat(numericMatch[1]);
    } else {
      
      const wordsToNumbers = {
        "one": 1, "two": 2, "three": 3, "four": 4, "five": 5, "six": 6, "seven": 7, "eight": 8, "nine": 9, "ten": 10,
        "twenty": 20, "thirty": 30, "forty": 40, "fifty": 50, "sixty": 60, "seventy": 70, "eighty": 80, "ninety": 90,
        "hundred": 100, "thousand": 1000
      };
      const words = transcript.toLowerCase().split(/\s+/);
      let tempSum = 0;
      let foundNumber = false;
      for (const w of words) {
        if (wordsToNumbers[w]) {
          foundNumber = true;
          if (w === "hundred") {
            tempSum = (tempSum || 1) * 100;
          } else if (w === "thousand") {
            tempSum = (tempSum || 1) * 1000;
          } else {
            tempSum += wordsToNumbers[w];
          }
        }
      }
      if (foundNumber && tempSum > 0) {
        parsedAmount = tempSum;
      }
    }

    const autoCat = categorizeExpense(transcript);
    
    
    let cleanedDesc = transcript;
    const removePatterns = [
      /spent\s+\d+(?:\.\d{1,2})?\s*(?:rupees?|rs)?\s*(?:on|for)?/i,
      /cost\s+\d+(?:\.\d{1,2})?\s*(?:rupees?|rs)?\s*(?:on|for)?/i,
      /rupees?\s+\d+(?:\.\d{1,2})?\s*(?:on|for)?/i,
      /rs\.?\s+\d+(?:\.\d{1,2})?\s*(?:on|for)?/i,
      /\d+(?:\.\d{1,2})?\s*(?:rupees?|rs)?\s*(?:on|for)?/i
    ];
    for (const pattern of removePatterns) {
      cleanedDesc = cleanedDesc.replace(pattern, '');
    }
    
    cleanedDesc = cleanedDesc.replace(/on/i, '').replace(/for/i, '').replace(/spent/i, '').trim();
    if (cleanedDesc.length > 0) {
      cleanedDesc = cleanedDesc.charAt(0).toUpperCase() + cleanedDesc.slice(1);
    } else {
      cleanedDesc = "Voice logged expense";
    }

    if (parsedAmount && parsedAmount > 0) {
      onParsed({
        amount: parsedAmount,
        category: autoCat,
        description: cleanedDesc
      });
      showToast(`Parsed: ₹${parsedAmount} for ${autoCat}`, 'success');
    } else {
      showToast('Could not extract amount from voice command. Try again.', 'warning');
    }
  };

  return (
    <button
      type="button"
      onClick={toggleListening}
      className={`p-3 rounded-xl border transition-all duration-300 flex items-center justify-center gap-2 font-medium
        ${isListening 
          ? 'bg-rose-500/20 border-rose-500 text-rose-400 listening-pulse' 
          : 'bg-slate-800/50 border-slate-700/50 text-textSecondary hover:text-textPrimary hover:border-slate-600'
        }
      `}
      title="Voice Input (Speak expense description and amount)"
    >
      {isListening ? (
        <>
          <MicOff size={18} />
          <span>Stop Listening</span>
        </>
      ) : (
        <>
          <Mic size={18} />
          <span>Voice Log</span>
        </>
      )}
    </button>
  );
};

export default VoiceInput;
