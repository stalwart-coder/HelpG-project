import { Router } from 'express';
import { authenticate } from '../../middleware/auth.js';
import { globalLimiter } from '../../middleware/rateLimiter.js';
import * as aiController from '../controllers/aiController.js';

const router = Router();

// AI route limiter (using global limiter — AI is expensive)
const aiLimiter = globalLimiter;

// ── Public AI status ─────────────────────────────────────────────────────────
router.get('/status', aiController.getAiStatus);

// ── Authenticated AI endpoints ───────────────────────────────────────────────
router.use(authenticate);

// POST /api/ai/enhance-task — improve task description
router.post('/enhance-task', aiLimiter, aiController.enhanceTask);

// POST /api/ai/estimate-price — get price range
router.post('/estimate-price', aiLimiter, aiController.estimatePrice);

// POST /api/ai/rank-helpers — rank helpers for a booking
router.post('/rank-helpers', aiLimiter, aiController.rankHelpers);

// POST /api/ai/assess-risk — check booking risk
router.post('/assess-risk', aiLimiter, aiController.assessRisk);

// POST /api/ai/chat-suggestion — get reply suggestion for helper
router.post('/chat-suggestion', aiLimiter, aiController.getChatSuggestion);

export default router;
