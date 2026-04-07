// ============ GenBridge Shared Utilities ============

(function () {
  const savedTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.setAttribute('data-theme', savedTheme);
})();

function toggleTheme() {
  const newTheme = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', newTheme);
  localStorage.setItem('theme', newTheme);

  const icon = document.getElementById('global-theme-icon') || document.getElementById('theme-icon');
  if (icon) icon.innerHTML = newTheme === 'dark' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
}
const Auth = {
  getUser() { const u = localStorage.getItem('gb_user'); return u ? JSON.parse(u) : null; },
  setUser(user) { localStorage.setItem('gb_user', JSON.stringify(user)); },
  logout() { localStorage.removeItem('gb_user'); window.location.href = 'index.html'; },
  requireAuth() { const user = this.getUser(); if (!user) { window.location.href = 'index.html'; return null; } return user; }
};

const Tasks = {
  getAll() { const t = localStorage.getItem('gb_tasks'); return t ? JSON.parse(t) : []; },
  add(task) {
    const tasks = this.getAll();
    task.id = Date.now();
    task.createdAt = new Date().toISOString();
    task.status = 'open';
    tasks.unshift(task);
    localStorage.setItem('gb_tasks', JSON.stringify(tasks));
    return task;
  },
  updateStatus(id, status) {
    const tasks = this.getAll();
    const idx = tasks.findIndex(t => Number(t.id) === Number(id));
    if (idx !== -1) {
      tasks[idx].status = status;
      if (status === 'accepted') {
        const user = Auth.getUser();
        tasks[idx].acceptedBy = user ? user.name : 'Unknown Helper';
        tasks[idx].acceptedById = user ? user.id : null;
        tasks[idx].acceptedByPhoto = user ? (user.photo || null) : null;
      }
      localStorage.setItem('gb_tasks', JSON.stringify(tasks));
    }
  },
  getByUser(userId) {
    return this.getAll().filter(t => String(t.postedById) === String(userId));
  },
  delete(id) {
    let tasks = this.getAll();
    tasks = tasks.filter(t => Number(t.id) !== Number(id));
    localStorage.setItem('gb_tasks', JSON.stringify(tasks));
  }
};

const Users = {
  getAll() { const u = localStorage.getItem('gb_users'); return u ? JSON.parse(u) : []; },
  add(user) {
    const users = this.getAll();
    user.id = 'user_' + Date.now();
    users.push(user);
    localStorage.setItem('gb_users', JSON.stringify(users));
    return user;
  },
  findByEmail(email) { return this.getAll().find(u => u.email.toLowerCase() === email.toLowerCase()); },
  findByPhone(phone) { return this.getAll().find(u => u.phone === phone); },
  findById(id) { return this.getAll().find(u => String(u.id) === String(id)); }
};

const Reviews = {
  getAll() { const r = localStorage.getItem('gb_reviews'); return r ? JSON.parse(r) : []; },
  add(review) {
    const reviews = this.getAll();
    review.id = Date.now();
    review.createdAt = new Date().toISOString();
    reviews.unshift(review);
    localStorage.setItem('gb_reviews', JSON.stringify(reviews));
    return review;
  },
  getForTask(taskId) { return this.getAll().filter(r => Number(r.taskId) === Number(taskId)); },
  hasReviewed(taskId, reviewerId) {
    return this.getAll().some(r => Number(r.taskId) === Number(taskId) && String(r.reviewerId) === String(reviewerId));
  },
  getAverageForUser(userId) {
    const revs = this.getAll().filter(r => String(r.revieweeId) === String(userId));
    if (!revs.length) return null;
    return (revs.reduce((s, r) => s + r.rating, 0) / revs.length).toFixed(1);
  },
  getForUser(userId) { return this.getAll().filter(r => String(r.revieweeId) === String(userId)); },
  getByReviewer(userId) { return this.getAll().filter(r => String(r.reviewerId) === String(userId)); }
};

// ============ Language / i18n System ============
const LANG_KEY = 'gb_lang';

const I18N = {
  en: {
    // Navbar
    nav_dashboard: 'Dashboard',
    nav_post: 'Post Task',
    nav_my_tasks: 'My Tasks',
    nav_reviews: 'Reviews',
    nav_nearby: 'Tasks Nearby',
    nav_my_helps: 'My Helps',
    nav_signout: 'Sign Out',
    nav_signin: 'Sign In',
    left_title: 'Connecting Seniors with Caring Helpers',
    left_sub: 'A safe, simple platform where elderly individuals get the help they need, and young people earn while making a real difference.',
    feat_1: 'Photo Verified Accounts',
    feat_2: 'Location-Based Matching',
    feat_3: 'Secure In-App Messaging',
    feat_4: 'Intergenerational Bonding',
    // Index page
    welcome_back: 'Welcome back ',
    signin_sub: 'Sign in to continue to your GenBridge account',
    email_label: 'Email Address',
    password_label: 'Password',
    signin_btn: 'Sign In →',
    no_account: 'No account?',
    create_free: 'Create one free',
    create_account_title: 'Create Your Account',
    signup_sub: 'Join GenBridge and start connecting',
    full_name: 'Full Name',
    govt_id: 'Govt. ID Number',
    role_seeker: 'I Need Help',
    role_seeker_sub: 'Senior seeking assistance',
    role_helper: 'I Want to Help',
    role_helper_sub: 'Youth helper / volunteer',
    gender_label: 'Gender',
    gender_male: 'Male',
    gender_female: 'Female',
    gender_other: 'Other',
    photo_title: 'Verification Photo',
    photo_strong: 'Add your photo',
    photo_sub: 'Builds trust with helpers',
    take_photo: 'Take Photo',
    upload_photo: 'Upload Photo',
    photo_verified: 'Photo added – you\'ll be verified!',
    create_btn: 'Create Account →',
    have_account: 'Have an account?',
    // Post task
    post_title: 'Post a Task',
    post_hero_sub: 'Describe what you need help with and a verified helper will assist you',
    what_need_help: 'What do you need help with?',
    post_sub: 'Fill in the details and helpers near you will see your request',
    task_title_label: 'Task Title *',
    task_title_ph: 'e.g. Help with grocery shopping',
    category_label: 'Category *',
    desc_label: 'Description *',
    desc_ph: 'Describe the task in detail...',
    location_label: 'Location *',
    location_ph: 'e.g. Andheri West, Mumbai',
    pay_label: 'Payment Offered *',
    pay_ph: 'e.g. ₹200',
    date_label: 'Preferred Date',
    time_label: 'Preferred Time',
    urgent_label: 'Mark as Urgent',
    urgent_sub: 'This task needs to be done today or ASAP',
    post_btn: 'Post Task →',
    cat_shopping: 'Shopping',
    cat_tech: 'Tech Help',
    cat_errands: 'Errands',
    cat_household: 'Household',
    cat_medical: 'Medical',
    cat_companion: 'Companion',
    voice_btn: 'Voice Input',
    voice_listening: 'Listening… Speak now',
    voice_stop: 'Stop',
    tips_title: 'Tips for a Great Post',
    tip1_title: 'Be specific',
    tip1_body: '– mention exact items, quantities, or steps needed.',
    tip2_title: 'Add your location',
    tip2_body: '– helps helpers near you find your task faster.',
    tip3_title: 'Fair pay',
    tip3_body: '– helpers are more likely to accept tasks with clear payment.',
    tip4_title: 'Stay safe',
    tip4_body: '– all helpers on GenBridge are identity verified.',
    safety_title: 'Safety Guarantee',
    safety_body: 'Every helper on GenBridge is verified with government-issued ID. Your safety is our top priority.',
    post_success_title: 'Task Posted!',
    post_success_body: 'Your task is now visible to helpers near you. You\'ll be notified when someone accepts it.',
    view_my_tasks: 'View My Tasks',
    post_another: 'Post Another',
    // Dashboard
    dashboard_title: 'Dashboard',
    good_morning: 'Good morning',
    good_afternoon: 'Good afternoon',
    good_evening: 'Good evening',
    seeker_welcome_sub: 'Post a task and get help from a verified helper nearby.',
    helper_welcome_sub: 'Check tasks nearby and start helping your community!',
    tasks_posted: 'Tasks Posted',
    helps_taken: 'Helps Taken',
    completed: 'Completed',
    recent_tasks: 'Recent Tasks',
    latest_tasks: 'Latest Tasks Near You',
    view_all: 'View All',
    quick_actions: 'Quick Actions',
    qa_post: 'Post a New Task',
    qa_my_tasks: 'My Tasks',
    qa_browse: 'Browse All Tasks',
    qa_nearby: 'Tasks Near You',
    qa_helps: 'My Helps',
    seeking_help: 'Seeking Help',
    helper_label: 'Helper',
    translate_btn: 'Translate to English',
  },
  hi: {
    // Navbar
    nav_dashboard: 'डैशबोर्ड',
    nav_post: 'काम पोस्ट करें',
    nav_my_tasks: 'मेरे काम',
    nav_reviews: 'समीक्षाएं',
    nav_nearby: 'पास के काम',
    nav_my_helps: 'मेरी सहायता',
    nav_signout: 'साइन आउट',
    nav_signin: 'साइन इन',
    left_title: 'वरिष्ठ नागरिकों को देखभाल करने वाले सहायकों से जोड़ना',
    left_sub: 'एक सुरक्षित, सरल मंच जहां बुजुर्गों को जरूरत की मदद मिलती है, और युवा लोग वास्तविक बदलाव लाते हुए कमाते हैं।',
    feat_1: 'फोटो सत्यापित खाते',
    feat_2: 'स्थान-आधारित मिलान',
    feat_3: 'सुरक्षित इन-ऐप मैसेजिंग',
    feat_4: 'अंतर-पीढ़ीगत जुड़ाव',
    // Index
    welcome_back: 'वापस स्वागत है ',
    signin_sub: 'अपने GenBridge खाते में जारी रखने के लिए साइन इन करें',
    email_label: 'ईमेल पता',
    password_label: 'पासवर्ड',
    signin_btn: 'साइन इन करें →',
    no_account: 'खाता नहीं है?',
    create_free: 'मुफ़्त बनाएं',
    create_account_title: 'अपना खाता बनाएं',
    signup_sub: 'GenBridge से जुड़ें',
    full_name: 'पूरा नाम',
    govt_id: 'सरकारी ID नंबर',
    role_seeker: 'मुझे मदद चाहिए',
    role_seeker_sub: 'मदद चाहने वाले बुजुर्ग',
    role_helper: 'मैं मदद करना चाहता हूं',
    role_helper_sub: 'युवा सहायक / स्वयंसेवक',
    gender_label: 'लिंग',
    gender_male: 'पुरुष',
    gender_female: 'महिला',
    gender_other: 'अन्य',
    photo_title: 'सत्यापन फोटो',
    photo_strong: 'अपनी फोटो जोड़ें',
    photo_sub: 'सहायकों के साथ विश्वास बनाता है',
    take_photo: 'फोटो लें',
    upload_photo: 'फोटो अपलोड करें',
    photo_verified: 'फोटो जोड़ी गई – आप सत्यापित होंगे!',
    create_btn: 'खाता बनाएं →',
    have_account: 'खाता है?',
    // Post task
    post_title: 'काम पोस्ट करें',
    post_hero_sub: 'बताएं आपको क्या मदद चाहिए और एक सत्यापित सहायक आपकी मदद करेगा',
    what_need_help: 'आपको किस चीज़ में मदद चाहिए?',
    post_sub: 'विवरण भरें और पास के सहायक आपका अनुरोध देखेंगे',
    task_title_label: 'काम का शीर्षक *',
    task_title_ph: 'जैसे: किराने का सामान लाने में मदद',
    category_label: 'श्रेणी *',
    desc_label: 'विवरण *',
    desc_ph: 'काम का विस्तार से वर्णन करें...',
    location_label: 'स्थान *',
    location_ph: 'जैसे: अंधेरी वेस्ट, मुंबई',
    pay_label: 'भुगतान *',
    pay_ph: 'जैसे: ₹200',
    date_label: 'पसंदीदा तारीख',
    time_label: 'पसंदीदा समय',
    urgent_label: 'जरूरी काम',
    urgent_sub: 'यह काम आज या जल्द से जल्द होना चाहिए',
    post_btn: 'काम पोस्ट करें →',
    cat_shopping: 'खरीदारी',
    cat_tech: 'टेक मदद',
    cat_errands: 'काम-काज',
    cat_household: 'घरेलू काम',
    cat_medical: 'चिकित्सा',
    cat_companion: 'साथी',
    voice_btn: 'आवाज़ से भरें',
    voice_listening: 'सुन रहा है… अभी बोलें',
    voice_stop: 'रोकें',
    tips_title: 'अच्छे पोस्ट के लिए सुझाव',
    tip1_title: 'विशिष्ट रहें',
    tip1_body: '– सटीक वस्तुएं, मात्रा, या कदम बताएं।',
    tip2_title: 'स्थान जोड़ें',
    tip2_body: '– पास के सहायकों को आपका काम जल्दी मिलेगा।',
    tip3_title: 'उचित भुगतान',
    tip3_body: '– स्पष्ट भुगतान वाले काम जल्दी स्वीकार होते हैं।',
    tip4_title: 'सुरक्षित रहें',
    tip4_body: '– GenBridge के सभी सहायक पहचान सत्यापित हैं।',
    safety_title: 'सुरक्षा गारंटी',
    safety_body: 'GenBridge के हर सहायक की सरकारी ID से पहचान सत्यापित है। आपकी सुरक्षा हमारी प्राथमिकता है।',
    post_success_title: 'काम पोस्ट हो गया!',
    post_success_body: 'आपका काम अब पास के सहायकों को दिख रहा है। जब कोई स्वीकार करे तो आपको सूचित किया जाएगा।',
    view_my_tasks: 'मेरे काम देखें',
    post_another: 'और पोस्ट करें',
    // Dashboard
    dashboard_title: 'डैशबोर्ड',
    good_morning: 'सुप्रभात',
    good_afternoon: 'शुभ दोपहर',
    good_evening: 'शुभ संध्या',
    seeker_welcome_sub: 'एक काम पोस्ट करें और पास के सत्यापित सहायक से मदद पाएं।',
    helper_welcome_sub: 'पास के काम देखें और अपने समुदाय की मदद करें!',
    tasks_posted: 'पोस्ट किए काम',
    helps_taken: 'ली गई मदद',
    completed: 'पूरे हुए',
    recent_tasks: 'हाल के काम',
    latest_tasks: 'पास के नए काम',
    view_all: 'सभी देखें',
    quick_actions: 'त्वरित क्रियाएं',
    qa_post: 'नया काम पोस्ट करें',
    qa_my_tasks: 'मेरे काम',
    qa_browse: 'सभी काम देखें',
    qa_nearby: 'पास के काम',
    qa_helps: 'मेरी सहायता',
    seeking_help: 'मदद चाहिए',
    helper_label: 'सहायक',
    translate_btn: 'अनुवाद करें',
  },
  mr: {
    // Navbar
    nav_dashboard: 'डॅशबोर्ड',
    nav_post: 'काम पोस्ट करा',
    nav_my_tasks: 'माझी कामे',
    nav_reviews: 'परीक्षणे',
    nav_nearby: 'जवळची कामे',
    nav_my_helps: 'माझी मदत',
    nav_signout: 'साइन आउट',
    nav_signin: 'साइन इन',
    left_title: 'ज्येष्ठ नागरिकांना काळजी घेणाऱ्या सहाय्यकांशी जोडणे',
    left_sub: 'एक सुरक्षित, सोपे व्यासपीठ जिथे वृद्धांना आवश्यक मदत मिळते, आणि तरुण लोक वास्तविक बदल घडवून आणताना पैसे कमवतात.',
    feat_1: 'फोटो पडताळलेली खाती',
    feat_2: 'स्थान-आधारित जुळवणी',
    feat_3: 'सुरक्षित इन-ॲप मेसेजिंग',
    feat_4: 'आंतर-पिढीतील संबंध',
    // Index
    welcome_back: 'पुन्हा स्वागत आहे ',
    signin_sub: 'तुमच्या GenBridge खात्यात सुरू ठेवण्यासाठी साइन इन करा',
    email_label: 'ईमेल पत्ता',
    password_label: 'पासवर्ड',
    signin_btn: 'साइन इन करा →',
    no_account: 'खाते नाही?',
    create_free: 'मोफत बनवा',
    create_account_title: 'तुमचे खाते बनवा',
    signup_sub: 'GenBridge मध्ये सामील व्हा',
    full_name: 'पूर्ण नाव',
    govt_id: 'सरकारी ID क्रमांक',
    role_seeker: 'मला मदत हवी',
    role_seeker_sub: 'मदत शोधणारे ज्येष्ठ',
    role_helper: 'मी मदत करू इच्छितो',
    role_helper_sub: 'युवा सहाय्यक / स्वयंसेवक',
    gender_label: 'लिंग',
    gender_male: 'पुरुष',
    gender_female: 'महिला',
    gender_other: 'इतर',
    photo_title: 'पडताळणी फोटो',
    photo_strong: 'तुमचा फोटो जोडा',
    photo_sub: 'सहाय्यकांसोबत विश्वास निर्माण करतो',
    take_photo: 'फोटो घ्या',
    upload_photo: 'फोटो अपलोड करा',
    photo_verified: 'फोटो जोडला – तुम्ही पडताळलेले व्हाल!',
    create_btn: 'खाते बनवा →',
    have_account: 'खाते आहे?',
    // Post task
    post_title: 'काम पोस्ट करा',
    post_hero_sub: 'तुम्हाला काय मदत हवी ते सांगा आणि एक पडताळलेला सहाय्यक मदत करेल',
    what_need_help: 'तुम्हाला कशात मदत हवी आहे?',
    post_sub: 'तपशील भरा आणि जवळचे सहाय्यक तुमची विनंती पाहतील',
    task_title_label: 'कामाचे शीर्षक *',
    task_title_ph: 'उदा: किराणा सामान आणण्यासाठी मदत',
    category_label: 'श्रेणी *',
    desc_label: 'वर्णन *',
    desc_ph: 'कामाचे सविस्तर वर्णन करा...',
    location_label: 'ठिकाण *',
    location_ph: 'उदा: अंधेरी वेस्ट, मुंबई',
    pay_label: 'दिलेले पैसे *',
    pay_ph: 'उदा: ₹200',
    date_label: 'पसंतीची तारीख',
    time_label: 'पसंतीची वेळ',
    urgent_label: 'तातडीचे काम',
    urgent_sub: 'हे काम आज किंवा लवकरात लवकर करायचे आहे',
    post_btn: 'काम पोस्ट करा →',
    cat_shopping: 'खरेदी',
    cat_tech: 'तंत्र मदत',
    cat_errands: 'कामे',
    cat_household: 'घरगुती',
    cat_medical: 'वैद्यकीय',
    cat_companion: 'सोबती',
    voice_btn: 'आवाजाने भरा',
    voice_listening: 'ऐकत आहे… आता बोला',
    voice_stop: 'थांबा',
    tips_title: 'चांगल्या पोस्टसाठी सूचना',
    tip1_title: 'स्पष्ट रहा',
    tip1_body: '– अचूक वस्तू, प्रमाण किंवा पायऱ्या सांगा।',
    tip2_title: 'ठिकाण जोडा',
    tip2_body: '– जवळचे सहाय्यक तुमचे काम लवकर सापडतील.',
    tip3_title: 'योग्य पैसे',
    tip3_body: '– स्पष्ट पैसे असलेली कामे लवकर स्वीकारली जातात.',
    tip4_title: 'सुरक्षित रहा',
    tip4_body: '– GenBridge चे सर्व सहाय्यक ओळख पडताळलेले आहेत.',
    safety_title: 'सुरक्षा हमी',
    safety_body: 'GenBridge च्या प्रत्येक सहाय्यकाची सरकारी ID ने ओळख पडताळली आहे. तुमची सुरक्षा ही आमची प्राथमिकता आहे.',
    post_success_title: 'काम पोस्ट झाले!',
    post_success_body: 'तुमचे काम आता जवळच्या सहाय्यकांना दिसत आहे. कोणी स्वीकारल्यावर तुम्हाला कळवले जाईल.',
    view_my_tasks: 'माझी कामे पहा',
    post_another: 'आणखी पोस्ट करा',
    // Dashboard
    dashboard_title: 'डॅशबोर्ड',
    good_morning: 'शुभ प्रभात',
    good_afternoon: 'शुभ दुपार',
    good_evening: 'शुभ संध्याकाळ',
    seeker_welcome_sub: 'एक काम पोस्ट करा आणि जवळच्या पडताळलेल्या सहाय्यकाकडून मदत मिळवा.',
    helper_welcome_sub: 'जवळची कामे पहा आणि समुदायाला मदत करा!',
    tasks_posted: 'पोस्ट केलेली कामे',
    helps_taken: 'घेतलेली मदत',
    completed: 'पूर्ण झाले',
    recent_tasks: 'अलीकडील कामे',
    latest_tasks: 'जवळची नवीन कामे',
    view_all: 'सर्व पहा',
    quick_actions: 'त्वरित क्रिया',
    qa_post: 'नवीन काम पोस्ट करा',
    qa_my_tasks: 'माझी कामे',
    qa_browse: 'सर्व कामे पहा',
    qa_nearby: 'जवळची कामे',
    qa_helps: 'माझी मदत',
    seeking_help: 'मदत हवी',
    helper_label: 'सहाय्यक',
    translate_btn: 'मराठीत भाषांतर करा',
  }
};

// Language helpers
function getLang() {
  return localStorage.getItem(LANG_KEY) || 'en';
}

function calculateDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function setLang(lang) {
  localStorage.setItem(LANG_KEY, lang);
  document.cookie = `googtrans=/en/${lang}; path=/`;
  document.cookie = `googtrans=/en/${lang}; path=/; domain=${window.location.hostname}`;
  window.location.reload();
}

function t(key) {
  const lang = getLang();
  return (I18N[lang] && I18N[lang][key]) || (I18N['en'][key]) || key;
}

// --- Avatar HTML: shows photo if available, else initials ---
function avatarHTML(name, photo, size = 34, fontSize = '0.85rem') {
  const initials = (name || '?').split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  if (photo) {
    return `<img src="${photo}" alt="${initials}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;flex-shrink:0;border:2px solid rgba(255,255,255,0.6);" />`;
  }
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:linear-gradient(135deg,#2F80ED,#1a5fc8);display:flex;align-items:center;justify-content:center;color:#fff;font-size:${fontSize};font-weight:700;flex-shrink:0;">${initials}</div>`;
}

// Language switcher HTML
function langSwitcherHTML() {
  const lang = getLang();
  const langs = [
    { code: 'en', label: 'EN', full: 'English' },
    { code: 'hi', label: 'हि', full: 'हिंदी' },
    { code: 'mr', label: 'म', full: 'मराठी' },
  ];
  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const themeIcon = currentTheme === 'dark' ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>' : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  return `<div style="display:flex;align-items:center;gap:10px;">
    <button class="theme-toggle" onclick="toggleTheme()" title="Toggle Theme" style="background:var(--auth-bg, #fff); border:1.5px solid var(--border); padding:4px 8px; border-radius:50px; cursor:pointer; font-size:1rem; display:flex; align-items:center; justify-content:center; width:34px; height:34px;">
      <span id="global-theme-icon">${themeIcon}</span>
    </button>
    <div class="lang-switcher" title="Language / भाषा / भाषा">
      ${langs.map(l => `<button class="lang-btn ${lang === l.code ? 'active' : ''}" onclick="setLang('${l.code}')" title="${l.full}">${l.label}</button>`).join('')}
    </div>
  </div>`;
}

// --- Render Navbar with photo and language switcher ---
function renderNavbar(activePage = '') {
  const user = Auth.getUser();
  const avgRating = user ? Reviews.getAverageForUser(user.id) : null;

  const navLinks = user ? (
    user.role === 'seeker' ? `
      <li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">${t('nav_dashboard')}</a></li>
      <li><a href="post-task.html" class="${activePage === 'post' ? 'active' : ''}">${t('nav_post')}</a></li>
      <li><a href="my-tasks.html" class="${activePage === 'my-tasks' ? 'active' : ''}">${t('nav_my_tasks')}</a></li>
      <li><a href="reviews.html" class="${activePage === 'reviews' ? 'active' : ''}">${t('nav_reviews')}</a></li>
    ` : `
      <li><a href="dashboard.html" class="${activePage === 'dashboard' ? 'active' : ''}">${t('nav_dashboard')}</a></li>
      <li><a href="tasks-nearby.html" class="${activePage === 'nearby' ? 'active' : ''}">${t('nav_nearby')}</a></li>
      <li><a href="my-tasks.html" class="${activePage === 'my-tasks' ? 'active' : ''}">${t('nav_my_helps')}</a></li>
      <li><a href="reviews.html" class="${activePage === 'reviews' ? 'active' : ''}">${t('nav_reviews')}</a></li>
    `
  ) : '';

  const userSection = user ? `
    <div class="navbar-user">
      <div class="user-badge" style="display:flex;align-items:center;gap:8px;background:var(--blue-light);padding:5px 14px 5px 5px;border-radius:50px;">
        ${avatarHTML(user.name, user.photo || null, 30, '0.75rem')}
        <span style="font-weight:600;font-size:0.9rem;color:var(--blue-dark);">${user.name.split(' ')[0]}</span>
        ${avgRating ? `<span style="font-size:0.8rem;color:#f59e0b;font-weight:700;">${avgRating}</span>` : ''}
        ${user.photo ? `<span style="font-size:0.75rem;color:var(--green);font-weight:700;">✓</span>` : ''}
        ${user.gender ? `<span style="font-size:0.75rem;color:var(--text-muted);">${user.gender === 'male' ? '' : user.gender === 'female' ? '' : ''}</span>` : ''}
      </div>
      ${langSwitcherHTML()}
      <button class="btn btn-outline" onclick="Auth.logout()" style="padding:0.45rem 1rem;font-size:0.85rem;">${t('nav_signout')}</button>
    </div>
  ` : `<div class="navbar-user">${langSwitcherHTML()}<a href="index.html" class="btn btn-primary">${t('nav_signin')}</a></div>`;

  return `
    <nav class="navbar">
      <a href="${user ? 'dashboard.html' : 'index.html'}" class="navbar-logo">
        <div class="logo-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color:#fff;"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg></div>GenBridge
      </a>
      <ul class="navbar-links">${navLinks}</ul>
      ${userSection}
    </nav>`;
}

function seedDemoTasks() {
  if (Tasks.getAll().length === 0) {
    const demos = [
      { title: 'Help with grocery shopping', description: 'Need help buying groceries from the nearby market. I have a list ready.', category: 'Shopping', location: 'Andheri West, Mumbai', pay: '₹200', postedBy: 'Savita Sharma', postedById: 'demo_1', urgent: false },
      { title: 'Tech help – video call setup', description: 'Need someone to help me set up WhatsApp video calling on my new phone.', category: 'Tech Help', location: 'Bandra, Mumbai', pay: '₹150', postedBy: 'Ramesh Mehta', postedById: 'demo_2', urgent: true },
      { title: 'Prescription pickup from pharmacy', description: 'Doctor prescribed medicines need to be picked up from pharmacy. Will provide address.', category: 'Errands', location: 'Dadar, Mumbai', pay: '₹100', postedBy: 'Sunita Patel', postedById: 'demo_3', urgent: true },
      { title: 'Gardening assistance', description: 'Need help with watering plants and light gardening in the building compound.', category: 'Household', location: 'Powai, Mumbai', pay: '₹300', postedBy: 'Govind Nair', postedById: 'demo_4', urgent: false },
      { title: 'Read newspaper aloud', description: 'My eyesight is weak. Need someone to read the newspaper to me for an hour.', category: 'Companionship', location: 'Mulund, Mumbai', pay: '₹120', postedBy: 'Leela Rao', postedById: 'demo_5', urgent: false },
    ];
    demos.forEach(t => Tasks.add(t));
  }
}

function getTimeAgo(iso) {
  if (!iso) return 'recently';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function starsHTML(rating) {
  let html = '';
  for (let i = 1; i <= 5; i++) html += `<span style="color:${i <= Math.round(rating) ? '#f59e0b' : '#d1d5db'};">★</span>`;
  return html;
}

(function addGoogleTranslate() {
  const style = document.createElement('style');
  style.innerHTML = `
    .goog-te-banner-frame.skiptranslate, .goog-te-gadget-icon { display: none !important; }
    body { top: 0px !important; }
    #goog-gt-tt { display: none !important; }
    .goog-tooltip { display: none !important; }
    .goog-tooltip:hover { display: none !important; }
    .goog-text-highlight { background-color: transparent !important; border: none !important; box-shadow: none !important; }
    #google_translate_element { display: none !important; }
  `;
  document.head.appendChild(style);

  const gtDiv = document.createElement('div');
  gtDiv.id = 'google_translate_element';
  document.body.appendChild(gtDiv);

  window.googleTranslateElementInit = function() {
    new google.translate.TranslateElement({
      pageLanguage: 'en',
      includedLanguages: 'en,hi,mr',
      autoDisplay: false
    }, 'google_translate_element');
  };

  const script = document.createElement('script');
  script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
  document.head.appendChild(script);
})();

const translationCache = {};
window.autoTranslateTasks = async function(node) {
  const targetLang = getLang();
  
  const fetchTrans = async (text) => {
    if (!text || text === '—') return text;
    const cacheKey = `${text.trim()}|${targetLang}`;
    if (translationCache[cacheKey]) return translationCache[cacheKey];
    try {
      const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=autodetect|${targetLang}`);
      const data = await res.json();
      const translated = data.responseData?.translatedText || text;
      
      // MyMemory API returns literal error strings if languages match or quota exceeded
      if (translated.includes("PLEASE SELECT TWO DISTINCT LANGUAGES") || 
          translated.includes("MYMEMORY WARNING")) {
        translationCache[cacheKey] = text;
        return text;
      }
      
      translationCache[cacheKey] = translated;
      return translated;
    } catch(e) {
      return text;
    }
  };

  const els = (node || document).querySelectorAll('.translate-text:not(.translated)');
    
  for (let el of els) {
    el.classList.add('translated');
    let sourceText = el.dataset.fullText || el.innerText;
    
    if (!sourceText.trim() || sourceText.trim() === '—') continue;

    fetchTrans(sourceText).then(translatedText => {
      if (el.dataset.maxLength) {
         const limit = parseInt(el.dataset.maxLength);
         if (translatedText.length > limit) {
            el.innerText = translatedText.slice(0, limit) + '…';
         } else {
            el.innerText = translatedText;
         }
      } else {
         el.innerText = translatedText;
      }
    });
  }
};

document.addEventListener('DOMContentLoaded', () => { setTimeout(() => window.autoTranslateTasks(document), 500); });
const observer = new MutationObserver((mutations) => {
  let shouldTranslate = false;
  for (let m of mutations) { if (m.addedNodes.length) { shouldTranslate = true; break; } }
  if (shouldTranslate) window.autoTranslateTasks(document);
});
observer.observe(document.body, { childList: true, subtree: true });
