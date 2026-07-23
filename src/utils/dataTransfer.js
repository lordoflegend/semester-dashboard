import { getAllFiles, clearAllFiles, saveFile } from './fileStorage';

const blobToBase64 = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const base64ToBlob = async (base64) => {
  const res = await fetch(base64);
  return await res.blob();
};

export const exportData = async (appState) => {
  try {
    const files = await getAllFiles();
    const base64Files = {};
    
    for (const [id, blob] of Object.entries(files)) {
      base64Files[id] = await blobToBase64(blob);
    }

    const exportObj = {
      metadata: {
        courses: appState.courses,
        assignments: appState.assignments,
        lessons: appState.lessons,
        exams: appState.exams,
      },
      files: base64Files
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObj));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "semester-backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    return true;
  } catch (err) {
    console.error("Export failed:", err);
    throw err;
  }
};

export const importData = async (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.metadata) {
      throw new Error("Invalid backup format: missing metadata");
    }

    // Clear and restore files
    if (data.files) {
      await clearAllFiles();
      for (const [id, base64] of Object.entries(data.files)) {
        const blob = await base64ToBlob(base64);
        await saveFile(id, blob);
      }
    }

    return data.metadata;
  } catch (err) {
    console.error("Failed to import data:", err);
    throw new Error("Invalid backup file format");
  }
};
