import { Button, Space } from "antd";

export const renderFileList = (files) => {
  if (!files) return null;

  const fileArray = Array.isArray(files)
    ? files.map((f, i) =>
        typeof f === "string" ? { url: f, name: f.split("/").pop() } : f
      )
    : typeof files === "string"
    ? [{ url: files, name: files.split("/").pop() }]
    : [files];

  if (fileArray.length === 0) return null;

  return (
    <div>
      {fileArray.map((file, index) => (
        <div key={index} style={{ marginBottom: 6 }}>
          <Space>
            <span>{file.name || file.url.split("/").pop()}</span>
            <Button type="link" size="small" onClick={() => window.open(file.url, "_blank")}>
              Xem
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => {
                const link = document.createElement("a");
                link.href = file.url;
                link.download = file.name || "download";
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
              }}
            >
              Tải xuống
            </Button>
          </Space>
        </div>
      ))}
    </div>
  );
};
