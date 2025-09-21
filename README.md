🏀 Courtside: Every play, any voice - Powered by Gemini

Core Concept

An app that streams live sports updates in the style of a radio/podcast commentator. Users pick sports, teams, and players; Gemini generates real-time spoken commentary, customizable by persona (nerdy, passionate, raw data, etc.). It doubles as both entertainment and utility for fans who can’t watch the game.

⸻

🎯 MVP Features
	1.	Live Data Ingestion
	•	Pull real-time sports feeds (NBA JSON endpoints, official APIs, or reliable 3rd-party APIs).
	•	Poll every 3–5 seconds or use WebSockets if available.
	•	Cache normalized events (game states, player stats, milestones) in MongoDB Atlas.
	2.	Commentary Engine
	•	On each update/delta, Gemini generates short commentary (e.g., “Tatum nails a three—Boston stretches the lead to 8!”).
	•	Commentary tied to real data → no hallucinated stats.
	•	Supports multiple tones: nerdy (analytics-heavy), passionate (hype), raw (plain stats).
	3.	Audio Delivery
	•	TTS layer (Google Cloud TTS, Web Speech API, or ElevenLabs if allowed).
	•	Commentary streamed in near real-time (goal <1.5s latency).
	•	Dashboard shows parallel live ticker + text commentary.
	4.	Voice Q&A
	•	User speaks a query (“How close is LeBron to a triple-double?”).
	•	Pipeline: STT → intent parser → MongoDB query → stat calculation → Gemini rephrasing → TTS response.
	•	Keeps answers grounded in cached stats.

⸻

🚀 Stretch Features
	•	Multi-Voice Booth: Two or more AI commentators with distinct personalities (e.g., play-by-play + color analyst).
	•	Daily Recap Mode: Generate 1–2 minute summaries after games.
	•	Fan Q&A Feed: Type or voice questions during live games.
	•	Win Probability Models: Calculate and narrate swings in momentum.
	•	Social Layer: Share clips or recaps directly to social media.

⸻

📊 Data Sources

Primary:
	•	NBA public JSON (scoreboard, box score, play-by-play).
	•	Official league/team APIs where possible.
	•	RSS/Atom feeds for news and injury updates.

Secondary:
	•	Third-party APIs (Sportsdata.io, TheSportsDB, etc.) for breadth.
	•	Sportsbook odds feeds (for momentum context).

Fallbacks:
	•	Pre-scripted simulators to guarantee demo flow if APIs fail.

Ingestion Strategy:
	•	REST polling with ETags for efficiency.
	•	WebSocket where supported.
	•	All normalized into internal objects (Game, Event, StatLine).

⸻

🛠️ Tech Stack
	•	Frontend: Next.js + TypeScript + React + Tailwind → UI dashboard + mic controls.
	•	Backend: Express (or Flask if Python better for ingest) + Socket.IO for live pushes.
	•	Database: MongoDB Atlas (users, games, statlines, commentary cache).
	•	Real-Time Layer: Redis + BullMQ job queues for ingestion + commentary.
	•	AI: Gemini API → commentary generation, persona styling, Q&A phrasing.
	•	Speech:
	•	STT: Web Speech API or Google STT.
	•	TTS: Google Cloud TTS or Web Speech API.
	•	Deployment: Vercel (frontend) + Render/Heroku/Fly.io (backend).

⸻

🧮 Example Flows
	•	Automatic Commentary:
	1.	System ingests “Curry hits a 3-pointer.”
	2.	MongoDB updates box score.
	3.	Gemini outputs: “Steph Curry drains it from deep—Warriors cut it to 2!”
	4.	TTS plays audio, dashboard shows ticker + text.
	•	Voice Q&A:
	1.	User: “How far is Jokic from a triple-double?”
	2.	STT transcribes → query Mongo.
	3.	Response computed: needs 2 rebounds, 4 assists.
	4.	Gemini phrases: “Jokic is closing in—just 2 boards and 4 assists away from the triple-double.”
	5.	TTS plays audio back.

⸻

📅 Hackathon Roadmap

Friday Night:
	•	Set up ingestion from NBA JSON endpoints.
	•	Build Mongo schema (games, players, stats).
	•	Minimal frontend scoreboard (poll API).

Saturday:
	•	Commentary engine → Gemini prompts per event.
	•	TTS pipeline → live spoken lines.
	•	Dashboard with live commentary feed.

Saturday Night:
	•	Add voice Q&A (STT → Mongo → Gemini → TTS).
	•	Support multiple commentary styles.

Sunday:
	•	Polish demo script: live game/simulator feed, switch personas, Q&A interaction.
	•	Stretch: daily recap generator.

⸻

🏆 Hackathon Track Fit
	•	BigRedTrack (Entertainment): sports-as-entertainment, immersive and interactive.
	•	Software Track: real-time ingestion + low-latency AI pipeline.
	•	Design Track: dashboard UI/UX + smooth voice interaction.
	•	Gemini API Track: AI-generated live commentary + Q&A.
	•	MongoDB Atlas Track: real-time caching of sports feeds.

⸻

🎤 3-Min Demo Script (sample)
	1.	Show live scoreboard (or simulator).
	2.	Let Gemini commentate a play (“Curry with the 3!”).
	3.	Switch styles (nerdy → passionate → raw).
	4.	Ask voice Q: “How close is LeBron to a triple-double?”
	5.	System answers live with audio + text.
	6.	End with recap mode: “Tonight’s top highlights: Jokic triple-double, Celtics win big.”
