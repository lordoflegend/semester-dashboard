import { useState, useRef } from 'react';
import { X, Download, Upload, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { exportData, importData } from '../utils/dataTransfer';
import { useAppContext } from '../context/AppContext';

export default function SettingsModal({ onClose }) {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importStatus, setImportStatus] = useState(null); // 'success' | 'error' | null
  const fileInputRef = useRef(null);
  
  const appState = useAppContext();
  const { importState } = appState;

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportData(appState);
    } catch (err) {
      console.error(err);
      alert('Export failed. Please check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsImporting(true);
      setImportStatus(null);
      
      const text = await file.text();
      const newMetadata = await importData(text);
      importState(newMetadata);
      
      setImportStatus('success');
      setTimeout(() => {
        onClose();
        window.location.reload(); 
      }, 1500);
    } catch (err) {
      console.error(err);
      setImportStatus('error');
    } finally {
      setIsImporting(false);
      e.target.value = ''; 
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <h2 className="modal-title">Data Backup & Restore</h2>
          <button className="btn-icon" onClick={onClose}><X size={20} /></button>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(167, 139, 250, 0.05)' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Download size={20} className="text-primary" /> Export Data
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Download a backup of all your courses, lessons, assignments, exams, and uploaded files. Keep this file safe!
            </p>
            <button 
              className="btn btn-primary" 
              onClick={handleExport} 
              disabled={isExporting}
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {isExporting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Download size={18} />}
              {isExporting ? 'Preparing Backup...' : 'Download Backup File'}
            </button>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(216, 180, 254, 0.05)' }}>
            <h3 style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Upload size={20} className="text-primary" /> Import Data
            </h3>
            <p className="text-secondary" style={{ fontSize: '0.9rem', marginBottom: '1rem' }}>
              Restore your dashboard from a backup file. 
              <br/><strong className="text-danger">Warning:</strong> This will completely overwrite your current data.
            </p>
            
            <input 
              type="file" 
              accept=".json" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleFileChange} 
            />
            
            <button 
              className="btn" 
              onClick={handleImportClick} 
              disabled={isImporting}
              style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.1)' }}
            >
              {isImporting ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={18} />}
              {isImporting ? 'Restoring Data...' : 'Upload Backup File'}
            </button>

            {importStatus === 'success' && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <CheckCircle2 size={16} /> Data restored successfully! Reloading...
              </div>
            )}
            
            {importStatus === 'error' && (
              <div style={{ marginTop: '1rem', padding: '0.75rem', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--accent-danger)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                <AlertCircle size={16} /> Failed to restore data. Invalid backup file.
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
