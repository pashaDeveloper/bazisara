import React from "react";
import { CKEditor } from '@ckeditor/ckeditor5-react';
import Editor from '../../../ckeditor/ckeditor';

const CKEditorBlock = ({ content, onChange }) => {
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
            uploadUrl: import.meta.env.VITE_BASE_URL + '/upload/add-upload',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_ACCESS_TOKEN}`
            }
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