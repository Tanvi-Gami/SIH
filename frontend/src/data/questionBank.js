/**
 * A small local question bank used to generate a genuine (not purely
 * self-reported) skill assessment. Each skill maps to 1-2 multiple-choice
 * questions; skills without a question bank entry fall back to a
 * self-rating slider only.
 */
export const QUESTION_BANK = {
  Python: [
    {
      q: 'What does the following return? `len([1, 2, [3, 4]])`',
      options: ['4', '3', '2', 'Error'],
      answer: '3',
    },
    {
      q: 'Which keyword is used to define a function in Python?',
      options: ['func', 'def', 'function', 'lambda'],
      answer: 'def',
    },
  ],
  SQL: [
    {
      q: 'Which SQL clause is used to filter grouped rows?',
      options: ['WHERE', 'HAVING', 'GROUP BY', 'ORDER BY'],
      answer: 'HAVING',
    },
    {
      q: 'Which JOIN returns all rows from the left table, matched or not?',
      options: ['INNER JOIN', 'RIGHT JOIN', 'LEFT JOIN', 'CROSS JOIN'],
      answer: 'LEFT JOIN',
    },
  ],
  React: [
    {
      q: 'Which hook lets you run side effects in a function component?',
      options: ['useMemo', 'useEffect', 'useRef', 'useReducer'],
      answer: 'useEffect',
    },
    {
      q: 'What do you pass to re-render a list efficiently in React?',
      options: ['a class name', 'a unique "key" prop', 'a ref', 'an index only'],
      answer: 'a unique "key" prop',
    },
  ],
  'Machine Learning': [
    {
      q: 'Which technique helps prevent overfitting in a model?',
      options: ['Increasing model size only', 'Regularization', 'Removing all validation data', 'Using a single epoch always'],
      answer: 'Regularization',
    },
    {
      q: 'What is the purpose of a train/validation/test split?',
      options: ['To slow down training', 'To evaluate generalization honestly', 'It has no real purpose', 'To reduce dataset size'],
      answer: 'To evaluate generalization honestly',
    },
  ],
  'Deep Learning': [
    {
      q: 'What does a ReLU activation output for negative inputs?',
      options: ['The input unchanged', '0', '1', 'Infinity'],
      answer: '0',
    },
  ],
  NLP: [
    {
      q: 'What does "tokenization" refer to in NLP?',
      options: ['Encrypting text', 'Splitting text into smaller units', 'Translating text', 'Compressing text'],
      answer: 'Splitting text into smaller units',
    },
  ],
  AWS: [
    {
      q: 'Which AWS service is primarily used for object storage?',
      options: ['EC2', 'S3', 'Lambda', 'RDS'],
      answer: 'S3',
    },
  ],
  Docker: [
    {
      q: 'What does a Dockerfile define?',
      options: ['A network policy', 'The steps to build a container image', 'A database schema', 'A CI pipeline only'],
      answer: 'The steps to build a container image',
    },
  ],
  Cybersecurity: [
    {
      q: 'What does "phishing" primarily attempt to do?',
      options: ['Speed up a network', 'Trick users into revealing sensitive information', 'Encrypt files for backup', 'Optimize a database'],
      answer: 'Trick users into revealing sensitive information',
    },
  ],
  'Node.js': [
    {
      q: 'Node.js is built on which JavaScript engine?',
      options: ['SpiderMonkey', 'V8', 'Chakra', 'JavaScriptCore'],
      answer: 'V8',
    },
  ],
  'Data Analysis': [
    {
      q: 'Which measure best describes the "spread" of a dataset?',
      options: ['Mean', 'Standard deviation', 'Mode', 'Count'],
      answer: 'Standard deviation',
    },
  ],
};

export const SITUATIONAL_SKILLS = ['Communication', 'Problem Solving', 'Teamwork', 'Critical Thinking', 'Leadership'];

export const SITUATIONAL_QUESTIONS = {
  'Problem Solving': {
    q: 'A production API is suddenly slow. What is the best first step?',
    options: ['Restart everything immediately', 'Check logs/metrics to isolate the cause', 'Rewrite the whole service', 'Ignore it until users complain more'],
    answer: 'Check logs/metrics to isolate the cause',
  },
  Communication: {
    q: 'Your teammate misunderstood a requirement you wrote. What helps most next time?',
    options: ['Assume they will figure it out', 'Write clearer specs with examples and confirm understanding', 'Avoid writing anything', 'Blame the teammate'],
    answer: 'Write clearer specs with examples and confirm understanding',
  },
  Teamwork: {
    q: 'Two team members disagree on a technical approach. What is the best action?',
    options: ['Pick a side immediately', 'Facilitate a discussion around trade-offs and data', 'Ignore the conflict', 'Escalate without context'],
    answer: 'Facilitate a discussion around trade-offs and data',
  },
  'Critical Thinking': {
    q: 'A dataset shows a surprising correlation. What should you do first?',
    options: ['Publish it immediately', 'Check for confounding variables and data quality', 'Assume causation', 'Delete the data'],
    answer: 'Check for confounding variables and data quality',
  },
  Leadership: {
    q: 'A junior teammate is struggling with a task close to a deadline. Best move?',
    options: ['Take over silently', 'Check in, unblock them, and pair if needed', 'Reassign without discussion', 'Wait and see'],
    answer: 'Check in, unblock them, and pair if needed',
  },
};
