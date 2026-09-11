import React, { useState } from 'react';

interface DisguiseCalculatorProps {
  onClose: () => void;
}

export const DisguiseCalculator: React.FC<DisguiseCalculatorProps> = ({ onClose }) => {
  const [display, setDisplay] = useState('0');
  const [prevVal, setPrevVal] = useState<number | null>(null);
  const [op, setOp] = useState<string | null>(null);
  const [resetNext, setResetNext] = useState(false);

  const handleNumber = (n: string) => {
    if (display === '0' || resetNext) {
      setDisplay(n);
      setResetNext(false);
    } else {
      setDisplay(display + n);
    }
  };

  const handleOp = (operation: string) => {
    setPrevVal(parseFloat(display));
    setOp(operation);
    setResetNext(true);
  };

  const handleEqual = () => {
    if (op && prevVal !== null) {
      const current = parseFloat(display);
      let result = 0;
      switch (op) {
        case '+': result = prevVal + current; break;
        case '-': result = prevVal - current; break;
        case '×': result = prevVal * current; break;
        case '÷': result = current !== 0 ? prevVal / current : 0; break;
      }
      setDisplay(String(Math.round(result * 100000) / 100000));
      setPrevVal(null);
      setOp(null);
      setResetNext(true);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setPrevVal(null);
    setOp(null);
    setResetNext(false);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-[#1c1c1e] text-white flex flex-col justify-between p-4 max-w-md mx-auto shadow-2xl">
      {/* Top discreet bar */}
      <div className="flex items-center justify-between pt-2 pb-4 border-b border-neutral-800">
        <div className="flex items-center gap-1.5 text-neutral-400 text-xs font-mono">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Calculadora Científica Padrão</span>
        </div>
        <button
          onClick={onClose}
          className="text-xs bg-neutral-800/80 hover:bg-neutral-700 text-neutral-300 px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-neutral-700 active:scale-95 transition-all"
          title="Sair do modo camuflado"
        >
          <span className="material-symbols-outlined text-[16px] text-teal-400">shield</span>
          <span>Voltar ao Combatbullying</span>
        </button>
      </div>

      {/* Screen */}
      <div className="flex flex-col items-end justify-end px-4 py-8">
        <div className="text-neutral-400 text-sm h-6">
          {prevVal !== null && op ? `${prevVal} ${op}` : ''}
        </div>
        <div className="text-5xl font-light tracking-tight font-mono overflow-hidden text-ellipsis max-w-full">
          {display}
        </div>
      </div>

      {/* Keypad */}
      <div className="grid grid-cols-4 gap-3 pb-6">
        <button
          onClick={handleClear}
          className="h-16 rounded-full bg-[#a5a5a5] text-black font-semibold text-xl active:bg-neutral-300 transition-colors"
        >
          AC
        </button>
        <button
          onClick={() => setDisplay(String(parseFloat(display) * -1))}
          className="h-16 rounded-full bg-[#a5a5a5] text-black font-semibold text-xl active:bg-neutral-300 transition-colors"
        >
          ±
        </button>
        <button
          onClick={() => setDisplay(String(parseFloat(display) / 100))}
          className="h-16 rounded-full bg-[#a5a5a5] text-black font-semibold text-xl active:bg-neutral-300 transition-colors"
        >
          %
        </button>
        <button
          onClick={() => handleOp('÷')}
          className="h-16 rounded-full bg-[#ff9f0a] text-white font-semibold text-2xl active:bg-amber-600 transition-colors"
        >
          ÷
        </button>

        {['7', '8', '9'].map(n => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-16 rounded-full bg-[#333333] text-white font-medium text-2xl active:bg-neutral-600 transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOp('×')}
          className="h-16 rounded-full bg-[#ff9f0a] text-white font-semibold text-2xl active:bg-amber-600 transition-colors"
        >
          ×
        </button>

        {['4', '5', '6'].map(n => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-16 rounded-full bg-[#333333] text-white font-medium text-2xl active:bg-neutral-600 transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOp('-')}
          className="h-16 rounded-full bg-[#ff9f0a] text-white font-semibold text-2xl active:bg-amber-600 transition-colors"
        >
          −
        </button>

        {['1', '2', '3'].map(n => (
          <button
            key={n}
            onClick={() => handleNumber(n)}
            className="h-16 rounded-full bg-[#333333] text-white font-medium text-2xl active:bg-neutral-600 transition-colors"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleOp('+')}
          className="h-16 rounded-full bg-[#ff9f0a] text-white font-semibold text-2xl active:bg-amber-600 transition-colors"
        >
          +
        </button>

        <button
          onClick={() => handleNumber('0')}
          className="h-16 col-span-2 rounded-full bg-[#333333] text-white font-medium text-2xl pl-7 text-left active:bg-neutral-600 transition-colors"
        >
          0
        </button>
        <button
          onClick={() => {
            if (!display.includes('.')) setDisplay(display + '.');
          }}
          className="h-16 rounded-full bg-[#333333] text-white font-medium text-2xl active:bg-neutral-600 transition-colors"
        >
          ,
        </button>
        <button
          onClick={handleEqual}
          className="h-16 rounded-full bg-[#ff9f0a] text-white font-semibold text-2xl active:bg-amber-600 transition-colors"
        >
          =
        </button>
      </div>

      <div className="text-center text-[11px] text-neutral-500 pb-2">
        Modo Camuflagem Seguro ativado. Seus dados estão preservados em sigilo.
      </div>
    </div>
  );
};
