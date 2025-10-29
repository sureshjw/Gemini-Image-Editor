# Gemini Image Editor

An intuitive web application that allows users to edit images using natural language text prompts, powered by the Google Gemini API. Perform tasks like removing backgrounds, cleaning up product photos, or applying artistic filters simply by typing instructions.

## ✨ Features

-   **AI-Powered Editing**: Leverage the power of Gemini 2.5 Flash Image to edit images based on text prompts.
-   **Comprehensive Edit History**: Full undo and redo support for iterative editing.
-   **Professional Prompt Library**: A rich, categorized library of example prompts for product photography, portraits, marketing, and more.
-   **Aspect Ratio Control**: Choose from common presets (1:1, 16:9, etc.) to frame your image perfectly.
-   **Real-time Adjustments**: Fine-tune your image with live-preview sliders for:
    -   Brightness
    -   Contrast
-   **Instant Filters**: Apply classic visual filters like Grayscale, Sepia, and Invert with a single click.
-   **Download Your Work**: Easily save your final edited image to your device.
-   **Drag & Drop Upload**: A modern, easy-to-use interface for uploading your images.

## 🚀 How to Use

1.  **Upload Image**: Drag and drop an image file (PNG, JPG, WEBP) onto the upload area, or click to select a file from your device.
2.  **Describe Your Edit**: Type a clear instruction in the text box (e.g., "remove the background") or click one of the many example prompts.
3.  **Adjust & Filter (Optional)**: Use the sliders and filter buttons to apply real-time visual adjustments.
4.  **Generate**: Click the "✨ Generate Edit" button to let Gemini work its magic.
5.  **Review & Refine**: The result will appear in the panel. Use Undo/Redo to navigate through your edits or apply further changes.
6.  **Download**: Once you're happy with the result, click the download icon to save your image.

## 🛠️ Tech Stack

-   **Frontend**: [React](https://reactjs.org/) with [TypeScript](https://www.typescriptlang.org/)
-   **AI Model**: [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
-   **Styling**: [Tailwind CSS](https://tailwindcss.com/)

## 🔑 API Key

This application requires a Google Gemini API key to function. The key is expected to be available as an environment variable (`process.env.API_KEY`) in the execution environment.
