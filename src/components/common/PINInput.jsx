import { useRef } from 'react';
import styles from './PINInput.module.css';

export function PINInput({ value, onChange, length = 6, error }) {
  const inputRef = useRef(null);

  const handleChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, length);
    onChange(val);
    if (val.length === length) {
      inputRef.current?.blur();
    }
  };

  const handleClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Backspace' && value.length === 0) {
      // do nothing
    }
  };

  return (
    <div className={styles.wrapper}>
      <div
        className={`${styles.container} ${error ? styles.error : ''}`}
        onClick={handleClick}
      >
        {Array.from({ length }).map((_, i) => (
          <div
            key={i}
            className={`${styles.cell} ${value[i] ? styles.filled : ''} ${i === value.length ? styles.active : ''}`}
          >
            {value[i] || ''}
          </div>
        ))}
        <input
          ref={inputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={styles.hiddenInput}
          autoComplete="off"
        />
      </div>
      {error && <p className={styles.errorMsg}>{error}</p>}
    </div>
  );
}
