import { useRef, useState } from "react";
import "./ImageUploadField.css";
import { FiUploadCloud, FiX } from "react-icons/fi";

function ImageUploadField({ label, onFileSelected }) {
    const inputRef = useRef(null);
    const [preview, setPreview] = useState(null);
    const [dragActive, setDragActive] = useState(false);

    function handleFiles(files) {
        const file = files?.[0];
        if (!file) return;

        onFileSelected(file);

        const reader = new FileReader();
        reader.onload = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    }

    function handleDrop(e) {
        e.preventDefault();
        setDragActive(false);
        handleFiles(e.dataTransfer.files);
    }

    function handleCancel(e) {
        e.stopPropagation(); // don't let the click bubble up and reopen the file picker
        setPreview(null);
        onFileSelected(null);
        if (inputRef.current) {
            inputRef.current.value = ""; // lets the same file be re-selected later if needed
        }
    }

    return (
        <div className="image-upload-field">
            {label && <label>{label}</label>}

            <div
                className={`image-upload-dropzone ${dragActive ? "active" : ""} ${preview ? "has-preview" : ""}`}
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={() => setDragActive(false)}
                onDrop={handleDrop}
            >
                {preview ? (
                    <>
                        <img src={preview} alt="Preview" className="image-upload-preview" />
                        <button
                            type="button"
                            className="image-upload-cancel"
                            onClick={handleCancel}
                            title="Remove image"
                        >
                            <FiX />
                        </button>
                    </>
                ) : (
                    <>
                        <FiUploadCloud size={22} />
                        <span>Click or drag image to upload</span>
                        <span className="image-upload-hint">JPG, PNG (max 5MB)</span>
                    </>
                )}
            </div>

            <input
                ref={inputRef}
                type="file"
                accept="image/jpeg,image/png"
                hidden
                onChange={(e) => handleFiles(e.target.files)}
            />
        </div>
    );
}

export default ImageUploadField;