# AI Therapy Chat System

## Overview

The AI therapy chat system has been successfully integrated into the TypeScript React application using OpenAI's GPT-3.5-turbo model. The system provides specialized AI therapists for different therapy types.

## Features

### 1. General Therapy Page (`/terapie`)

- General-purpose therapy AI assistant
- Navigation buttons to specialized therapy pages
- Comprehensive therapy support and guidance

### 2. Psychological Therapy Page (`/terapie/psihica`)

- Specialized psychological counseling AI
- Focuses on mental health, emotional well-being, and psychological support
- Trained to provide empathetic and professional psychological guidance

### 3. Physical Therapy Page (`/terapie/fizica`)

- Specialized physical therapy and wellness AI
- Focuses on movement, exercise, rehabilitation, and physical health
- Provides guidance on fitness, rehabilitation exercises, and physical wellness

## Technical Implementation

### Environment Variables

- **File**: `.env.local`
- **Variable**: `VITE_OPENAI_API_KEY`
- **Format**: Must start with `VITE_` prefix for Vite to inject it into the application

### Core Components

1. **OpenAI Service** (`src/services/openaiService.ts`)

   - Handles API communication with OpenAI
   - Manages authentication and request formatting
   - Error handling and response processing

2. **Therapy Components**

   - `src/pages/terapie/Terapie.tsx` - Main therapy page
   - `src/pages/terapie/Psihica.tsx` - Psychological therapy
   - `src/pages/terapie/Fizica.tsx` - Physical therapy

3. **Styling** (`src/assets/styles/terapie-chat.css`)
   - Responsive chat interface
   - Modern UI design
   - Consistent styling across all therapy pages

### Configuration

- **Vite Config** (`vite.config.ts`) - Enhanced to properly expose environment variables
- **Routes** (`src/routes/appRoutes.tsx`) - Lazy-loaded therapy pages

## Usage

1. **Start the development server**:

   ```bash
   npm run dev
   ```

2. **Access the therapy pages**:

   - General therapy: `http://localhost:3000/terapie`
   - Psychological therapy: `http://localhost:3000/terapie/psihica`
   - Physical therapy: `http://localhost:3000/terapie/fizica`

3. **Using the chat**:
   - Type your message in the input field
   - Click "Trimite" to send the message
   - The AI will respond based on the specialized context of each page

## Key Fixes Applied

1. **Environment Variable Encoding**: Fixed UTF-16/UTF-8 encoding issue in `.env.local`
2. **Vite Configuration**: Enhanced to properly inject `VITE_OPENAI_API_KEY`
3. **Import Statements**: Updated to use double quotes for ESLint compliance
4. **Error Handling**: Improved error messages and debugging capabilities
5. **CSS Organization**: Moved inline styles to external CSS file

## Security Notes

- The OpenAI API key is securely stored in environment variables
- Client-side requests are made directly to OpenAI (consider proxy for production)
- Environment variables are only available in the browser (prefixed with `VITE_`)

## Dependencies

- **axios**: HTTP client for API requests
- **react**: UI framework
- **OpenAI API**: GPT-3.5-turbo model for AI responses

The system is now fully functional and ready for testing and production use!
