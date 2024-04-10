import 'bootstrap/dist/css/bootstrap.min.css';
import { useState } from 'react';
import Button from 'react-bootstrap/Button'

function FileForm() {
    const [files, setFiles] = useState([]);

    const handleFileInputChange = (e) => {
        setFiles(Array.from(e.target.files));
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault()
        const formData = new FormData();
        files.forEach((file) => {
        formData.append('file_uploads', file);
        });

        try {
            const endpoint = "http://127.0.0.1:8000/uploadfiles/"
            const response = await fetch(endpoint, {
                method:"POST",
                body: formData
            });
            if(response.ok) {
                console.log("File uploaded successfully");
            }else {
                console.log("File upload failed");
            }
        }catch(error) {
            console.log(error);
        }
    };

    return (
        <div>
            <h1>Upload File</h1>
            <form onSubmit={handleSubmit}>
                <div style={{marginBottom:"20px"}}></div>
                <input type="file" onChange={handleFileInputChange} multiple/>
                <Button variant="danger" type='submit'>Upload</Button>
 
            </form>
        </div>
    );

}
export default FileForm