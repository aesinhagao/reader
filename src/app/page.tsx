'use client'
import Image from "next/image";
import React, { useState, useEffect } from 'react';

interface LanguageMap {
  [key: string]: string;
}

const LANGUAGES: LanguageMap = {
  'vi-VN': 'Tiếng Việt',
  'zh-CN': '中文 (Chinese)',
  'en-US': 'English'
};

interface Styles {
  [key: string]: React.CSSProperties;
}

const styles: Styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  box: {
    maxWidth: '800px',
    margin: 'auto',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f8f9fa',
    borderRadius: '10px',
    boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)',
    width: '60%',
  },
  header: {
    textAlign: 'center',
    color: '#333',
    marginBottom: '20px',
  },
  select: {
    padding: '8px',
    marginBottom: '15px',
    width: '200px',
    borderRadius: '4px',
    border: '1px solid #ddd',
  },
  textarea: {
    width: '100%',
    height: '120px',
    padding: '10px',
    marginBottom: '15px',
    borderRadius: '4px',
    border: '1px solid #ddd',
    boxSizing: 'border-box',
  },
  controlGroup: {
    marginBottom: '15px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  control: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  slider: {
    flex: 1,
    maxWidth: '200px',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    margin: '10px 0',
  },
  wordContainer: {
    padding: '15px',
    backgroundColor: '#f8f9fa',
    borderRadius: '4px',
    minHeight: '50px',
    lineHeight: '1.6',
  },
  word: {
    display: 'inline-block',
    margin: '0 4px',
  },
  activeWord: {
    backgroundColor: '#cce5ff',
    padding: '2px 4px',
    borderRadius: '2px',
  }
};

const CHINESE_COMMON_WORDS: string[] = [
  '我们', '他们', '你们', '现在', '明天', '今天', '时间',
  '学习', '工作', '生活', '喜欢', '开心', '快乐', '谢谢',
  '你好', '再见', '吃饭', '睡觉', '看书', '说话'
];

const segmentChineseText = (text: string): string => {
  let segmentedText = text;
  CHINESE_COMMON_WORDS.forEach(word => {
    const regex = new RegExp(word, 'g');
    segmentedText = segmentedText.replace(regex, `${word} `);
  });

  return segmentedText.split('').join(' ');
};

const TextReader: React.FC = () => {
  const [text, setText] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [randomMode, setRandomMode] = useState<boolean>(false);
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(-1);
  const [words, setWords] = useState<string[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('vi-VN');

  useEffect(() => {
    let processed = text;
    if (selectedLanguage === 'zh-CN') {
      processed = segmentChineseText(text);
    }
    setWords(processed.split(/\s+/).filter(word => word.length > 0));
  }, [text, selectedLanguage]);

  const speak = (word: string): void => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(word);
    utterance.rate = speed;
    utterance.lang = selectedLanguage;
    window.speechSynthesis.speak(utterance);
  };

  const getPlaceholder = (): string => {
    switch (selectedLanguage) {
      case 'vi-VN': return 'Nhập văn bản cần đọc...';
      case 'zh-CN': return '输入要阅读的文字...';
      case 'en-US': return 'Enter text to read...';
      default: return 'Enter text...';
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | undefined;

    if (isPlaying && words.length > 0) {
      interval = setInterval(() => {
        if (randomMode) {
          const randomIndex = Math.floor(Math.random() * words.length);
          setCurrentWordIndex(randomIndex);
          speak(words[randomIndex]);
        } else {
          setCurrentWordIndex(prevIndex => {
            const nextIndex = prevIndex + 1;
            if (nextIndex >= words.length) {
              setIsPlaying(false);
              return -1;
            }
            speak(words[nextIndex]);
            return nextIndex;
          });
        }
      }, 1000 / speed);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isPlaying, words, speed, randomMode, selectedLanguage]);

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSpeed(parseFloat(e.target.value));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>): void => {
    setText(e.target.value);
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>): void => {
    setSelectedLanguage(e.target.value);
  };

  const togglePlayPause = (): void => {
    setIsPlaying(!isPlaying);
  };

  const handleRandomModeChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setRandomMode(e.target.checked);
  };

  return (
    <div style={styles.container}>
      <div style={styles.box}>
        <div style={styles.header}>
          <h2>Text Reader (VN-CN-EN)</h2>
        </div>

        <select aria-label="label for the select"
          style={styles.select}
          value={selectedLanguage}
          onChange={handleLanguageChange}
        >
          {Object.entries(LANGUAGES).map(([code, name]) => (
            <option key={code} value={code}>
              {name}
            </option>
          ))}
        </select>

        <textarea
          style={styles.textarea}
          value={text}
          onChange={handleTextChange}
          placeholder={getPlaceholder()}
        />

        <div style={styles.controlGroup}>
          <div style={styles.control}>
            <label>Tốc độ đọc: </label>
            <input
              aria-label="label for the select"
              type="range"
              style={styles.slider}
              min={0.5}
              max={2}
              step={0.1}
              value={speed}
              onChange={handleSpeedChange}
            />
            <span>{speed}x</span>
          </div>

          <div style={styles.control}>
            <label>
              <input
                style={{ marginRight: '10px' }}
                type="checkbox"
                checked={randomMode}
                onChange={handleRandomModeChange}
              />
              Đọc ngẫu nhiên
            </label>
          </div>

          <button
            style={styles.button}
            onClick={togglePlayPause}
          >
            {isPlaying ? 'Dừng' : 'Đọc'}
          </button>
        </div>

        <div style={styles.wordContainer}>
          {words.map((word, index) => (
            <span
              key={index}
              style={{
                ...styles.word,
                ...(index === currentWordIndex ? styles.activeWord : {})
              }}
            >
              {word}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TextReader;
