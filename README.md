
# Gemini Image Editor

An intuitive web application that allows users to edit images using natural language text prompts, powered by the Google Gemini API. Perform tasks like removing backgrounds, cleaning up product photos, or applying artistic filters simply by typing instructions.

## ✨ Features

-   **AI-Powered Editing**: Leverage the power of Gemini 2.5 Flash Image to edit images based on text prompts.
-   **Advanced Prompt Enhancers**: Choose from a categorized list of professional enhancers (e.g., "Studio Lighting," "Cinematic Glow," "8K Master Detail") to automatically append high-quality keywords to your prompts for superior rendering, clarity, and realism.
-   **Interactive Cropping**: Crop your image with an easy-to-use tool right after uploading to perfect your composition before editing.
-   **Batch Processing**: Upload multiple images and apply edits to all of them at once.
-   **Professional Prompt Library**: A rich, categorized library of example prompts for product photography, portraits, marketing, and more.
-   **Aspect Ratio Control**: Choose from common presets (1:1, 16:9, etc.) to frame your image perfectly.
-   **Real-time Adjustments**: Fine-tune your image with live-preview sliders for:
    -   Brightness
    -   Contrast
-   **Instant Filters**: Apply classic visual filters like Grayscale, Sepia, and Invert with a single click.
-   **Download Your Work**: Easily save your final edited images, either one by one or all at once.
-   **Drag & Drop Upload**: A modern, easy-to-use interface for uploading your images.

## 🚀 How to Use

1.  **Upload & Crop**: Drag and drop an image file (PNG, JPG, WEBP) onto the upload area, or click to select a file. Use the interactive tool to crop your image, then click "Crop & Add Image". Repeat to add more images to your batch.
2.  **Describe Your Edit**: Type a clear instruction in the text box (e.g., "remove the background") or click one of the many example prompts.
3.  **Select a Prompt Enhancer (Optional)**: Choose an enhancer from the categorized dropdown menu to automatically append professional-grade keywords to your prompt for higher quality results.
4.  **Adjust & Filter (Optional)**: Use the sliders and filter buttons to apply real-time visual adjustments.
5.  **Generate**: Click the "✨ Generate Edit" button to let Gemini work its magic on all uploaded images.
6.  **Review**: Use the filmstrip to navigate through your results.
7.  **Download**: Click the download icon to save the selected image, or "Download All" to save the entire batch.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
-   **AI Model**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
-   **Cropping**: [React Image Crop](https://www.npmjs.com/package/react-image-crop)

## 🔑 API Key

This application requires a Google Gemini API key to function. The key is expected to be available as an environment variable (`process.env.API_KEY`) in the execution environment.
