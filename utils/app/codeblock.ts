interface languageMap {
  [key: string]: string | undefined;
}

export const programmingLanguages: languageMap = {
  'bash': '.bash',
  'c#': '.cs',
  'c++': '.cpp',
  'objective-c': '.m',
  'sh': '.sh',
  'zsh': '.zsh',
  c: '.c',
  cpp: '.cpp',
  css: '.css',
  go: '.go',
  haskell: '.hs',
  html: '.html',
  java: '.java',
  javascript: '.js',
  kotlin: '.kt',
  lua: '.lua',
  perl: '.pl',
  php: '.php',
  python: '.py',
  ruby: '.rb',
  rust: '.rs',
  scala: '.scala',
  shell: '.sh',
  sql: '.sql',
  swift: '.swift',
  typescript: '.ts',
  // add more file extensions here, make sure the key is same as language prop in CodeBlock.tsx component
};

export const generateRandomString = (length: number, lowercase = false) => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXY3456789'; // excluding similar looking characters like Z, 2, I, 1, O, 0
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return lowercase ? result.toLowerCase() : result;
};
