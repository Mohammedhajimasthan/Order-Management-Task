// Firebase Storage: file upload/download
import { storage, db } from './firebase-config.js';
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-storage.js';
import { saveUserProfile } from './db.js';
import { showToast } from './ui.js';

/**
 * Upload a file to Firebase Storage with progress callback.
 * @param {File} file - The file to upload
 * @param {string} path - Storage path (e.g. 'logos/uid.png')
 * @param {Function} onProgress - Called with 0-100 progress value
 * @returns {Promise<string>} Download URL
 */
export function uploadFile(file, path, onProgress) {
  return new Promise((resolve, reject) => {
    const storageRef = ref(storage, path);
    const task = uploadBytesResumable(storageRef, file);

    task.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(Math.round(progress));
      },
      (error) => {
        console.error('Upload error:', error);
        reject(error);
      },
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        resolve(url);
      }
    );
  });
}

/**
 * Upload a user's business logo, store URL in Firestore.
 */
export async function uploadLogo(uid, file, onProgress) {
  const ext = file.name.split('.').pop();
  const path = `logos/${uid}/logo.${ext}`;
  const url = await uploadFile(file, path, onProgress);
  await saveUserProfile(uid, { logoUrl: url });
  return url;
}
