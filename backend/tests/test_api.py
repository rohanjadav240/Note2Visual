"""Comprehensive integration test suite for Note2Visual API."""

import io
import unittest
from fastapi.testclient import TestClient
from app.main import app
from app.db.database import init_db

class TestNote2VisualAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        init_db()
        cls.client = TestClient(app)

    def test_01_health_check(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "healthy")
        self.assertIn("ai_provider", data)

    def test_02_create_and_list_projects(self):
        create_res = self.client.post("/api/projects", json={
            "title": "Quantum Mechanics and Wavefunctions",
            "subject": "Physics",
            "language": "en",
            "explanation_level": "intermediate",
            "detail_amount": "standard",
            "default_pattern": "mind_map"
        })
        self.assertEqual(create_res.status_code, 200)
        proj = create_res.json()
        self.assertIn("id", proj)
        self.assertEqual(proj["title"], "Quantum Mechanics and Wavefunctions")

        list_res = self.client.get("/api/projects")
        self.assertEqual(list_res.status_code, 200)
        projects = list_res.json()["projects"]
        self.assertTrue(any(p["id"] == proj["id"] for p in projects))

    def test_03_upload_document_and_pipeline(self):
        # 1. Create project
        create_res = self.client.post("/api/projects", json={
            "title": "Cell Biology ATP Synthesis",
            "subject": "Biology",
            "language": "en",
            "explanation_level": "intermediate",
            "detail_amount": "standard",
            "default_pattern": "flowchart"
        })
        proj_id = create_res.json()["id"]

        # 2. Upload file
        notes = (
            "Cellular Respiration and Bioenergetics:\n"
            "Glycolysis converts glucose into pyruvate yielding 2 ATP net.\n"
            "The Citric Acid Cycle produces NADH, FADH2, and CO2 in the mitochondrial matrix.\n"
            "Oxidative Phosphorylation drives ATP synthase via a proton gradient."
        )
        file_obj = io.BytesIO(notes.encode("utf-8"))
        upload_res = self.client.post(
            f"/api/projects/{proj_id}/upload",
            files={"file": ("biology_notes.txt", file_obj, "text/plain")}
        )
        self.assertEqual(upload_res.status_code, 200)
        doc = upload_res.json()
        self.assertEqual(doc["original_filename"], "biology_notes.txt")

        # 3. Check status
        status_res = self.client.get(f"/api/projects/{proj_id}/status")
        self.assertEqual(status_res.status_code, 200)
        status_data = status_res.json()
        self.assertIn("steps", status_data)

    def test_04_progress_endpoints(self):
        res = self.client.get("/api/progress")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("total_lessons", data)
        self.assertIn("completed_lessons", data)
        self.assertIn("total_topics", data)

if __name__ == "__main__":
    unittest.main()
