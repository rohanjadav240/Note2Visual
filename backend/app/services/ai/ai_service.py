"""AI Service abstraction — supports multiple providers or demo mode."""

import json
import re
import logging
from typing import Optional
from app.core.config import settings

logger = logging.getLogger(__name__)


class AIService:
    """Configurable AI service for content analysis and lesson generation."""

    def __init__(self):
        self.provider = settings.ai_provider
        self.api_key = settings.get_ai_api_key()
        self.model = settings.get_ai_model()

    @property
    def is_demo_mode(self) -> bool:
        return self.provider == "demo" or not self.api_key

    async def generate_lesson(self, extracted_content: dict, options: dict) -> dict:
        """Generate a structured lesson from extracted document content."""
        if self.is_demo_mode:
            return self._generate_demo_lesson(extracted_content, options)

        prompt = self._build_lesson_prompt(extracted_content, options)

        try:
            response = await self._call_provider(prompt)
            lesson_data = self._parse_json_response(response)
            validated = self._validate_lesson(lesson_data, extracted_content)
            return validated
        except Exception as e:
            logger.error(f"AI generation failed: {e}")
            raise

    async def _call_provider(self, prompt: str) -> str:
        """Call the configured AI provider."""
        if self.provider == "openai":
            return await self._call_openai(prompt)
        elif self.provider == "anthropic":
            return await self._call_anthropic(prompt)
        elif self.provider == "google":
            return await self._call_google(prompt)
        else:
            raise ValueError(f"Unknown AI provider: {self.provider}")

    async def _call_openai(self, prompt: str) -> str:
        import httpx
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api.openai.com/v1/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json"
                },
                json={
                    "model": self.model,
                    "messages": [
                        {"role": "system", "content": "You are an expert educational content creator. Generate structured lesson data in valid JSON format."},
                        {"role": "user", "content": prompt}
                    ],
                    "temperature": 0.3,
                    "max_tokens": 8000
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def _call_anthropic(self, prompt: str) -> str:
        import httpx
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": self.api_key,
                    "Content-Type": "application/json",
                    "anthropic-version": "2023-06-01"
                },
                json={
                    "model": self.model,
                    "max_tokens": 8000,
                    "messages": [
                        {"role": "user", "content": prompt}
                    ],
                    "system": "You are an expert educational content creator. Generate structured lesson data in valid JSON format."
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["content"][0]["text"]

    async def _call_google(self, prompt: str) -> str:
        import httpx
        async with httpx.AsyncClient(timeout=120.0) as client:
            response = await client.post(
                f"https://generativelanguage.googleapis.com/v1beta/models/{self.model}:generateContent?key={self.api_key}",
                headers={"Content-Type": "application/json"},
                json={
                    "contents": [{"parts": [{"text": prompt}]}],
                    "generationConfig": {"temperature": 0.3, "maxOutputTokens": 8000}
                }
            )
            response.raise_for_status()
            data = response.json()
            return data["candidates"][0]["content"]["parts"][0]["text"]

    def _build_lesson_prompt(self, extracted_content: dict, options: dict) -> str:
        text = extracted_content.get("text", "")
        # Truncate very long texts
        if len(text) > 15000:
            text = text[:15000] + "\n\n[Content truncated for processing]"

        level = options.get("explanation_level", "intermediate")
        subject = options.get("subject", "auto-detect")

        return f"""Analyze the following educational document and generate a structured lesson.

EXPLANATION LEVEL: {level}
SUBJECT: {subject}

DOCUMENT CONTENT:
---
{text}
---

Generate a JSON response with this exact structure:
{{
  "title": "Lesson title based on content",
  "subject": "Detected or provided subject",
  "learning_objectives": ["objective 1", "objective 2", ...],
  "chapters": [
    {{
      "id": "ch1",
      "title": "Chapter title",
      "overview": "Brief chapter overview",
      "source_pages": [1, 2],
      "topics": [
        {{
          "id": "t1",
          "title": "Topic title",
          "overview": "Topic overview",
          "concepts": [
            {{
              "id": "c1",
              "title": "Concept name",
              "short_explanation": "One-line explanation",
              "detailed_explanation": "Full paragraph explanation",
              "examples": ["Example 1"],
              "source_page": 1,
              "importance": "high",
              "related_concepts": ["c2"]
            }}
          ],
          "key_takeaways": ["Key point 1"],
          "review_questions": [
            {{
              "id": "q1",
              "question": "Review question",
              "options": ["Option A", "Option B", "Option C", "Option D"],
              "correct_answer": 0,
              "explanation": "Why this is correct"
            }}
          ]
        }}
      ]
    }}
  ],
  "recommended_pattern": "mind_map"
}}

RULES:
- Base all content on the source document. Do not invent facts.
- Include source_page references where identifiable.
- Generate at least 2 review questions per topic.
- Recommended_pattern should be one of: mind_map, flowchart, storyboard, timeline, comparison, concept_network, infographic, lesson_cards, math_explanation, system_architecture
- Keep explanations appropriate for the {level} level.
- Return ONLY valid JSON, no markdown code fences."""

    def _parse_json_response(self, response: str) -> dict:
        """Parse JSON from AI response, handling code fences."""
        text = response.strip()
        # Remove markdown code fences if present
        if text.startswith("```"):
            text = re.sub(r"^```(?:json)?\s*\n?", "", text)
            text = re.sub(r"\n?```\s*$", "", text)
        return json.loads(text)

    def _validate_lesson(self, lesson_data: dict, source: dict) -> dict:
        """Basic validation of AI-generated lesson structure."""
        required = ["title", "chapters"]
        for field in required:
            if field not in lesson_data:
                raise ValueError(f"Missing required field: {field}")

        if not lesson_data["chapters"]:
            raise ValueError("Lesson must have at least one chapter")

        for chapter in lesson_data["chapters"]:
            if "id" not in chapter:
                chapter["id"] = f"ch{lesson_data['chapters'].index(chapter) + 1}"
            if "topics" not in chapter:
                chapter["topics"] = []
            for topic in chapter["topics"]:
                if "id" not in topic:
                    topic["id"] = f"t{chapter['topics'].index(topic) + 1}"
                if "concepts" not in topic:
                    topic["concepts"] = []

        if "learning_objectives" not in lesson_data:
            lesson_data["learning_objectives"] = []
        if "subject" not in lesson_data:
            lesson_data["subject"] = ""

        return lesson_data

    def _generate_demo_lesson(self, extracted_content: dict, options: dict) -> dict:
        """Generate a demo lesson from actual extracted content without an AI provider.
        
        This parses the document structure and creates a lesson from real content,
        clearly labelled as demo-mode output.
        """
        text = extracted_content.get("text", "")
        pages = extracted_content.get("pages", [])
        metadata = extracted_content.get("metadata", {})
        title = metadata.get("title", "Untitled Document")

        # Build chapters from page headings or content blocks
        chapters = []
        current_chapter_topics = []
        
        # Split text into sections by headings or double newlines
        sections = self._split_into_sections(text, pages)
        
        for i, section in enumerate(sections[:6]):  # Limit to 6 sections
            concepts = []
            sentences = [s.strip() for s in section["content"].split(". ") if len(s.strip()) > 20]
            
            for j, sentence in enumerate(sentences[:5]):  # Max 5 concepts per topic
                concepts.append({
                    "id": f"c{i+1}_{j+1}",
                    "title": sentence[:80] + ("..." if len(sentence) > 80 else ""),
                    "short_explanation": sentence[:200],
                    "detailed_explanation": sentence,
                    "examples": [],
                    "source_page": section.get("page", i + 1),
                    "importance": "high" if j == 0 else "medium",
                    "related_concepts": []
                })

            topic = {
                "id": f"t{i+1}",
                "title": section["heading"] or f"Section {i+1}",
                "overview": section["content"][:200],
                "concepts": concepts,
                "key_takeaways": [sentences[0]] if sentences else ["Review this section"],
                "review_questions": [{
                    "id": f"q{i+1}_1",
                    "question": f"What is the main idea of '{section['heading'] or f'Section {i+1}'}'?",
                    "options": [
                        concepts[0]["short_explanation"][:80] if concepts else "Option A",
                        "This section is not covered in the material",
                        "None of the above",
                        "All of the above"
                    ],
                    "correct_answer": 0,
                    "explanation": "Based on the source content from this section."
                }]
            }
            current_chapter_topics.append(topic)

        if current_chapter_topics:
            chapters.append({
                "id": "ch1",
                "title": title,
                "overview": text[:300] if text else "Document content overview",
                "topics": current_chapter_topics,
                "source_pages": list(range(1, min(len(pages) + 1, 11)))
            })

        return {
            "title": title,
            "subject": options.get("subject", "General"),
            "learning_objectives": [
                f"Understand the key concepts from '{title}'",
                "Review important definitions and relationships",
                "Apply knowledge through review questions"
            ],
            "chapters": chapters,
            "recommended_pattern": self._recommend_pattern(text),
            "_demo_mode": True,
            "_demo_notice": "This lesson was generated in demo mode from document structure without AI analysis. Configure an AI provider for full lesson generation."
        }

    def _split_into_sections(self, text: str, pages: list) -> list:
        """Split document into logical sections."""
        sections = []
        
        # Try using page headings first
        for page in pages:
            if page.get("headings"):
                for heading in page["headings"]:
                    sections.append({
                        "heading": heading["text"],
                        "content": page["text"],
                        "page": page["page_number"]
                    })
                    break  # One section per page
            elif page.get("text", "").strip():
                first_line = page["text"].strip().split("\n")[0]
                sections.append({
                    "heading": first_line[:100] if len(first_line) < 100 else "",
                    "content": page["text"],
                    "page": page["page_number"]
                })

        # If no sections found, split by paragraphs
        if not sections:
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            for i, para in enumerate(paragraphs[:6]):
                first_line = para.split("\n")[0]
                sections.append({
                    "heading": first_line[:100] if len(first_line) < 100 else f"Section {i+1}",
                    "content": para,
                    "page": 1
                })

        return sections

    def _recommend_pattern(self, text: str) -> str:
        """Simple content-aware pattern recommendation."""
        text_lower = text.lower()
        
        # Check for timeline/chronological markers
        time_words = ["century", "year", "era", "period", "timeline", "history", "chronolog"]
        if any(w in text_lower for w in time_words):
            return "timeline"

        # Check for mathematical content
        math_markers = ["equation", "theorem", "proof", "formula", "∫", "∑", "=", "derivative"]
        math_count = sum(1 for m in math_markers if m in text_lower)
        if math_count >= 2:
            return "math_explanation"

        # Check for process/workflow content
        process_words = ["step", "process", "procedure", "algorithm", "workflow", "first", "then", "finally"]
        if sum(1 for w in process_words if w in text_lower) >= 3:
            return "flowchart"

        # Check for comparison content
        compare_words = ["compare", "contrast", "versus", "vs", "difference", "similarity", "advantage", "disadvantage"]
        if any(w in text_lower for w in compare_words):
            return "comparison"

        # Check for system/architecture content
        sys_words = ["system", "architecture", "component", "module", "server", "client", "database", "api"]
        if sum(1 for w in sys_words if w in text_lower) >= 3:
            return "system_architecture"

        # Default to mind map for general content
        return "mind_map"

    async def generate_audio_script(self, lesson_data: dict, mode: str = "lecture") -> dict:
        """Generate a complete audio lesson script with timestamps and speaker notes."""
        title = lesson_data.get("title", "Study Lesson")
        summary = lesson_data.get("summary", "")
        chapters = lesson_data.get("chapters", [])
        
        sections = []
        full_script_lines = []

        # Intro Section
        intro_text = (
            f"Welcome to this Note2Visual audio lesson on {title}. "
            f"{summary} Today, we'll break down the core mechanisms, key definitions, and practical takeaways."
        )
        sections.append({
            "speaker": "Host",
            "topic_title": "Introduction & Overview",
            "text": intro_text,
            "timestamp_estimate": 0
        })
        full_script_lines.append(intro_text)

        elapsed = 15

        for ch in chapters:
            for top in ch.get("topics", []):
                t_title = top.get("title", "")
                t_overview = top.get("overview", "")
                concepts = top.get("concepts", [])

                concept_explanations = []
                for c in concepts[:3]:
                    c_title = c.get("title", "")
                    c_expl = c.get("short_explanation", "")
                    ex = c.get("examples", [])
                    ex_str = f" For instance: {ex[0]}." if ex else ""
                    concept_explanations.append(f"{c_title}: {c_expl}{ex_str}")

                body_text = (
                    f"Let's explore {t_title}. {t_overview} "
                    f"{' '.join(concept_explanations)}"
                )

                sections.append({
                    "speaker": "Narrator" if mode == "lecture" else "Instructor",
                    "topic_title": t_title,
                    "text": body_text,
                    "timestamp_estimate": elapsed
                })
                full_script_lines.append(body_text)
                # estimate ~130 words per minute -> ~2 words per second
                word_count = len(body_text.split())
                elapsed += max(int(word_count / 2.2), 15)

        # Conclusion
        conclusion_text = (
            f"To recap, we have analyzed the foundational pillars of {title}. "
            "Review your interactive visual models and test your retention with the active recall flashcards and quiz. "
            "Thank you for listening, and happy studying!"
        )
        sections.append({
            "speaker": "Host",
            "topic_title": "Summary & Exam Takeaways",
            "text": conclusion_text,
            "timestamp_estimate": elapsed
        })
        full_script_lines.append(conclusion_text)
        elapsed += 20

        return {
            "title": title,
            "mode": mode,
            "script": "\n\n".join(full_script_lines),
            "sections": sections,
            "estimated_duration_seconds": elapsed
        }


ai_service = AIService()
