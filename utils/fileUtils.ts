
interface Base64ConversionResult {
  base64Data: string;
  dataUrl: string;
}

export const fileToBase64 = (file: File): Promise<Base64ConversionResult> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64Data = dataUrl.split(',')[1];
      if (!base64Data) {
        reject(new Error("Could not extract base64 data from file."));
      }
      resolve({ base64Data, dataUrl });
    };
    reader.onerror = (error) => reject(error);
  });

export const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) {
        throw new Error('Invalid data URL');
    }
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, {type: mime});
}
