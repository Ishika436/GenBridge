const fs = require('fs');
const dir = 'c:/Users/Shrishti/OneDrive/Desktop/copy-dak';
const files = [
  'index.html', 'dashboard.html', 'my-tasks.html', 
  'post-task.html', 'reviews.html', 'tasks-nearby.html', 
  'app.js'
];

// SVGs
const sunSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
const moonSvg = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
const logoSvg = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#fff;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>`;

files.forEach(f => {
  const fp = dir + '/' + f;
  let text = fs.readFileSync(fp, 'utf8');
  
  // Specific replacements for JS theme toggle to use innerHTML instead of textContent
  if (f === 'app.js') {
    text = text.replace(/icon\.textContent = newTheme === 'dark' \? '☀️' : '🌙';/g, 
      `icon.innerHTML = newTheme === 'dark' ? '${sunSvg}' : '${moonSvg}';`);
    text = text.replace(/const themeIcon = currentTheme === 'dark' \? '☀️' : '🌙';/g, 
      `const themeIcon = currentTheme === 'dark' ? '${sunSvg}' : '${moonSvg}';`);
    // And logo representation
    text = text.replace(/<div class="logo-icon">🤝<\/div>/g, 
      `<div class="logo-icon">${logoSvg}</div>`);
  }

  // General emoji wipe
  const emojis = ['🏠','➕','📋','⭐','📍','✅','👋','👴','🙋','👨','👩','🧑','📷','📁','📝','🛒','💻','🚶','🏥','🔴','⏹','💡','✍️','💰','🔐','🛡️','🎉','🤝','⏳','🎙️','🎙','☀️','🌙', '✨'];
  
  for(let e of emojis) {
    // replace emoji with space after
    text = text.split(e + ' ').join('');
    // replace raw emoji
    text = text.split(e).join('');
  }

  fs.writeFileSync(fp, text);
});
console.log('done');
