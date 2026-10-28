"""Visual data generator — creates diagram data for visual patterns."""

import uuid
from typing import Optional


class VisualGenerator:
    """Generates structured diagram data from lesson content for each visual pattern."""

    def generate_diagrams(self, lesson_data: dict, pattern: str = "auto") -> dict:
        """Generate diagram data for all chapters/topics in a lesson."""
        if pattern == "auto":
            pattern = lesson_data.get("recommended_pattern", "mind_map")

        diagrams = {}
        chapters = lesson_data.get("chapters", [])

        for chapter in chapters:
            for topic in chapter.get("topics", []):
                topic_id = topic["id"]
                concepts = topic.get("concepts", [])
                
                if not concepts:
                    continue

                diagram = self._generate_for_pattern(pattern, topic, concepts, chapter)
                if diagram:
                    diagrams[topic_id] = diagram

        return diagrams

    def _generate_for_pattern(self, pattern: str, topic: dict, concepts: list, chapter: dict) -> Optional[dict]:
        generators = {
            "mind_map": self._gen_mind_map,
            "flowchart": self._gen_flowchart,
            "storyboard": self._gen_storyboard,
            "timeline": self._gen_timeline,
            "comparison": self._gen_comparison,
            "concept_network": self._gen_concept_network,
            "infographic": self._gen_infographic,
            "lesson_cards": self._gen_lesson_cards,
            "math_explanation": self._gen_math_explanation,
            "system_architecture": self._gen_system_architecture,
        }
        generator = generators.get(pattern, self._gen_mind_map)
        return generator(topic, concepts, chapter)

    def _gen_mind_map(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        edges = []
        
        # Central node
        center_id = f"center_{topic['id']}"
        nodes.append({
            "id": center_id,
            "label": topic["title"],
            "type": "center",
            "description": topic.get("overview", ""),
            "position": {"x": 400, "y": 300},
            "style": {"importance": "center"}
        })

        # Branch nodes for each concept
        angle_step = 360 / max(len(concepts), 1)
        import math
        for i, concept in enumerate(concepts):
            angle = math.radians(i * angle_step - 90)
            radius = 200
            x = 400 + radius * math.cos(angle)
            y = 300 + radius * math.sin(angle)

            node_id = concept["id"]
            nodes.append({
                "id": node_id,
                "label": concept["title"],
                "type": "branch",
                "description": concept["short_explanation"],
                "position": {"x": round(x), "y": round(y)},
                "style": {"importance": concept.get("importance", "medium")}
            })
            edges.append({
                "id": f"e_{center_id}_{node_id}",
                "source": center_id,
                "target": node_id,
                "label": "",
                "type": "branch"
            })

            # Add related concept edges
            for related_id in concept.get("related_concepts", []):
                edges.append({
                    "id": f"e_{node_id}_{related_id}",
                    "source": node_id,
                    "target": related_id,
                    "label": "relates to",
                    "type": "relation"
                })

        return {"pattern": "mind_map", "nodes": nodes, "edges": edges, "metadata": {"topic_title": topic["title"]}}

    def _gen_flowchart(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        edges = []

        # Start node
        start_id = f"start_{topic['id']}"
        nodes.append({
            "id": start_id,
            "label": "Start",
            "type": "start",
            "description": topic.get("overview", ""),
            "position": {"x": 400, "y": 50},
            "style": {}
        })

        prev_id = start_id
        for i, concept in enumerate(concepts):
            node_id = concept["id"]
            nodes.append({
                "id": node_id,
                "label": concept["title"],
                "type": "step",
                "description": concept["short_explanation"],
                "position": {"x": 400, "y": 50 + (i + 1) * 120},
                "style": {"importance": concept.get("importance", "medium")}
            })
            edges.append({
                "id": f"e_{prev_id}_{node_id}",
                "source": prev_id,
                "target": node_id,
                "label": "",
                "type": "flow"
            })
            prev_id = node_id

        # End node
        end_id = f"end_{topic['id']}"
        nodes.append({
            "id": end_id,
            "label": "End",
            "type": "end",
            "description": "",
            "position": {"x": 400, "y": 50 + (len(concepts) + 1) * 120},
            "style": {}
        })
        edges.append({
            "id": f"e_{prev_id}_{end_id}",
            "source": prev_id,
            "target": end_id,
            "label": "",
            "type": "flow"
        })

        return {"pattern": "flowchart", "nodes": nodes, "edges": edges, "metadata": {"topic_title": topic["title"]}}

    def _gen_storyboard(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        for i, concept in enumerate(concepts):
            nodes.append({
                "id": concept["id"],
                "label": concept["title"],
                "type": "scene",
                "description": concept.get("detailed_explanation", concept["short_explanation"]),
                "position": {"x": 0, "y": i * 250},
                "style": {
                    "scene_number": i + 1,
                    "example": concept.get("examples", [""])[0] if concept.get("examples") else "",
                    "key_takeaway": concept["short_explanation"]
                }
            })
        return {"pattern": "storyboard", "nodes": nodes, "edges": [], "metadata": {"topic_title": topic["title"]}}

    def _gen_timeline(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        edges = []
        for i, concept in enumerate(concepts):
            node_id = concept["id"]
            nodes.append({
                "id": node_id,
                "label": concept["title"],
                "type": "event",
                "description": concept["short_explanation"],
                "position": {"x": 200, "y": i * 150},
                "style": {
                    "stage": i + 1,
                    "importance": concept.get("importance", "medium")
                }
            })
            if i > 0:
                edges.append({
                    "id": f"e_{concepts[i-1]['id']}_{node_id}",
                    "source": concepts[i-1]["id"],
                    "target": node_id,
                    "label": "",
                    "type": "timeline"
                })
        return {"pattern": "timeline", "nodes": nodes, "edges": edges, "metadata": {"topic_title": topic["title"]}}

    def _gen_comparison(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        if len(concepts) >= 2:
            nodes.append({
                "id": concepts[0]["id"],
                "label": concepts[0]["title"],
                "type": "topic_a",
                "description": concepts[0]["short_explanation"],
                "position": {"x": 150, "y": 200},
                "style": {}
            })
            nodes.append({
                "id": concepts[1]["id"],
                "label": concepts[1]["title"],
                "type": "topic_b",
                "description": concepts[1]["short_explanation"],
                "position": {"x": 550, "y": 200},
                "style": {}
            })
            for concept in concepts[2:]:
                nodes.append({
                    "id": concept["id"],
                    "label": concept["title"],
                    "type": "shared",
                    "description": concept["short_explanation"],
                    "position": {"x": 350, "y": 350},
                    "style": {}
                })
        else:
            for i, concept in enumerate(concepts):
                nodes.append({
                    "id": concept["id"],
                    "label": concept["title"],
                    "type": "item",
                    "description": concept["short_explanation"],
                    "position": {"x": 200 + i * 300, "y": 200},
                    "style": {}
                })
        return {"pattern": "comparison", "nodes": nodes, "edges": [], "metadata": {"topic_title": topic["title"]}}

    def _gen_concept_network(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        edges = []
        import math
        
        for i, concept in enumerate(concepts):
            angle = math.radians(i * (360 / max(len(concepts), 1)))
            nodes.append({
                "id": concept["id"],
                "label": concept["title"],
                "type": "concept",
                "description": concept["short_explanation"],
                "position": {"x": 400 + 200 * math.cos(angle), "y": 300 + 200 * math.sin(angle)},
                "style": {"importance": concept.get("importance", "medium")}
            })
            for rel_id in concept.get("related_concepts", []):
                edges.append({
                    "id": f"e_{concept['id']}_{rel_id}",
                    "source": concept["id"],
                    "target": rel_id,
                    "label": "relates to",
                    "type": "relation"
                })
        return {"pattern": "concept_network", "nodes": nodes, "edges": edges, "metadata": {"topic_title": topic["title"]}}

    def _gen_infographic(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        # Header
        nodes.append({
            "id": f"header_{topic['id']}",
            "label": topic["title"],
            "type": "header",
            "description": topic.get("overview", ""),
            "position": {"x": 0, "y": 0},
            "style": {}
        })
        for i, concept in enumerate(concepts):
            nodes.append({
                "id": concept["id"],
                "label": concept["title"],
                "type": "fact" if concept.get("importance") == "high" else "definition",
                "description": concept["short_explanation"],
                "position": {"x": 0, "y": (i + 1) * 120},
                "style": {"importance": concept.get("importance", "medium")}
            })
        # Summary
        takeaways = topic.get("key_takeaways", [])
        if takeaways:
            nodes.append({
                "id": f"summary_{topic['id']}",
                "label": "Key Takeaways",
                "type": "summary",
                "description": " • ".join(takeaways),
                "position": {"x": 0, "y": (len(concepts) + 1) * 120},
                "style": {}
            })
        return {"pattern": "infographic", "nodes": nodes, "edges": [], "metadata": {"topic_title": topic["title"]}}

    def _gen_lesson_cards(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        for i, concept in enumerate(concepts):
            nodes.append({
                "id": concept["id"],
                "label": concept["title"],
                "type": "card",
                "description": concept["short_explanation"],
                "position": {"x": (i % 3) * 300, "y": (i // 3) * 250},
                "style": {
                    "example": concept.get("examples", [""])[0] if concept.get("examples") else "",
                    "importance": concept.get("importance", "medium"),
                    "detailed": concept.get("detailed_explanation", "")
                }
            })
        return {"pattern": "lesson_cards", "nodes": nodes, "edges": [], "metadata": {"topic_title": topic["title"]}}

    def _gen_math_explanation(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        for i, concept in enumerate(concepts):
            nodes.append({
                "id": concept["id"],
                "label": concept["title"],
                "type": "math_step",
                "description": concept.get("detailed_explanation", concept["short_explanation"]),
                "position": {"x": 0, "y": i * 200},
                "style": {
                    "step_number": i + 1,
                    "examples": concept.get("examples", []),
                    "importance": concept.get("importance", "medium")
                }
            })
        return {"pattern": "math_explanation", "nodes": nodes, "edges": [], "metadata": {"topic_title": topic["title"]}}

    def _gen_system_architecture(self, topic: dict, concepts: list, chapter: dict) -> dict:
        nodes = []
        edges = []
        
        for i, concept in enumerate(concepts):
            col = i % 3
            row = i // 3
            nodes.append({
                "id": concept["id"],
                "label": concept["title"],
                "type": "component",
                "description": concept["short_explanation"],
                "position": {"x": 100 + col * 250, "y": 100 + row * 200},
                "style": {"importance": concept.get("importance", "medium")}
            })
            for rel_id in concept.get("related_concepts", []):
                edges.append({
                    "id": f"e_{concept['id']}_{rel_id}",
                    "source": concept["id"],
                    "target": rel_id,
                    "label": "connects to",
                    "type": "data_flow"
                })
        return {"pattern": "system_architecture", "nodes": nodes, "edges": edges, "metadata": {"topic_title": topic["title"]}}


visual_generator = VisualGenerator()
