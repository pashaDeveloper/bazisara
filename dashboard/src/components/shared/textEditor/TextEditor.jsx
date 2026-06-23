 
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from '../../../ckeditor/ckeditor';
import "./Style.css"
import { useEffect, useState } from 'react';
const MyEditor = ({ value, onChange }) => {
  const [data, setData] = useState(() => value);

  useEffect(() => {
    setData(value);
  }, [value]);

  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  return (
    <div>
      <CKEditor
        editor={Editor}
        data={data}
        config={{
          simpleUpload: {
            uploadUrl: import.meta.env.VITE_BASE_URL + '/uploads/parspack/create',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        }}
        onChange={(event, editor) => {
          const value = editor.getData();
          setData(value);  
          onChange(value);  
        }}
      />
    </div>
  );
};

export default MyEditor;

