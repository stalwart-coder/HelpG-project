# HelpJi — AI Architecture & Module Documentation

## 1. Vision & Non-Functional Design
The HelpJi AI subsystem is designed around four key architectural principles:
1. **Zero Downtime Dependency**: AI service latency or provider API failures will NEVER crash or block any customer or helper operation.
2. **Provider Agnostic**: Configurable backends (OpenAI GPT-4o-mini, Google Gemini 1.5 Flash, Anthropic Claude Haiku).
3. **Hyperlocal Context**: Prompts are grounded in Indian metropolitan and tier-2 context (currency, languages, cultural norms).
4. **Structured JSON Output**: All ranking, estimation, and risk outputs enforce strict JSON schema validation.

---

## 2. Directory Layout (`backend/ai/`)

```
backend/ai/
├── controllers/
│   └── aiController.js         # REST endpoints for client AI queries
├── services/
│   └── matchingService.js      # Core business logic (enhancement, pricing, ranking)
├── routes/
│   └── aiRoutes.js             # Route registrations and rate limiting
└── utils/
    └── aiProvider.js           # Multi-provider fetch wrapper with failover
```

---

## 3. Core Capabilities

### A. Task Description Enhancement (`enhanceTaskDescription`)
* **Endpoint**: `POST /api/ai/enhance-task`
* **Input**: Raw text (e.g., "mujhe 15 kapde press karwane hai")
* **Output**: Clean, structured task description retaining original intent, translated/clarified for service providers.
* **Degradation**: Returns original raw text if provider is offline.

### B. Dynamic Price Estimation (`estimatePrice`)
* **Endpoint**: `POST /api/ai/estimate-price`
* **Input**: Category, description, city.
* **Output**:
  ```json
  {
    "minPrice": 120,
    "maxPrice": 180,
    "suggestedPrice": 150,
    "priceUnit": "per_task",
    "rationale": "Standard market rate for 15 ironed garments in Mumbai."
  }
  ```

### C. Helper Ranking Algorithm (`rankHelpersForBooking`)
* **Endpoint**: `POST /api/ai/rank-helpers`
* **Input**: `bookingId`, candidate helper IDs.
* **Logic**: Evaluates helper skills, past ratings, total jobs completed, and distance proximity against task requirements.
* **Safety Invariant**: Only returns valid IDs that were provided in the candidate list.

### D. Fraud & Risk Detection (`assessBookingRisk`)
* **Endpoint**: `POST /api/ai/assess-risk`
* **Output Levels**: `safe`, `low_risk`, `medium_risk`, `high_risk`.
* **Action**: Flags anomalous pricing, suspicious requests, or safety hazards for immediate manual admin review.

### E. Contextual Reply Suggestions (`generateChatSuggestion`)
* **Endpoint**: `POST /api/ai/chat-suggestion`
* **Target User**: Helpers communicating with customers.
* **Behavior**: Generates polite, 1-click answers (e.g., "Namaste, I have reached your building and am coming up.").

---

## 4. Testing & Verification
AI status can be verified anytime via:
```bash
curl http://localhost:5000/api/ai/status
```
Response:
```json
{
  "success": true,
  "data": {
    "available": true,
    "features": [
      "task-enhancement",
      "price-estimation",
      "helper-ranking",
      "risk-assessment",
      "chat-suggestions"
    ]
  }
}
```
