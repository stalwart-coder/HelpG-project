
const path = 'helpji-fixed/src/screens/helper/Profile.jsx';
let content = fs.readFileSync(path, 'utf8');

// Fix 1: Missing closing div after service radius
let target1 = `<span className="font-mono font-bold text-[16px] min-w-[48px] text-right">{selectedRadius} km</span>
              </div>
            <div className="mb-6">`;

let replacement1 = `<span className="font-mono font-bold text-[16px] min-w-[48px] text-right">{selectedRadius} km</span>
              </div>
            <div className="mb-6">`;

content = content.replace(target1, replacement1);

// Fix 2: Stats grid - missing closing /div tags
let target2 = `<div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Rating</div>
          <div className="font-bold text-ink mt-1">{displayProfile.rating.toFixed(1)}</div>
        <div className="bg-paper-card border border-line rounded-xl p-3">`;

let replacement2 = `<div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Rating</div>
          <div className="font-bold text-ink mt-1">{displayProfile.rating.toFixed(1)}</div>
        <div className="bg-paper-card border border-line rounded-xl p-3">`;

content = content.replace(target2, replacement2);

let target3 = `<div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Tasks</div>
          <div className="font-bold text-ink mt-1">{displayProfile.completedTasks}</div>
        <div className="bg-paper-card border border-line rounded-xl p-3">`;

let replacement3 = `<div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Tasks</div>
          <div className="font-bold text-ink mt-1">{displayProfile.completedTasks}</div>
        <div className="bg-paper-card border border-line rounded-xl p-3">`;

content = content.replace(target3, replacement3);

let target4 = `<div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Accept</div>
          <div className="font-bold text-ink mt-1">{displayProfile.acceptanceRate}%</div>`;

let replacement4 = `<div className="bg-paper-card border border-line rounded-xl p-3">
          <div className="text-[10px] text-ink-soft font-mono uppercase">Accept</div>
          <div className="font-bold text-ink mt-1">{displayProfile.acceptanceRate}%</div>
      </div>`;

content = content.replace(target4, replacement4);

// Fix 3: Contact info section - missing closing /div tags
let target5 = `<div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">{t('memberSince')}</h4>
          <div>{displayProfile.memberSince}</div>
        <div className="flex justify-between items-center py-3 border-b border-line">`;

let replacement5 = `<div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">{t('memberSince')}</h4>
          <div>{displayProfile.memberSince}</div>
        <div className="flex justify-between items-center py-3 border-b border-line">`;

content = content.replace(target5, replacement5);

let target6 = `<div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">Phone</h4>
          <div>{displayProfile.phone}</div>
        <div className="flex justify-between items-center py-3">`;

let replacement6 = `<div className="flex justify-between items-center py-3 border-b border-line">
          <h4 className="text-[13.5px] font-semibold">Phone</h4>
          <div>{displayProfile.phone}</div>
        <div className="flex justify-between items-center py-3">`;

content = content.replace(target6, replacement6);

let target7 = `<div className="flex justify-between items-center py-3">
          <h4 className="text-[13.5px] font-semibold">Email</h4>
          <div>{displayProfile.email}</div>`;

let replacement7 = `<div className="flex justify-between items-center py-3">
          <h4 className="text-[13.5px] font-semibold">Email</h4>
          <div>{displayProfile.email}</div>
      </div>`;

content = content.replace(target7, replacement7);

fs.writeFileSync(path, content, 'utf8');
console.log('File fixed successfully');
