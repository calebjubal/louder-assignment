# Technical Assignment: AI Event Concierge
## Platform
Role: Full Stack Engineer Intern
Duration: 48 Hours

## The Objective
Build a functional "AI Event Concierge" that helps users plan a corporate offsite. The platform
should take a natural language description of an event and return a structured, AI-generated
venue proposal.

### 1. Core Requirements (The "Must-Haves")
#### A. AI Intelligence (Backend)
- Create an API endpoint that takes a user's natural language input (e.g., "A 10-person
leadership retreat in the mountains for 3 days with a $4k budget").
- Use an LLM API (OpenAI or Gemini) to process this and return a structured JSON
response.
- The response must include: Venue Name, Location, Estimated Cost, and a "Why it
fits" justification.
B. Data Persistence (Database)
- Store every user request and the corresponding AI suggestion in a database (e.g.,
Supabase, MongoDB, or Firebase).
- Ensure that when the page is refreshed, previous searches are still visible.
C. The Interface (Frontend)
- Input: A clean, minimal search bar or form to describe the event.
- Loading State: A clear "AI is planning..." animation or spinner while the API fetches
data.
- Results Display: A dashboard or list showing the current proposal and a history of
previous searches in professional cards.

### 2. Evaluation Criteria
- Full-Stack Flow: Can your frontend talk to your backend and successfully save/retrieve
data?
- AI Prompting: How well did you "instruct" the AI to give consistent, structured data?
- UI/UX: Is the website clean, modern, and easy to navigate?
- Deployment: Is the site live and accessible via a URL?

### 3. Submission Requirements
To be considered for the role, please submit the following:
1. Active Website Link: Provide a link to the working, deployed website (e.g., via Vercel,
Netlify, or Railway). Submissions without a working live link will not be reviewed.
2. GitHub Repository: Ensure your code is public and includes a README.md with
instructions on how to run it locally.