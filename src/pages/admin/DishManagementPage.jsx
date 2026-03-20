import { useState, useEffect } from 'react';
import { mockHandlers } from '@/api/mock';
import AdminLayout from '@/components/admin/AdminLayout';
import styles from './DishManagementPage.module.css';

const PROFILE_LABELS = {
  soupy: 'Nước/Soupy',
  temperature: 'Nóng',
  heaviness: 'Độ no/nặng',
  flavor_intensity: 'Đậm vị',
  spicy: 'Cay',
  texture_complexity: 'Texture phức tạp',
  time_required: 'Thời gian ăn',
  novelty: 'Độ lạ/mới',
  healthy: 'Healthy',
  communal: 'Tính chia sẻ',
};

export default function DishManagementPage() {
  const [dishes, setDishes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDish, setSelectedDish] = useState(null);
  const [editingProfile, setEditingProfile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [expandedDiffId, setExpandedDiffId] = useState(null);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [cacheDone, setCacheDone] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);

  useEffect(() => {
    mockHandlers.getDishes().then(res => {
      setDishes(res);
      setLoading(false);
    });
  }, []);

  const openDrawer = (dish) => {
    setSelectedDish(dish);
    setEditingProfile(dish.profile || {});
  };

  const closeDrawer = () => {
    setSelectedDish(null);
    setEditingProfile(null);
  };

  const handleSaveProfile = async () => {
    if (!selectedDish) return;
    setSaving(true);
    const res = await mockHandlers.updateDishProfile(selectedDish.id, editingProfile);
    if (!res.error) {
      setDishes(prev => prev.map(d => d.id === selectedDish.id ? {
        ...d,
        profile: editingProfile,
        version: res.dish.version,
        lastDiff: res.diff,
      } : d));
    }
    setSaving(false);
    closeDrawer();
  };

  const handleExport = async () => {
    setExportLoading(true);
    const data = await mockHandlers.exportDishes();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'lunchsync-dishes.json';
    a.click();
    URL.revokeObjectURL(url);
    setExportLoading(false);
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const arr = Array.isArray(parsed) ? parsed : parsed.dishes || [];
      const res = await mockHandlers.uploadDishes(arr);
      setDishes(await mockHandlers.getDishes());
      alert(`Đã import thành công ${res.count} món`);
    } catch {
      alert('File không hợp lệ. Vui lòng upload JSON.');
    }
    setUploadFile(null);
  };

  const handleReloadCache = async () => {
    setCacheLoading(true);
    await mockHandlers.reloadDishCache();
    setCacheLoading(false);
    setCacheDone(true);
    setTimeout(() => setCacheDone(false), 3000);
  };

  return (
    <AdminLayout>
      <div className={styles.actionBar}>
        <button
          className={`${styles.cacheBtn} ${cacheDone ? styles.cacheDone : ''}`}
          onClick={handleReloadCache}
          disabled={cacheLoading}
        >
          {cacheLoading ? (
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
          ) : cacheDone ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
            </svg>
          )}
          {cacheDone ? 'Đã cập nhật!' : 'Reload Cache'}
        </button>

        <div className={styles.rightActions}>
          <label className={styles.uploadLabel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="17 8 12 3 7 8"/>
              <line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            Upload JSON
            <input
              type="file"
              accept=".json"
              className={styles.fileInput}
              onChange={handleUpload}
            />
          </label>

          <button
            className={styles.exportBtn}
            onClick={handleExport}
            disabled={exportLoading}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
              <polyline points="7 10 12 15 17 10"/>
              <line x1="12" y1="15" x2="12" y2="3"/>
            </svg>
            Export JSON
          </button>
        </div>
      </div>

      {/* Dish table */}
      <div className={styles.tableWrap}>
        {loading ? (
          <div className={styles.loadingState}>
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            <p>Đang tải...</p>
          </div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Tên món</th>
                <th>Category</th>
                <th>Phiên bản</th>
                <th>Thay đổi gần nhất</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {dishes.map(dish => (
                <tr key={dish.id}>
                  <td className={styles.dishName}>{dish.name}</td>
                  <td className={styles.dishCategory}>{dish.category}</td>
                  <td>
                    <span className={styles.versionBadge}>v{dish.version ?? 1}</span>
                  </td>
                  <td>
                    {dish.lastDiff && dish.lastDiff.length > 0 ? (() => {
                      const sorted = [...dish.lastDiff].sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
                      const top2 = sorted.slice(0, 2);
                      const rest = sorted.slice(2);
                      const isExpanded = expandedDiffId === dish.id;
                      return (
                        <div className={styles.diffContainer}>
                          {(isExpanded ? sorted : top2).map(({ dimension, oldValue, newValue, delta }) => (
                            <div key={dimension} className={styles.diffRow}>
                              <span className={styles.diffDim}>{PROFILE_LABELS[dimension] || dimension}</span>
                              <span className={styles.diffOld}>{oldValue.toFixed(2)}</span>
                              <span className={styles.diffArrow}>→</span>
                              <span className={styles.diffNew}>{newValue.toFixed(2)}</span>
                              <span className={delta >= 0 ? styles.diffUp : styles.diffDown}>
                                {delta >= 0 ? '↑' : '↓'} {Math.abs(delta).toFixed(2)}
                              </span>
                            </div>
                          ))}
                          {rest.length > 0 && (
                            <button
                              className={styles.diffMore}
                              onClick={() => setExpandedDiffId(isExpanded ? null : dish.id)}
                            >
                              {isExpanded ? '▲ Thu gọn' : `+${rest.length} thay đổi khác`}
                            </button>
                          )}
                        </div>
                      );
                    })() : (
                      <span className={styles.noProfile}>—</span>
                    )}
                  </td>
                  <td>
                    <button
                      className={styles.editBtn}
                      onClick={() => openDrawer(dish)}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Drawer */}
      {selectedDish && (
        <div className={styles.drawerOverlay} onClick={closeDrawer}>
          <div className={styles.drawer} onClick={e => e.stopPropagation()}>
            <div className={styles.drawerHeader}>
              <h2 className={styles.drawerTitle}>{selectedDish.name}</h2>
              <button className={styles.drawerClose} onClick={closeDrawer}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className={styles.drawerBody}>
              <p className={styles.drawerSubtitle}>Chỉnh sửa dish profile</p>
              <div className={styles.profileGrid}>
                {Object.entries(PROFILE_LABELS).map(([key, label]) => (
                  <div key={key} className={styles.sliderRow}>
                    <label className={styles.sliderLabel} htmlFor={`slider-${key}`}>{label}</label>
                    <input
                      id={`slider-${key}`}
                      type="range"
                      min="-1"
                      max="1"
                      step="0.05"
                      value={editingProfile[key] ?? 0}
                      onChange={e => setEditingProfile(prev => ({ ...prev, [key]: parseFloat(e.target.value) }))}
                      className={styles.slider}
                    />
                    <span className={styles.sliderValue}>
                      {(editingProfile[key] ?? 0).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className={styles.drawerFooter}>
              <button className={styles.cancelBtn} onClick={closeDrawer}>Hủy</button>
              <button
                className={styles.saveBtn}
                onClick={handleSaveProfile}
                disabled={saving}
              >
                {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
