const PROMPTS = [
  "How do I treat burns?",
  "How to perform CPR?",
  "What should I do during an earthquake?",
  "Someone is choking.",
  "Heatstroke first aid.",
  "Snake bite treatment.",
  "Fire safety tips.",
  "Road accident response."
];

const SuggestedPrompts = ({ onSelectPrompt, disabled }) => {
  return (
    <div className="flex flex-wrap gap-2 p-2">
      {PROMPTS.map((prompt) => (
        <button
          key={prompt}
          disabled={disabled}
          onClick={() => onSelectPrompt(prompt)}
          className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/50 rounded-full px-3 py-1.5 transition-colors cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {prompt}
        </button>
      ))}
    </div>
  );
};

export default SuggestedPrompts;
