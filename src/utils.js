import { orderContant } from "./contant";

export const isJsonString = (data) => {
    try {
        JSON.parse(data)
    } catch (error) {
        return false
    }
    return true
}

export const getBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });

export function getItem(label, key, icon, children, type) {
    return {
        key,
        icon,
        children,
        label,
        type,
    };
}

export const renderOptions = (arr) => {
    let results = []
    if (arr) {
        results = arr?.map((opt) => {
            return {
                value: opt,
                label: opt
            }
        })
    }
    results.push({
        label: 'Thêm type',
        value: 'add_type'
    })
    return results
}

export const convertPrice = (price) => {
    try {
        const result = price?.toLocaleString().replaceAll(',', '.')
        return `${result} VND`
    } catch (error) {
        return null
    }
}
export const initFacebookSDK = () => {
  // Đảm bảo rằng SDK chỉ được tải một lần
  if (window.FB) {
    window.FB.XFBML.parse();
    return;
  }

  window.fbAsyncInit = function() {
    window.FB.init({
      appId: process.env.REACT_APP_FB_ID, // ID ứng dụng Facebook của bạn
      cookie: true,
      xfbml: true,
      version: 'v20.0'
    });
  };

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "https://connect.facebook.net/vi_VN/sdk.js#xfbml=1&version=v20.0";
    fjs.parentNode.insertBefore(js, fjs);
  })(document, 'script', 'facebook-jssdk');
};



export const convertDataChart = (data, type) => {
  try {
      const object = {}
      Array.isArray(data) && data.forEach((opt) => {
          if (!object[opt[type]]) {
              object[opt[type]] = 1
          } else {
              object[opt[type]] += 1
              console.log('c;getBase64', object[opt[type]], typeof (object[opt[type]]))
          }
      })
      const results = Array.isArray(Object.keys(object)) && Object.keys(object).map((item) => {
          return {
              name: orderContant.payment[item],
              value: object[item]
          }
      })
      return results
  } catch (e) {
      return []
  }
}
