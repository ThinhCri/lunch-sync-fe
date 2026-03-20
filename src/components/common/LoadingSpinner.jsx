import { Spin } from 'antd';
import styles from './LoadingSpinner.module.css';

export function LoadingSpinner({ tip, fullScreen = false }) {
  if (fullScreen) {
    return (
      <div className={styles.fullScreen}>
        <Spin size="large" />
        {tip && <p className={styles.tip}>{tip}</p>}
      </div>
    );
  }
  return <Spin size="large" tip={tip} />;
}
