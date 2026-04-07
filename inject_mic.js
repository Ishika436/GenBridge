const fs = require('fs');
const filepath = 'c:/Users/Shrishti/OneDrive/Desktop/copy-dak/post-task.html';
let content = fs.readFileSync(filepath, 'utf8');

const micIconHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align: middle;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg>`;

// Replace empty spans in voice-toolbar
content = content.replace(/<span style="font-size:1\.1rem;"><\/span>/g, '<span style="font-size:1.1rem; color: var(--blue);">' + micIconHTML + '</span>');

// Inject into voice buttons
content = content.replace(/<button class="voice-input-btn"([^>]*)><\/button>/g, '<button class="voice-input-btn"$1>' + micIconHTML + '</button>');

// Fix JS reset
content = content.replace(/btn\.innerHTML = '';/g, "btn.innerHTML = '" + micIconHTML + "';");

fs.writeFileSync(filepath, content);
console.log('mic injected');
