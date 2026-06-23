import React from "react";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from '../../../ckeditor/ckeditor';

const CKEditorBlock = ({ content, onChange }) => {
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  return (
    <div className="ckeditor-block">
      <CKEditor
        editor={Editor}
        data={content}
        config={{
          toolbar: [
            'heading', '|',
            'bold', 'italic', 'link', '|',
            'bulletedList', 'numberedList', '|',
            'outdent', 'indent', '|',
            'blockQuote', 'insertTable', '|',
            'undo', 'redo'
          ],
          simpleUpload: {
            uploadUrl: import.meta.env.VITE_BASE_URL + '/uploads/parspack/create',
            headers: token ? { Authorization: `Bearer ${token}` } : {}
          }
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          onChange(data);
        }}
      />
    </div>
  );
};

export default CKEditorBlock;
