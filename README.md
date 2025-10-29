# 🏀 NBA PSA Card Synthetic Generator Agent

This is **Challenge 4** in the NBA PSA Card Analyzer series. This iteration enhances the LangGraph-driven agent to **generate synthetic PSA cards with professional audio narration**, while maintaining full LangSmith tracing for workflow visibility.

> Built with **Next.js**, **TypeScript**, **Tailwind**, and powered by **Google Gemini**, **CLIP**, and **Pg-vector**.

Add card:
![App Screenshot](./public/landing.png)

Synthetic Card Generation and Audio Narration:
![Search Screenshot](./public/synth-gen.png)


## 🚀 What's new in Challenge 4

- **Synthetic card generation**: generates a dummy PSA card preserving the original card format  
- **Environment rendering**: synthetic cards are visualized in realistic environments (on a desk, among other cards, etc.)  
- **Professional audio narration**: generates high-quality audio describing the card  
- **Two new LangGraph tools** added to handle document generation and audio synthesis  
- **Updated UI** to display the generated synthetic card alongside extracted card data  

---

### ✅ Features

- 📥 **Persist scanned PSA cards** (structured JSON + image)  
- 🧠 **Text embedding generation** from extracted label metadata (player, brand, year)  
- 🖼️ **Image embedding generation** using CLIP encoder  
- 🔍 **Hybrid similarity search** (text → text + text → image)  
- ⚙️ **Custom weighting** of text/image similarity scores  
- 💬 **Chat interface** to search cards with natural language  
- 🗃️ **Vector storage in PostgreSQL with pgvector**  
- 🎨 **Synthetic card generation** with realistic environment rendering  
- 🎙️ **Professional audio narration** of card descriptions  

---

## 🏗️ Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) (App Router, TypeScript)
- **AI Integration:** [Vercel AI SDK](https://sdk.vercel.ai/docs), Google Gemini
- **Database:** PostgreSQL with [pgvector](https://github.com/pgvector/pgvector)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **Embeddings:**
  - Text: Google and OpenAI Embedding API
  - Image: CLIP (via `@xenova/transformers`)
- **Agent Orchestration:** LangGraph (`@langchain/langgraph`)  
- **Tracing & Debugging:** LangSmith (`langsmith` npm package)  
- **Synthetic Generation Tools:** Image + Audio generation nodes   
---

## 🔐 Environment Variables

To run the project locally, create a `.env.local` file in the root directory and add the following:

```
GOOGLE_GENERATIVE_AI_API_KEY=your_google_gemini_api_key_here
DATABASE_URL=postgresql://username:password@host:port/dbname
LANGCHAIN_API_KEY=your_langsmith_api_key_here
```
