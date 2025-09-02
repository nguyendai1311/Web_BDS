  export const convertFileList = (files) => {
    if (!files) return [];

    if (Array.isArray(files)) {
      return files.map((item, idx) => {
        // If it's already a proper file object
        if (typeof item === 'object' && item.uid !== undefined) {
          return item;
        }
        // If it's a URL string
        if (typeof item === 'string') {
          return {
            uid: `${idx}`,
            name: item.split("/").pop() || `File ${idx + 1}`,
            url: item,
            status: "done",
          };
        }
        // If it's an object with url property
        if (typeof item === 'object' && item.url) {
          return {
            uid: item.uid || `${idx}`,
            name: item.name || item.url.split("/").pop() || `File ${idx + 1}`,
            url: item.url,
            status: "done",
          };
        }
        return null;
      }).filter(Boolean);
    }

    if (typeof files === "string") {
      return [{
        uid: "0",
        name: files.split("/").pop() || "File",
        url: files,
        status: "done",
      }];
    }

    return [];
  };