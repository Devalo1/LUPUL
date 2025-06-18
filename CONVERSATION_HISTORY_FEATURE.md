# Funcționalitatea de Conversații Salvate

## Prezentare generală

Această funcționalitate permite utilizatorilor să vadă și să gestioneze conversațiile lor salvate din sesiunile de terapie AI (psihică și fizică).

## Caracteristici implementate

### 1. Generarea automată de titluri

- **Serviciu**: `conversationTitleService.ts`
- **Funcționalitate**: Generează automat titluri în **2 cuvinte** pentru fiecare conversație
- **Metoda**: Folosește AI pentru a analiza primele mesaje ale utilizatorului și a extrage subiectul principal
- **Exemple de titluri**: "Anxietate socială", "Probleme somn", "Durere spate", "Stres muncă"

### 2. Coloana laterală cu conversații

- **Componentă**: `ConversationSidebar.tsx`
- **Funcționalitate**: Afișează lista conversațiilor salvate în format sidebar
- **Sortare**: Conversațiile sunt ordonate cronologic (cele mai recente primele)
- **Informații afișate**:
  - Titlul conversației (2 cuvinte)
  - Timpul relativ de la ultima actualizare (acum, 5m, 2h, 3z, etc.)
  - Previzualizarea ultimului mesaj
  - Numărul total de mesaje
  - Numele AI-ului (dacă este disponibil)

### 3. Butoane de navigare

- **Buton "Conversații"**: Deschide sidebar-ul cu istoricul
- **Buton "Nouă"**: Începe o conversație nouă
- **Design**: Butoane cu efect blur și transparență pentru integrare vizuală

### 4. Funcționalități interactive

- **Selectarea conversațiilor**: Click pe o conversație pentru a o încărca
- **Continuarea conversațiilor**: Poți continua orice conversație existentă
- **Conversații noi**: Începe o sesiune nouă păstrând istoricul
- **Responsive design**: Adaptarea la dispozitive mobile

## Implementare tehnică

### Serviciile utilizate

1. **`conversationTitleService`**:

   ```typescript
   // Generează titlu pentru conversație
   generateConversationTitle(messages, therapyType);

   // Curăță și validează titlul
   cleanTitle(title);
   isValidTitle(title);

   // Titluri default pe tipuri de terapie
   getDefaultTitle(therapyType);
   ```

2. **`therapyConversationService`** (extins):

   ```typescript
   // Interfața extinsă cu titlu
   interface TherapyConversation {
     // ...existing fields...
     title?: string; // Titlu generat automat
   }

   // Generarea titlului la adăugarea mesajelor
   addMessage(conversationId, message); // Auto-generează titlu
   ```

### Componenta principală

**`ConversationSidebar`**:

- Props: `isOpen`, `onClose`, `onSelectConversation`, `currentTherapyType`, `currentConversationId`
- State: `conversations`, `loading`, `error`
- Funcții: `loadConversations`, `formatDate`, `getLastMessage`, `getConversationTitle`

### Integrarea în paginile de terapie

Atât în `Psihica.tsx` cât și în `Fizica.tsx`:

```typescript
// State pentru sidebar
const [showSidebar, setShowSidebar] = useState(false);

// Funcții pentru gestionarea conversațiilor
const handleSelectConversation = async (conversation) => { ... }
const handleNewConversation = async () => { ... }

// Componenta sidebar
<ConversationSidebar
  isOpen={showSidebar}
  onClose={() => setShowSidebar(false)}
  onSelectConversation={handleSelectConversation}
  currentTherapyType="psihica|fizica"
  currentConversationId={conversationId}
/>
```

## Flux de utilizare

1. **Utilizatorul începe o conversație** → Se creează automat în Firebase
2. **După primul mesaj** → Se generează automat un titlu în 2 cuvinte
3. **Click pe butonul "Conversații"** → Se deschide sidebar-ul cu lista
4. **Selectarea unei conversații** → Se încarcă mesajele și se continuă discuția
5. **Butonul "Nouă"** → Începe o sesiune complet nouă

## Stilizare și design

- **Culori**: Gradienți adaptați pentru fiecare tip de terapie
- **Animații**: Slide-in pentru sidebar, hover effects pentru butoane
- **Tipografie**: Hierarchy clară cu titluri, subtitle și metadata
- **Responsive**: Sidebar full-width pe mobile, overlay pe desktop
- **Accessibility**: ARIA labels, focus management, keyboard navigation

## Beneficii pentru utilizatori

1. **Organizare**: Conversațiile sunt organizate automat cu titluri relevante
2. **Continuitate**: Poți continua orice conversație anterioară
3. **Istoricul**: Vezi toate discuțiile anterioare într-un format clar
4. **Context**: Previzualizarea mesajelor ajută la identificarea rapidă
5. **Flexibilitate**: Poți comuta între conversații noi și existente

## Tehnologii folosite

- **React**: Componente funcționale cu hooks
- **TypeScript**: Type safety și IntelliSense
- **Firebase Firestore**: Stocare și sincronizare în timp real
- **CSS3**: Animații, gradienți și responsive design
- **OpenAI API**: Generarea inteligentă de titluri

Această implementare oferă o experiență completă de chat cu gestionarea conversațiilor, similar cu aplicații moderne precum ChatGPT sau Claude, dar specializată pentru terapia AI.
