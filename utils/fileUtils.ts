
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
