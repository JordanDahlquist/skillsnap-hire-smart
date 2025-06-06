
export const getWelcomeMessage = (name: string): string => {
  const messages = [
    `Welcome back, ${name}!`,
    `Great to see you again, ${name}!`,
    `Hello ${name}! Ready to find amazing talent?`,
    `Welcome back, ${name}! Let's build something great together.`,
    `Hi ${name}! Time to discover your next star hire.`,
    `Good to have you back, ${name}!`,
    `Welcome ${name}! Your next great hire awaits.`,
    `Hey ${name}! Ready to connect with top talent?`,
    `Welcome back, ${name}! Let's make some magic happen.`,
    `Hi there, ${name}! Your hiring journey continues.`,
    `Welcome ${name}! Fresh talent is just a click away.`,
    `Great to see you, ${name}! Let's find your perfect match.`
  ];

  // Use a combination of date and name length for semi-predictable rotation
  const today = new Date();
  const seed = today.getDate() + today.getMonth() + name.length;
  const index = seed % messages.length;
  
  return messages[index];
};

export const getWelcomeSubtitle = (): string => {
  const subtitles = [
    "Manage your job postings and track applications",
    "Your talent pipeline awaits",
    "Connect with amazing candidates today",
    "Build your dream team, one hire at a time",
    "Quality candidates are ready to impress you",
    "Your next breakthrough hire is here",
    "Discover talent that moves your business forward"
  ];

  // Rotate subtitles based on the day of the week
  const today = new Date();
  const index = today.getDay() % subtitles.length;
  
  return subtitles[index];
};
