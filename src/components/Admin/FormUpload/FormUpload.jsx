// components/Admin/FormUpload/FormUpload.js
import React from 'react';
import { Upload, Button } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const FormUpload = ({ value = [], onChange, maxCount = 1, ...props }) => {
  // Ensure value is always an array
  const fileList = Array.isArray(value) ? value : [];

  const handleChange = ({ fileList: newFileList }) => {
    onChange?.(newFileList);
  };

  return (
    <Upload
      {...props}
      fileList={fileList}
      onChange={handleChange}
      beforeUpload={() => false} // Prevent auto upload
      maxCount={maxCount}
    >
      <Button icon={<UploadOutlined />}>Upload</Button>
    </Upload>
  );
};

export default FormUpload;
