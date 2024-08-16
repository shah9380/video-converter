import React, { useState } from 'react';

function App() {
    const [files, setFiles] = useState([]);

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files);
        const allowedTypes = [
          'application/vnd.ms-excel', // .xls
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
          'application/pdf', // .pdf
          'image/jpeg', // .jpg
          'image/png' // .png
      ];

        const validFiles = selectedFiles.filter(file => {
            if (!allowedTypes.includes(file.type)) {
                alert(`File ${file.name} is not allowed. Please select a valid file type.`);
                return false;
            }
            return true;
        });

        const uniqueFiles = validFiles.filter(file => !files.some(f => f.name === file.name));

        if (uniqueFiles.length < validFiles.length) {
            alert("Some files were already selected and were not added again.");
        }

        setFiles(prevFiles => [...prevFiles, ...uniqueFiles]);
    };

    const handleDelete = (fileName) => {
        setFiles(files.filter(file => file.name !== fileName));
    };

    const handleUpload = async () => {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        try {
            const response = await fetch(`${window.location.href}upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error("Failed to upload files");
            }

            await response.json();
            setFiles([]);
            alert("Files uploaded successfully!");
        } catch (err) {
            console.error(err.message);
        }
    };

    return (
        <div className="App">
            <h1>Upload Multiple Files</h1>
            <input type="file" multiple onChange={handleFileChange} />

            <h2>Selected Files</h2>
            <table border="1">
                <thead>
                    <tr>
                        <th>Filename</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {files.map((file, index) => (
                        <tr key={index}>
                            <td>{file.name}</td>
                            <td>
                                <button onClick={() => handleDelete(file.name)}>Delete</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            <button onClick={handleUpload} disabled={files.length === 0}>
                Upload
            </button>
        </div>
    );
}

export default App;
