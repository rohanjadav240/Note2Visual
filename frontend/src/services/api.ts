import axios from 'axios';
import type {
  Project,
  DocumentInfo,
  ProcessingStatus,
  Lesson,
  VisualSettings,
  ExportInfo,
  QuizResult,
  LearningProgressData,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

/* ====== Projects ====== */

export async function createProject(data: {
  title?: string;
  subject?: string;
  language?: string;
  explanation_level?: string;
  detail_amount?: string;
  default_pattern?: string;
}): Promise<Project> {
  const res = await api.post('/projects', data);
  return res.data;
}

export async function listProjects(): Promise<{ projects: Project[]; total: number }> {
  const res = await api.get('/projects');
  return res.data;
}

export async function getProject(id: string): Promise<Project> {
  const res = await api.get(`/projects/${id}`);
  return res.data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

/* ====== Upload ====== */

export async function uploadDocument(projectId: string, file: File): Promise<DocumentInfo> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/projects/${projectId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

/* ====== Generation ====== */

export async function startGeneration(projectId: string): Promise<void> {
  await api.post(`/projects/${projectId}/generate`);
}

export async function getProcessingStatus(projectId: string): Promise<ProcessingStatus> {
  const res = await api.get(`/projects/${projectId}/status`);
  return res.data;
}

/* ====== Lesson ====== */

export async function getLesson(projectId: string): Promise<Lesson> {
  const res = await api.get(`/projects/${projectId}/lesson`);
  return res.data;
}

export async function updateLesson(
  projectId: string,
  data: { lesson_data?: Record<string, unknown>; title?: string }
): Promise<void> {
  await api.patch(`/projects/${projectId}/lesson`, data);
}

export async function updateVisualSettings(
  projectId: string,
  settings: Partial<VisualSettings>
): Promise<void> {
  await api.patch(`/projects/${projectId}/visual-settings`, settings);
}

/* ====== Export ====== */

export async function requestExport(
  projectId: string,
  options: { export_type?: string; include_answers?: boolean; paper_size?: string }
): Promise<ExportInfo> {
  const res = await api.post(`/projects/${projectId}/export/pdf`, options);
  return res.data;
}

export async function exportPdf(
  projectId: string,
  exportType: string = 'full',
  includeAnswers: boolean = true
): Promise<ExportInfo> {
  return requestExport(projectId, {
    export_type: exportType,
    include_answers: includeAnswers,
  });
}

export async function getExport(projectId: string, exportId: string): Promise<Blob | { status: string }> {
  const res = await api.get(`/projects/${projectId}/export/${exportId}`, {
    responseType: 'blob',
  });
  return res.data;
}

/* ====== Quiz ====== */

export async function submitQuiz(
  projectId: string,
  answers: Record<string, number>
): Promise<QuizResult> {
  const res = await api.post(`/projects/${projectId}/quiz/submit`, { answers });
  return res.data;
}

/* ====== Progress ====== */

export async function updateProgress(
  projectId: string,
  data: { topic_id: string; topic_title: string; time_spent_seconds?: number; completed?: boolean }
): Promise<void> {
  await api.post(`/projects/${projectId}/progress`, data);
}

export async function getProgress(): Promise<LearningProgressData> {
  const res = await api.get('/progress');
  return res.data;
}

/* ====== Health ====== */

export async function getHealth(): Promise<{ status: string; ai_provider: string; demo_mode: boolean }> {
  const res = await api.get('/health');
  return res.data;
}

export const apiService = {
  createProject,
  listProjects,
  getProject,
  deleteProject,
  uploadDocument,
  generateLesson: startGeneration,
  startGeneration,
  getProcessingStatus,
  getLesson,
  updateLesson,
  updateVisualSettings,
  requestExport,
  exportPdf,
  getExport,
  submitQuiz,
  updateProgress,
  getProgress,
  getHealth,
};

export default apiService;
