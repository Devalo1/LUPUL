# AI Messenger Components Documentation

## Componente AI în aplicație

Aplicația conține două componente principale pentru interacțiunea cu AI:

### 1. 🎯 **AIAssistantWidget** (Widget Floating)

**Locație:** `src/components/AIAssistantWidget.tsx`
**Descriere:** Widget floating care se afișează pe toate paginile aplicației (exceptând `/ai-messenger`)

**Caracteristici:**

- Buton floating în colțul din dreapta jos
- Chat compact în popup
- Istoric conversații
- Se ascunde automat pe pagina dedicată AI Messenger
- Personalizare nume AI din setări

### 2. 🚀 **AIMessenger** (Pagină Dedicată)

**Locație:** `src/pages/ai/AIMessenger.tsx`
**Rută:** `/ai-messenger`
**Descriere:** Interfață elegantă full-screen pentru conversații AI

**Caracteristici:**

- ✅ Layout elegant cu 2 coloane (sidebar minimizat + chat principal)
- ✅ Background gradient animat cu efecte floating
- ✅ Header cu avatar animat și status indicator
- ✅ Message bubbles cu animații de slide-in
- ✅ Typing indicator cu puncte animate
- ✅ Input area modernă cu textarea
- ✅ Send button circular cu gradient și hover effects
- ✅ Empty state elegant cu mesaj de întâmpinare
- ✅ Conversation history cu numerotare (#1, #2, #3)
- ✅ Responsive design pentru mobile
- ✅ Custom scrollbar cu gradient
- ✅ GPU acceleration pentru animații fluide
- ✅ Glassmorphism effects cu backdrop blur

## Diferențe principale

| Feature             | AIAssistantWidget   | AIMessenger             |
| ------------------- | ------------------- | ----------------------- |
| **Tip**             | Widget floating     | Pagină dedicată         |
| **Layout**          | Compact popup       | Full-screen elegant     |
| **Afișare**         | Pe toate paginile\* | Doar pe `/ai-messenger` |
| **Design**          | Simplu, funcțional  | Elegant, animat         |
| **Funcționalitate** | Chat rapid          | Experiență completă     |

\*Se ascunde automat pe pagina `/ai-messenger`

## Routing și Integrare

```tsx
// App.tsx - Widget floating global
<AIAssistantWidget /> // Se afișează pe toate paginile

// appRoutes.tsx - Pagină dedicată
<Route path="/ai-messenger" element={<AIMessenger />} />
```

## Personalizare AI

Ambele componente folosesc același sistem de personalizare:

- **aiNameUtils.ts** pentru numele AI
- **userAIProfileService** pentru configurare avansată
- **localStorage** pentru setări utilizator

## CSS și Styling

- **AIAssistantWidget.css** - Stiluri pentru widget compact
- **AIMessenger.css** - Stiluri elegante pentru pagina dedicată
  - Gradient backgrounds
  - Keyframe animations
  - Glassmorphism effects
  - Mobile responsive

## Recomandări de utilizare

1. **Widget-ul** pentru întrebări rapide și conversații scurte
2. **Pagina dedicată** pentru conversații lungi și experiență imersivă
3. Utilizatorii pot naviga între cele două opțiuni în funcție de nevoi

---

Ambele componente sunt complet funcționale și integrate cu sistemul de autentificare și AI din aplicație.
