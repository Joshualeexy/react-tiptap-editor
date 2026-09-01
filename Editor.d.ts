import { FC, ReactNode } from 'react';

export type AiProvider = 'deepseek' | 'openai' | 'anthropic' | 'gemini' | 'ollama' | 'groq' | 'custom';

export interface AiConfig {
  provider?: AiProvider;
  apiKey?: string;
  endpoint?: string;
  model?: string;
}

export interface CloudStorageConfig {
  googleClientId?: string;
  googleDeveloperKey?: string;
  dropboxAppKey?: string;
}

export interface AiGenerateParams {
  topic: string;
  instructions?: string;
  tone?: string;
  keywords?: string;
  length?: number;
  sourceNotes?: string;
  provider?: string;
  model?: string;
}

export interface AiDraftResult {
  title: string;
  excerpt: string;
  content_html: string;
}

export interface EditorProps {
  value?: string;
  onChange?: (html: string) => void;
  placeholder?: string;
  accentColor?: string;
  limit?: number;
  authToken?: string;
  aiConfig?: AiConfig;
  cloudConfig?: CloudStorageConfig;
  onAiGenerate?: (params: AiGenerateParams) => Promise<AiDraftResult>;
  onAiDraftApplied?: (result: AiDraftResult) => void;
  onImageUpload?: (file: File) => Promise<string>;
  compact?: boolean;
  containerClassName?: string;
  seoPreview?: ReactNode;
}

export declare function resolveCloudImageUrl(url: string): string;
export declare function openGooglePicker(options: { clientId: string; developerKey: string; onSelect: (file: any) => void; onCancel?: () => void }): void;
export declare function openDropboxChooser(options: { appKey: string; onSelect: (file: any) => void; onCancel?: () => void }): void;

export declare const Editor: FC<EditorProps>;
export default Editor;
