const PROMPTS = [
  "What's one thing you did today that felt meaningful?",
  "What's been weighing on your mind lately?",
  "Describe a small win from today.",
  "What are you looking forward to tomorrow?",
  "What's something you want to let go of?",
  "What made you smile today?",
  "What would you tell your past self from a year ago?",
  "What's one thing you're grateful for right now?",
  "What's a challenge you're currently navigating?",
  "What does success look like for you this week?",
  "What are you avoiding, and why?",
  "What conversation do you need to have?",
  "What's draining your energy right now?",
  "What's something you learned recently?",
  "Where do you want to be in 3 months?",
  "What's one habit you'd like to build?",
  "What's one habit you'd like to break?",
  "Describe your ideal tomorrow.",
  "What's something you're proud of this week?",
  "What's something you wish you'd done differently today?",
  "What's exciting you right now?",
  "Who do you want to reach out to?",
  "What's the most important thing on your plate?",
  "What's something that scared you recently?",
  "What does rest mean to you right now?",
  "What's a belief you're questioning?",
  "What would you do if you knew you couldn't fail?",
  "What's a problem you've been overthinking?",
  "What's something that brought you peace today?",
  "What's one small thing you can do tomorrow to feel better?",
  "What's your current definition of enough?",
  "What does your future self thank you for?",
  "What's something you need to forgive yourself for?",
  "What's one thing you'd like more of in your life?",
  "What's one thing you'd like less of?",
  "Who inspires you right now and why?",
  "What are you learning about yourself lately?",
  "What would make this week feel complete?",
  "What's something you've been putting off?",
  "Just write. Start anywhere.",
]

export function getDailyPrompt(dateStr: string): string {
  const hash = dateStr.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PROMPTS[hash % PROMPTS.length]
}

export function getRandomPrompt(exclude?: string): string {
  const pool = exclude ? PROMPTS.filter(p => p !== exclude) : PROMPTS
  return pool[Math.floor(Math.random() * pool.length)]
}
