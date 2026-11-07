# HelpJi — REST & Real-time API Reference

## Base URL
`http://localhost:5000/api` (Production: `https://api.helpji.app/api`)

## Authentication
Protected endpoints require a standard Bearer Token in the HTTP Authorization header:
```http
Authorization: Bearer <accessToken>
```

---

## 1. Authentication Endpoints (`/api/auth`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/register` | Register customer or helper | No |
| `POST` | `/login` | Login with email/phone & password | No |
| `POST` | `/refresh-token` | Obtain new access token via refresh token | No |
| `POST` | `/logout` | Invalidate refresh token | Yes |
| `GET` | `/me` | Get authenticated user profile | Yes |
| `PATCH`| `/profile` | Update personal profile details | Yes |
| `POST` | `/send-otp` | Trigger phone OTP verification | No |
| `POST` | `/verify-otp` | Validate phone OTP | No |

---

## 2. Bookings Endpoints (`/api/bookings`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Create a new task booking | Yes (Customer) |
| `GET` | `/mine` | Get customer's booking history | Yes (Customer) |
| `GET` | `/available` | List open unassigned bookings for helpers | Yes (Helper) |
| `GET` | `/helper` | List bookings assigned to current helper | Yes (Helper) |
| `GET` | `/:id` | Get single booking details | Yes |
| `PATCH`| `/:id/status` | Helper updates task status (start, arrived, complete)| Yes (Helper) |
| `POST` | `/:id/cancel` | Cancel a booking with reason | Yes |
| `POST` | `/:id/reschedule`| Reschedule booking date/time | Yes |

---

## 3. Helper Endpoints (`/api/helpers`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/profile` | Get helper profile & statistics | Yes (Helper) |
| `PATCH`| `/profile` | Update helper profile | Yes (Helper) |
| `GET` | `/dashboard` | Helper dashboard metrics & active jobs | Yes (Helper) |
| `GET` | `/wallet` | Helper wallet balance & bank account info | Yes (Helper) |
| `POST` | `/withdraw` | Request wallet payout | Yes (Helper) |
| `GET` | `/withdrawals`| Payout transaction history | Yes (Helper) |
| `GET` | `/availability`| Check online toggle status | Yes (Helper) |
| `PATCH`| `/availability`| Toggle helper availability | Yes (Helper) |
| `GET` | `/schedule` | Get weekly working schedule | Yes (Helper) |
| `PUT` | `/schedule` | Update weekly schedule | Yes (Helper) |
| `GET` | `/service-areas`| List configured service areas | Yes (Helper) |
| `POST` | `/service-areas`| Add a new service radius area | Yes (Helper) |

---

## 4. KYC & Verification Endpoints (`/api/kyc`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/status` | Get helper KYC verification status | Yes (Helper) |
| `POST` | `/submit` | Submit full KYC application documents | Yes (Helper) |
| `POST` | `/resubmit` | Re-submit rejected KYC document | Yes (Helper) |
| `PUT` | `/bank-details`| Update bank account details | Yes (Helper) |
| `PUT` | `/upi` | Update UPI payout ID | Yes (Helper) |

---

## 5. Payments Endpoints (`/api/payments`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/create-order` | Create Razorpay payment order | Yes (Customer) |
| `POST` | `/verify` | Verify Razorpay payment signature | Yes (Customer) |
| `POST` | `/failure` | Log payment gateway failure | Yes |
| `POST` | `/refund` | Process refund for cancelled task | Yes |
| `GET` | `/history` | User payment transaction history | Yes |
| `GET` | `/:id` | Transaction details by ID | Yes |

---

## 6. Reviews & Ratings Endpoints (`/api/reviews`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/` | Submit a 1-5 star review for completed task | Yes (Customer) |
| `GET` | `/my` | Get all reviews authored by current user | Yes |
| `GET` | `/booking/:bookingId` | Get review for specific booking | Yes |
| `GET` | `/helper/:helperId` | Public reviews and rating distribution | Yes |
| `PATCH`| `/:reviewId/respond` | Helper public response to review | Yes (Helper) |

---

## 7. In-App Notifications Endpoints (`/api/notifications`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/` | List notifications with pagination | Yes |
| `GET` | `/unread-count`| Get integer count of unread alerts | Yes |
| `PATCH`| `/read-all` | Mark all notifications as read | Yes |
| `PATCH`| `/:id/read` | Mark single notification as read | Yes |
| `DELETE`| `/:id` | Delete notification | Yes |

---

## 8. Support Desk Endpoints (`/api/support`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/tickets` | Create support ticket | Yes |
| `GET` | `/tickets` | List user's support tickets | Yes |
| `GET` | `/tickets/:ticketId`| Get ticket details and reply thread | Yes |
| `POST` | `/tickets/:ticketId/reply` | Add user reply note | Yes |
| `PATCH`| `/tickets/:ticketId/close` | Close support ticket | Yes |

---

## 9. AI Module Endpoints (`/api/ai`)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/status` | Check AI subsystem availability | No |
| `POST` | `/enhance-task` | Improve customer task description | Yes |
| `POST` | `/estimate-price`| Estimate fair Indian marketplace price | Yes |
| `POST` | `/rank-helpers` | Rank candidate helpers by compatibility | Yes |
| `POST` | `/assess-risk` | Fraud and safety risk check | Yes |
| `POST` | `/chat-suggestion`| Contextual chat response for helpers | Yes |

---

## 10. Real-Time Socket.IO Channels (`ws://localhost:5000`)

### Client Events (Emit)
* `conversation:join` `(conversationId)` — Join room
* `conversation:leave` `(conversationId)` — Leave room
* `message:send` `({ conversationId, content }, ack)` — Send message
* `typing:start` `({ conversationId })` — Broadcast typing indicator
* `typing:stop` `({ conversationId })` — Broadcast typing stopped
* `messages:read` `({ conversationId })` — Mark messages as read

### Server Events (Listen)
* `message:new` `(messageObject)` — Received new chat message
* `typing:update` `({ userId, isTyping })` — Typing indicator status
* `notification:new` `(notificationObject)` — Instant push alert
