# DataDecoder

DataDecoder is a full-stack web application for automated data analysis and explainable machine learning. Upload a CSV, and the app profiles your dataset, runs correlation analysis, segments data into clusters, and generates a plain-English AI narrative — all without writing a single line of code.

---

## Features

**Dataset Upload** - CSV file upload with automated validation and preview.

**Data Profiling** - Per-column statistical summaries: types, min/max, mean, mode, and null rates.

**Correlation Analysis** - Pearson and Spearman heatmaps. Set a target column to unlock Random Forest feature importance.

**K-Means Clustering** - Automatically selects the best k via silhouette score. Skips clustering when no meaningful structure is found.

**AI Narrative** - An LLM reads your analysis results and writes a structured, plain-English report.

**PDF Export** - Download the AI-generated report as a formatted PDF.

---

## Tech Stack

### Frontend

- **React 19** - UI framework
- **Tailwind CSS 4** - Styling
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **ReactMarkdown** - Rendering AI-generated markdown

### Backend

- **FastAPI** - API framework
- **Pandas / NumPy** - Data manipulation
- **Scikit-learn** - Correlation, clustering, and feature importance
- **ReportLab** - PDF generation
- **Python-dotenv** - Environment variable management

---

## Getting Started

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create a `.env` file in the project root:

```env
OPENROUTER_API_KEY=your_key_here
```

Start the server:

```bash
uvicorn backend.main:app --reload
```

The API will be available at `http://localhost:8000`.

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Reference

All endpoints accept and return JSON unless otherwise noted.

**POST `/api/upload`** - Upload a CSV file. Returns a session ID, column names, row count, and a 5-row preview.

**POST `/api/profile`** - Run column-level statistical profiling for the given session.

**POST `/api/correlation`** - Compute Pearson and Spearman correlation matrices. Pass a `target` field to also return Random Forest feature importance.

**POST `/api/clustering`** - Run K-Means clustering with automatic k selection via silhouette score.

**POST `/api/explain`** - Build a prompt from all analysis results and return an LLM-generated narrative.

**POST `/api/report`** - Generate and return the AI narrative as a downloadable PDF.

---

## Analysis Pipeline

```
Upload CSV
-> Profile (types, nulls, stats)
-> Correlation (Pearson + Spearman + optional feature importance)
-> Clustering (K-Means, silhouette-selected k)
-> Explain (LLM prompt built from all results)
-> PDF Export
```

---

## Environment Variables

**`OPENROUTER_API_KEY`** - API key for OpenRouter, used by the AI service.

**`VITE_API_URL`** - Backend base URL consumed by the frontend. Defaults to `http://localhost:8000/api` if not set.

---

## Notes

- The backend holds session data in memory. Restarting the server clears all sessions. If deployed on a free-tier host such as Render, sessions may be lost after inactivity-triggered restarts.
- Clustering is automatically skipped when the silhouette score falls below 0.08, preventing the reporting of meaningless segments.
- Feature importance requires a target column to be selected at upload time.

---

## License

This project is licensed under the MIT License.
