export interface Language {
  id: string;
  name: string;
  monacoId: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { id: 'javascript', name: 'JavaScript', monacoId: 'javascript' },
  { id: 'typescript', name: 'TypeScript', monacoId: 'typescript' },
  { id: 'python', name: 'Python', monacoId: 'python' },
  { id: 'java', name: 'Java', monacoId: 'java' },
  { id: 'csharp', name: 'C#', monacoId: 'csharp' },
  { id: 'cpp', name: 'C++', monacoId: 'cpp' },
  { id: 'go', name: 'Go', monacoId: 'go' },
  { id: 'rust', name: 'Rust', monacoId: 'rust' },
  { id: 'php', name: 'PHP', monacoId: 'php' },
  { id: 'ruby', name: 'Ruby', monacoId: 'ruby' },
  { id: 'swift', name: 'Swift', monacoId: 'swift' },
  { id: 'kotlin', name: 'Kotlin', monacoId: 'kotlin' },
  { id: 'html', name: 'HTML', monacoId: 'html' },
  { id: 'css', name: 'CSS', monacoId: 'css' },
  { id: 'sql', name: 'SQL', monacoId: 'sql' },
  { id: 'shell', name: 'Shell/Bash', monacoId: 'shell' },
];
