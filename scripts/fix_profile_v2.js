const fs = require('fs');
const config = { encoding: 'utf8' };
const path = 'helpji-fixed/src/screens/helper/Profile.jsx';

// Read the file content
let content = fs.readFileSync(path, config);
let modified = false;

// Fix 1: Service radius section - add missing </div> closing
const fix1Search = '<span className="font-mono font-bold text-[16px] min-w-[48px] text-right">{selectedRadius} km</span>\n              </div>\n            <div className="mb-6">';
const fix1Replace = '<span className="font-mono font-bold text-[16px] min-w-[48px] text-right">{selectedRadius} km</span>\n              </div>\n            </div>\n            <div className="mb-6">';

if (content.includes(fix1Search)) {
  content = content.replace(fix1Search, fix1Replace);
  modified = true;
  console.log('Fix 1 applied');
}

// Fix 2: Stats grid - the three cards are missing closing </div> tags
// Let me search for the pattern and fix it
const fix2Search = '<div className="bg-paper-card border border-line rounded-xl p-3">\n          <div className="text-[10px] text-ink-soft font-mono uppercase">Rating</div>\n          <div className="font-bold text-ink mt-1">{displayProfile.rating.toFixed(1)}</div>\n        <div className="bg-paper-card border border-line rounded-xl p-3">\n          <div className="text-[10px] text-ink-soft font-mono uppercase">Tasks</div>\n          <div className="font-bold text-ink mt-1">{displayProfile.completedTasks}</div>\n        <div className="bg-paper-card border border-line rounded-xl p-3">\n          <div className="text-[10px] text-ink-soft font-mono uppercase">Accept</div>\n          <div className="font-bold text-ink mt-1">{displayProfile.acceptanceRate}%</div>\n      </div>\n      </div>';

const fix2Replace = '<div className="bg-paper-card border border-line rounded-xl p-3">\n          <div className="text-[10px] text-ink-soft font-mono uppercase">Rating</div>\n          <div className="font-bold text-ink mt-1">{displayProfile.rating.toFixed(1)}</div>\n        </div>\n        <div className="bg-paper-card border border-line rounded-xl p-3">\n          <div className="text-[10px] text-ink-soft font-mono uppercase">Tasks</div>\n          <div className="font-bold text-ink mt-1">{displayProfile.completedTasks}</div>\n        </div>\n        <div className="bg-paper-card border border-line rounded-xl p-3">\n          <div className="text-[10px] text-ink-soft font-mono uppercase">Accept</div>\n          <div className="font-bold text-ink mt-1">{displayProfile.acceptanceRate}%</div>\n        </div>\n      </div>';

if (content.includes(fix2Search)) {
  content = content.replace(fix2Search, fix2Replace);
  modified = true;
  console.log('Fix 2 applied');
}

// Fix 3: Contact info section - missing closing </div>
const fix3Search = '<div className="flex justify-between items-center py-3 border-b border-line">\n          <h4 className="text-[13.5px] font-semibold">{t(\'memberSince\')}</h4>\n          <div>{displayProfile.memberSince}</div>\n        <div className="flex justify-between items-center py-3 border-b border-line">\n          <h4 className="text-[13.5px] font-semibold">Phone</h4>\n          <div>{displayProfile.phone}</div>\n        <div className="flex justify-between items-center py-3">\n          <h4 className="text-[13.5px] font-semibold">Email</h4>\n          <div>{displayProfile.email}</div>\n      </div>\n      </div>';

const fix3Replace = '<div className="flex justify-between items-center py-3 border-b border-line">\n          <h4 className="text-[13.5px] font-semibold">{t(\'memberSince\')}</h4>\n          <div>{displayProfile.memberSince}</div>\n        </div>\n        <div className="flex justify-between items-center py-3 border-b border-line">\n          <h4 className="text-[13.5px] font-semibold">Phone</h4>\n          <div>{displayProfile.phone}</div>\n        </div>\n        <div className="flex justify-between items-center py-3">\n          <h4 className="text-[13.5px] font-semibold">Email</h4>\n          <div>{displayProfile.email}</div>\n        </div>\n      </div>';

if (content.includes(fix3Search)) {
  content = content.replace(fix3Search, fix3Replace);
  modified = true;
  console.log('Fix 3 applied');
}

if (modified) {
  fs.writeFileSync(path, content, config);
  console.log('All fixes applied successfully!');
} else {
  console.log('No fixes applied - patterns may have changed. Checking file content...');
  // Debug: Print first 2000 chars
  console.log('=== FIRST 2000 CHARS ===');
  console.log(content.substring(0, 2000));
  console.log('=== END FIRST 2000 CHARS ===');
}
