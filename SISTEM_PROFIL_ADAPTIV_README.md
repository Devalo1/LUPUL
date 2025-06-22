# Sistem de Profil Adaptiv AI

Un sistem inteligent care învață automat din conversații și construiește profiluri dinamice ale utilizatorilor pentru a personaliza răspunsurile AI.

## 🎯 Caracteristici Principale

- **Învățare Automată**: Extrage și învață informații din orice conversație
- **Adaptabilitate Completă**: Funcționează cu orice utilizator, nu depinde de nume hardcodate
- **Separare Strictă a Datelor**: Fiecare utilizator are profilul său complet separat
- **Personalizare Inteligentă**: Generează context adaptat pentru fiecare utilizator
- **Detecție Multi-Dimensională**: Nume, vârstă, ocupație, interese, locație, stare de spirit

## 🚀 Cum Funcționează

1. **Primește Mesaj**: Utilizatorul trimite un mesaj la AI
2. **Analizează Conținutul**: Sistemul analizează mesajul cu pattern-uri regex avansate
3. **Extrage Informații**: Identifică automat nume, vârstă, ocupație, interese, etc.
4. **Actualizează Profilul**: Salvează informațiile în profilul utilizatorului
5. **Generează Context**: Creează un context personalizat pentru AI
6. **Răspunde Adaptat**: AI-ul răspunde personalizat la profilul utilizatorului

## 📋 Exemple de Învățare

### Utilizator 1

```
Mesaj: "Salut! Mă numesc Elena și am 28 de ani."
Profil: { name: "Elena", age: 28 }

Mesaj: "Lucrez ca designer grafic și îmi place să desenez."
Profil: { name: "Elena", age: 28, occupation: "designer grafic", interests: ["desenez"] }
```

### Utilizator 2

```
Mesaj: "Bună! Sunt Mihai, am 35 de ani și sunt inginer."
Profil: { name: "Mihai", age: 35, occupation: "inginer" }

Mesaj: "Locuiesc în București și îmi place să citesc."
Profil: { name: "Mihai", age: 35, occupation: "inginer", location: "București", interests: ["citesc"] }
```

## 🛠 Implementare Tehnică

### Fișiere Principale

- `netlify/functions/ai-chat.js` - Funcția principală Netlify
- `learnFromUserMessage()` - Extrage și învață din mesaje
- `generateAdaptiveContext()` - Generează context personalizat

### Structura Profilului

```javascript
{
  name: null,                    // Numele utilizatorului
  age: null,                     // Vârsta
  occupation: null,              // Ocupația/profesia
  interests: [],                 // Lista de interese și hobby-uri
  preferences: {},               // Preferințe detectate
  context: [],                   // Contextul conversațiilor recente
  personalityTraits: [],         // Trăsături de personalitate
  location: null,                // Locația utilizatorului
  relationshipStatus: null,      // Status relațional
  lastUpdated: Date             // Data ultimei actualizări
}
```

### Pattern-uri de Detecție

#### Nume

- `"numele meu este [Nume]"`
- `"mă numesc [Nume]"`
- `"mă cheamă [Nume]"`
- `"sunt [Nume] și..."`

#### Vârstă

- `"am [X] ani"`
- `"sunt în vârstă de [X]"`
- `"[X] ani"`

#### Ocupație

- `"lucrez ca [ocupație]"`
- `"sunt [ocupație] de profesie"`
- `"sunt un/o [ocupație]"`

#### Interese

- `"îmi place să [activitate]"`
- `"îmi plac [lucruri]"`
- `"hobby-ul meu este [hobby]"`

#### Locație

- `"locuiesc în [oraș]"`
- `"sunt din [oraș]"`
- `"trăiesc în [oraș]"`

## 🔧 Configurare și Utilizare

### Instalare

```bash
# Clonează proiectul
git clone [repository-url]

# Instalează dependențele
npm install

# Configurează variabilele de mediu
# Adaugă OPENAI_API_KEY în .env
```

### Utilizare

```javascript
// Apelează funcția cu un mesaj și userId
const response = await fetch("/.netlify/functions/ai-chat", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    prompt: "Salut! Mă numesc Ana și am 25 de ani.",
    assistantName: "Aria",
    addressMode: "informal",
    userId: "user_123", // ID unic pentru fiecare utilizator
  }),
});

const data = await response.json();
console.log(data.reply); // Răspunsul personalizat al AI-ului
console.log(data.userProfile); // Profilul învățat (pentru debugging)
```

## 🧪 Testare

### Test Local

```bash
# Rulează testul local (fără API OpenAI)
node test-profil-adaptiv-local.cjs
```

### Test Complet

```bash
# Rulează testul cu API OpenAI (necesită cheia API)
node test-sistem-profil-adaptiv.js
```

### Demonstrație

```bash
# Arată funcționalitatea sistemului
node demo-sistem-profil-adaptiv.cjs
```

## ✅ Validare și Teste

Sistemul a fost testat cu:

- ✅ Utilizatori cu nume diferite
- ✅ Vârste variate (13-100 ani)
- ✅ Ocupații diverse
- ✅ Interese multiple
- ✅ Locații diferite
- ✅ Stări de spirit variate
- ✅ Separarea strictă a datelor între utilizatori
- ✅ Contextualizare adaptivă

## 🔒 Securitate și Separare Date

- **Stocare Separată**: Fiecare utilizator are un Map separat bazat pe userId
- **Nu Există Cross-Contamination**: Datele unui utilizator nu se amestecă cu ale altuia
- **Validare Input**: Pattern-uri regex sigure care evită injecțiile
- **Limitări Memorie**: Păstrează doar ultimele 10 contexte și 20 mesaje

## 🌟 Beneficii

1. **Personalizare Reală**: AI-ul răspunde adaptat la fiecare utilizator
2. **Învățare Progresivă**: Devine mai bun cu timpul
3. **Scalabilitate**: Funcționează cu orice număr de utilizatori
4. **Flexibilitate**: Nu depinde de configurări hardcodate
5. **Eficiență**: Pattern-uri optimizate pentru performanță

## 🚀 Status

**SISTEM GATA PENTRU PRODUCȚIE!**

Sistemul de profil adaptiv este complet implementat și testat. Poate fi utilizat imediat în producție pentru a oferi experiențe personalizate utilizatorilor.

---

_Dezvoltat pentru a oferi interacțiuni AI personalizate și adaptive pentru orice utilizator._
