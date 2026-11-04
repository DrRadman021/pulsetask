/**
 * PulseTask Smart Natural Language Parser
 * Extracts Title, Priority, Due Date, Time, and Recurrence in both English and Persian.
 */

export interface ParsedTaskInput {
  title: string;
  dueDate: string | null; // YYYY-MM-DD
  dueTime: string | null; // HH:mm
  priority: 'p1' | 'p2' | 'p3' | 'p4';
  recurring: 'none' | 'daily' | 'weekly' | 'monthly';
}

function normalizeDigits(str: string): string {
  const persianDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const arabicDigits = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  let res = str;
  for (let i = 0; i <= 9; i++) {
    res = res.split(persianDigits[i]).join(String(i));
    res = res.split(arabicDigits[i]).join(String(i));
  }
  return res;
}

export function parseNaturalLanguageTask(input: string): ParsedTaskInput {
  let text = input.trim();
  let normalizedText = normalizeDigits(text);

  let priority: 'p1' | 'p2' | 'p3' | 'p4' = 'p4';
  let dueDate: string | null = null;
  let dueTime: string | null = null;
  let recurring: 'none' | 'daily' | 'weekly' | 'monthly' = 'none';

  const today = new Date();

  // 1. Extract Priority (p1, p2, p3, p4 or !1, !2, !3, !4)
  const priorityMatch = normalizedText.match(/\b(p[1-4]|![1-4])\b/i);
  if (priorityMatch) {
    const val = priorityMatch[1].toLowerCase().replace('!', 'p');
    priority = val as 'p1' | 'p2' | 'p3' | 'p4';
    text = text.replace(new RegExp(priorityMatch[0], 'i'), '').trim();
    normalizedText = normalizeDigits(text);
  }

  // 2. Extract Recurrence
  if (/\b(every day|daily|هر روز)\b/i.test(normalizedText)) {
    recurring = 'daily';
    text = text.replace(/(every day|daily|هر روز)/gi, '').trim();
    normalizedText = normalizeDigits(text);
  } else if (/\b(every week|weekly|هر هفته)\b/i.test(normalizedText)) {
    recurring = 'weekly';
    text = text.replace(/(every week|weekly|هر هفته)/gi, '').trim();
    normalizedText = normalizeDigits(text);
  } else if (/\b(every month|monthly|هر ماه)\b/i.test(normalizedText)) {
    recurring = 'monthly';
    text = text.replace(/(every month|monthly|هر ماه)/gi, '').trim();
    normalizedText = normalizeDigits(text);
  }

  // 3. Extract Time (English: at 5pm, 14:30; Persian: ساعت ۱۶, ساعت ۵ عصر, ساعت ۱۰:۳۰)
  const timeMatchEn = normalizedText.match(/\b(at\s+)?(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatchEn) {
    let hour = parseInt(timeMatchEn[2], 10);
    const minute = timeMatchEn[3] ? parseInt(timeMatchEn[3], 10) : 0;
    const meridian = timeMatchEn[4].toLowerCase();

    if (meridian === 'pm' && hour < 12) hour += 12;
    if (meridian === 'am' && hour === 12) hour = 0;

    dueTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    text = text.replace(new RegExp(timeMatchEn[0], 'i'), '').trim();
    normalizedText = normalizeDigits(text);
  } else {
    // Check Persian/24hr format: e.g. "ساعت 16:30" or "ساعت 16" or "14:00"
    const timeMatchFa = normalizedText.match(/(?:ساعت\s*)?(\d{1,2})(?::(\d{2}))?(?:\s*(عصر|بعد از ظهر|صبح|شب))?/i);
    if (timeMatchFa && (timeMatchFa[0].includes('ساعت') || timeMatchFa[2])) {
      let hour = parseInt(timeMatchFa[1], 10);
      const minute = timeMatchFa[2] ? parseInt(timeMatchFa[2], 10) : 0;
      const period = timeMatchFa[3];

      if (period && (period.includes('عصر') || period.includes('بعد از ظهر') || period.includes('شب')) && hour < 12) {
        hour += 12;
      }

      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        dueTime = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        // Remove the matched phrase from original text
        text = text.replace(/ساعت\s*[\d۰-۹]+(?::[\d۰-۹]+)?(?:\s*(?:عصر|بعد از ظهر|صبح|شب))?/gi, '').trim();
        normalizedText = normalizeDigits(text);
      }
    }
  }

  // 4. Extract Due Date (today, tomorrow, next week, specific day)
  const pad = (n: number) => String(n).padStart(2, '0');
  const formatDateStr = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  if (/(day after tomorrow|پس[\u200c ]?فردا)/i.test(normalizedText)) {
    const t = new Date(today);
    t.setDate(t.getDate() + 2);
    dueDate = formatDateStr(t);
    text = text.replace(/(day after tomorrow|پس[\u200c ]?فردا)/gi, '').trim();
    normalizedText = normalizeDigits(text);
  } else if (/(tomorrow|فردا)/i.test(normalizedText)) {
    const t = new Date(today);
    t.setDate(t.getDate() + 1);
    dueDate = formatDateStr(t);
    text = text.replace(/(tomorrow|فردا)/gi, '').trim();
    normalizedText = normalizeDigits(text);
  } else if (/(today|امروز)/i.test(normalizedText)) {
    dueDate = formatDateStr(today);
    text = text.replace(/(today|امروز)/gi, '').trim();
    normalizedText = normalizeDigits(text);
  } else if (/(next week|هفته آینده|هفته بعد)/i.test(normalizedText)) {
    const t = new Date(today);
    t.setDate(t.getDate() + 7);
    dueDate = formatDateStr(t);
    text = text.replace(/(next week|هفته آینده|هفته بعد)/gi, '').trim();
  }

  // Clean trailing prepositions, separators & whitespace
  text = text.replace(/\s+/g, ' ').replace(/(^\s*[-–—:]\s*|\s*[-–—:]\s*$)/g, '').trim();

  return {
    title: text || input,
    dueDate,
    dueTime,
    priority,
    recurring
  };
}
