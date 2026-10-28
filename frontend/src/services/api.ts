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
  User,
  AuthToken,
  AudioLessonResponse,
} from '../types';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach Authorization header if token exists in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('n2v_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/* ====== Auth ====== */

export async function register(data: { email: string; password: string; name?: string }): Promise<AuthToken> {
  const res = await api.post('/auth/register', data);
  return res.data;
}

export async function login(data: { email: string; password: string }): Promise<AuthToken> {
  const res = await api.post('/auth/login', data);
  return res.data;
}

export async function getMe(): Promise<User> {
  const res = await api.get('/auth/me');
  return res.data;
}

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

export async function updateProject(id: string, data: Partial<Project>): Promise<Project> {
  const res = await api.patch(`/projects/${id}`, data);
  return res.data;
}

export async function duplicateProject(id: string): Promise<Project> {
  const res = await api.post(`/projects/${id}/duplicate`);
  return res.data;
}

export async function deleteProject(id: string): Promise<void> {
  await api.delete(`/projects/${id}`);
}

/* ====== Upload & Ingestion ====== */

export async function uploadDocument(projectId: string, file: File): Promise<DocumentInfo> {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post(`/projects/${projectId}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function ingestTextInput(
  projectId: string,
  data: { text: string; title?: string; source_type?: string }
): Promise<DocumentInfo> {
  const res = await api.post(`/projects/${projectId}/text-input`, data);
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

/* ====== Mind Map Editor ====== */

export async function updateMindMap(
  projectId: string,
  data: { topic_id: string; nodes: any[]; edges: any[] }
): Promise<void> {
  await api.put(`/projects/${projectId}/mind-map`, data);
}

/* ====== Audio Lesson ====== */

export async function generateAudioLesson(
  projectId: string,
  mode: string = 'lecture'
): Promise<AudioLessonResponse> {
  const res = await api.post(`/projects/${projectId}/audio-lesson`, { mode });
  return res.data;
}

export async function getAudioLesson(projectId: string): Promise<AudioLessonResponse> {
  const res = await api.get(`/projects/${projectId}/audio-lesson`);
  return res.data;
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
  register,
  login,
  getMe,
  createProject,
  listProjects,
  getProject,
  updateProject,
  duplicateProject,
  deleteProject,
  uploadDocument,
  ingestTextInput,
  generateLesson: startGeneration,
  startGeneration,
  getProcessingStatus,
  getLesson,
  updateLesson,
  updateVisualSettings,
  updateMindMap,
  generateAudioLesson,
  getAudioLesson,
  requestExport,
  exportPdf,
  getExport,
  submitQuiz,
  updateProgress,
  getProgress,
  getHealth,
};

export default apiService;
