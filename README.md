# 🚀 FormGuard – Clean Your Form Data Before It Hits Your CRM

> A backend service that filters spam and low-quality form submissions before forwarding them to your CRM, email, or webhook.

---

## ❌ Problem

Most websites that use contact forms or lead forms suffer from:

* Spam submissions (bots)
* Fake or disposable emails
* Low-quality or empty messages
* Flood attacks

This results in:

* Polluted CRM data
* Wasted time filtering leads manually
* Poor decision making

---

## ✅ Solution

FormGuard acts as a **filtering layer** between your form input and your final destination.

It ensures that only **clean, validated, high-quality data** reaches your CRM or inbox.

---

## ⚙️ How It Works

```text
[Form Submission]
        ↓
[Webhook / Email Receiver]
        ↓
[Parsing & Normalization]
        ↓
[Spam Detection Engine]
        ↓
[Clean Data Router]
        ↓
[Destination (CRM / Email / Webhook)]
```

---

## 🧠 Features

* 📥 Webhook-based form ingestion
* 📧 Email parsing support (IMAP / SMTP)
* 🧹 Spam scoring system
* ⚡ Rate limiting & bot protection
* 🔍 Field validation & normalization
* 🔁 Data forwarding (Webhook / Email / CRM)
* 🪵 Logging & monitoring

---

## 🛠 Tech Stack

* **Backend:** Node.js (Express / Fastify)
* **Database:** MongoDB / PostgreSQL
* **Queue (optional):** Redis + BullMQ
* **Auth:** JWT
* **Email Parsing:** Mailparser

---

## 📡 API Example

### POST /api/submit

```json
{
  "email": "test@example.com",
  "message": "Hello, I am interested in your service"
}
```

### Response

```json
{
  "status": "accepted",
  "score": 2
}
```

---

## 🧪 Spam Detection Logic (Example)

Each submission is assigned a **spam score**:

| Condition           | Score |
| ------------------- | ----- |
| Disposable email    | +5    |
| Empty message       | +3    |
| Too many requests   | +10   |
| Suspicious keywords | +4    |

👉 If total score exceeds threshold → **Rejected**

---

## 📁 Project Structure (Example)

```bash
src/
 ├── controllers/
 ├── services/
 │    ├── spamEngine.js
 │    ├── parser.js
 │    └── router.js
 ├── routes/
 ├── middleware/
 ├── models/
 ├── utils/
 └── app.js
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/formguard.git
cd formguard
```

### 2. Install dependencies

```bash
npm install
```

### 3. Setup environment variables

Create a `.env` file:

```env
PORT=5000
DB_URI=your_database_uri
JWT_SECRET=your_secret
```

### 4. Run the server

```bash
npm run dev
```

---

## 📸 Demo

*Add screenshots or Loom video here*

---

## 📌 Future Improvements

* 🤖 AI-based spam detection
* 📊 Dashboard & analytics
* 🔗 CRM integrations (HubSpot, Salesforce)
* 📩 Email auto-responder
* 🧠 Learning-based filtering

---

## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## 📄 License

MIT License

---

## 💡 Author

Built by Samiran Rai — backend developer & SaaS builder.
