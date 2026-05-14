// utils/uploadAdapter.js
export default class UploadAdapter {
    constructor(loader) {
      this.loader = loader;
    }
  
    upload() {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          resolve({
            default: reader.result
          });
        };
        reader.onerror = reject;
        this.loader.file.then(file => {
          reader.readAsDataURL(file);
        });
      });
    }
  
    abort() {
      // Abort logic if needed
    }
  }
  