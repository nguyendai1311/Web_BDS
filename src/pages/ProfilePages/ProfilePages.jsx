import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UploadOutlined } from "@ant-design/icons";
import { Button } from "antd";
import InputForm from "../../components/InputForm/InputForm";
import ButtonComponent from "../../components/ButtonComponent/ButtonComponent";
import * as UserService from "../../services/UserService";
import { updateUser } from "../../redux/slices/userSlice";
import { useMutationHooks } from "../../hooks/useMutationHooks";
import { getBase64 } from "../../utils";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import {
  WrapperHeader,
  WrapperProfileContainer,
  WrapperAvatarSection,
  WrapperInfoSection,
  WrapperInput,
  WrapperLabel,
  WrapperUploadFile,
  WrapperButton,
  AvatarImage,
  DefaultAvatar,
} from "./style";

const ProfilePage = () => {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const [studentName, setStudentName] = useState("");
  const [birthday, setBirthday] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [email, setEmail] = useState("");
  const [street, setStreet] = useState("");
  const [province, setProvince] = useState("");
  const [district, setDistrict] = useState("");
  const [ward, setWard] = useState("");
  const [avatar, setAvatar] = useState("");

  const [provinces, setProvinces] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [wards, setWards] = useState([]);
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  const mutation = useMutationHooks((data) => {
    const { id, access_token, ...rest } = data;
    return UserService.updateUser(id, rest, access_token);
  });

  const { isSuccess, isError } = mutation;

  useEffect(() => {
    if (user) {
      setEmail(user.email || "");
      setStudentName(user.name || "");
      setAvatar(user.avatar || "");
      setBirthday(user.birthday || "");
      setParentName(user.parentname || "");
      setParentPhone(user.phone || "");

      if (user.address) {
        const parts = user.address.split(",").map((part) => part.trim());
        setStreet(parts[0] || "");
        setWardName(parts[1] || "");
        setDistrictName(parts[2] || "");
        setProvinceName(parts[3] || "");
      }
    }
  }, [user]);

  useEffect(() => {
    const fetchProvinces = async () => {
      const res = await fetch("https://provinces.open-api.vn/api/p/");
      const data = await res.json();
      setProvinces(data);
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (province) {
      fetch(`https://provinces.open-api.vn/api/p/${province}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setDistricts(data.districts);
          setProvinceName(data.name);
        });
    }
  }, [province]);

  useEffect(() => {
    if (district) {
      fetch(`https://provinces.open-api.vn/api/d/${district}?depth=2`)
        .then((res) => res.json())
        .then((data) => {
          setWards(data.wards);
          setDistrictName(data.name);
        });
    }
  }, [district]);

  useEffect(() => {
    if (ward && wards.length > 0) {
      const selected = wards.find((w) => w.code === Number(ward));
      if (selected) {
        setWardName(selected.name);
      }
    }
  }, [ward, wards]);

  useEffect(() => {
    if (provinces.length > 0 && provinceName) {
      const found = provinces.find((p) => p.name === provinceName);
      if (found) setProvince(found.code.toString());
    }
  }, [provinces, provinceName]);

  useEffect(() => {
    if (districts.length > 0 && districtName) {
      const found = districts.find((d) => d.name === districtName);
      if (found) setDistrict(found.code.toString());
    }
  }, [districts, districtName]);

  useEffect(() => {
    if (wards.length > 0 && wardName) {
      const found = wards.find((w) => w.name === wardName);
      if (found) setWard(found.code.toString());
    }
  }, [wards, wardName]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Cập nhật thông tin thành công!");
      handleGetDetailsUser(user?._id, user?.access_token);
    } else if (isError) {
      toast.error("Cập nhật thất bại!");
    }
  }, [isSuccess, isError]);

  const handleGetDetailsUser = async (id, token) => {
    const res = await UserService.getDetailsUser(id, token);
    dispatch(updateUser({ ...res?.data, access_token: token }));
  };

  const handleUpdate = () => {
    const address = [street, wardName, districtName, provinceName]
      .filter(Boolean)
      .join(", ");

    mutation.mutate({
      id: user?._id,
      name: studentName,
      email,
      avatar,
      address,
      birthday,
      parentname: parentName,
      phone: parentPhone,
      access_token: user?.access_token,
    });
  };

  const handleChangeAvatar = async ({ fileList }) => {
    const file = fileList[0];  // Lấy tệp đầu tiên trong danh sách tệp
    if (file && file.originFileObj && avatar !== file.originFileObj.name) {
      const formData = new FormData();
      formData.append("file", file.originFileObj);
      formData.append("upload_preset", "upload-uke86ro8");
  
      try {
        const res = await fetch(`https://api.cloudinary.com/v1_1/dhyuxajq1/image/upload`, {
          method: "POST",
          body: formData,
        });
        const data = await res.json();
        setAvatar(data.secure_url); 
      } catch (error) {
        console.error("Upload error:", error);
      }
    }
  };
  
  

  return (
    <div>
      <WrapperHeader>Hồ sơ</WrapperHeader>
      <WrapperProfileContainer>
        <WrapperAvatarSection>
          {avatar ? (
            <AvatarImage src={avatar} alt="avatar" />
          ) : (
            <DefaultAvatar>
              <i className="fas fa-user" />
            </DefaultAvatar>
          )}
          <WrapperUploadFile
            onChange={handleChangeAvatar}
            maxCount={1}
            showUploadList={false}
          >
            <Button icon={<UploadOutlined />}>Chọn ảnh</Button>
          </WrapperUploadFile>
        </WrapperAvatarSection>

        <WrapperInfoSection>
          <WrapperInput>
            <WrapperLabel>Học viên</WrapperLabel>
            <InputForm value={studentName} onChange={setStudentName} />
          </WrapperInput>

          <WrapperInput>
            <WrapperLabel>Ngày sinh</WrapperLabel>
            <InputForm type="date" value={birthday} onChange={setBirthday} />
          </WrapperInput>

          <WrapperInput>
            <WrapperLabel>Phụ huynh</WrapperLabel>
            <InputForm
              value={parentName}
              onChange={setParentName}
              placeholder="Nhập tên phụ huynh"
            />
          </WrapperInput>

          <WrapperInput>
            <WrapperLabel>SĐT PH</WrapperLabel>
            <InputForm
              value={parentPhone}
              onChange={setParentPhone}
              placeholder="Nhập SĐT phụ huynh"
            />
          </WrapperInput>

          <WrapperInput>
            <WrapperLabel>Email</WrapperLabel>
            <InputForm value={email} disabled />
          </WrapperInput>

          <WrapperInput>
            <WrapperLabel>Đường</WrapperLabel>
            <InputForm
              value={street}
              onChange={setStreet}
              placeholder="Nhập tên đường"
            />
          </WrapperInput>

          <WrapperInput>
            <WrapperLabel>Tỉnh</WrapperLabel>
            <select value={province} onChange={(e) => setProvince(e.target.value)}>
              <option value="">Chọn tỉnh</option>
              {provinces.map((p) => (
                <option key={p.code} value={p.code}>
                  {p.name}
                </option>
              ))}
            </select>
          </WrapperInput>

          <WrapperInput>
            <WrapperLabel>Huyện</WrapperLabel>
            <select value={district} onChange={(e) => setDistrict(e.target.value)}>
              <option value="">Chọn huyện</option>
              {districts.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </WrapperInput>

          <WrapperInput>
            <WrapperLabel>Phường</WrapperLabel>
            <select value={ward} onChange={(e) => setWard(e.target.value)}>
              <option value="">Chọn phường</option>
              {wards.map((w) => (
                <option key={w.code} value={w.code}>
                  {w.name}
                </option>
              ))}
            </select>
          </WrapperInput>

          <WrapperButton>
            <ButtonComponent
              textbutton="Cập nhật"
              onClick={handleUpdate}
              size="large"
              styleButton={{
                background: "#1890ff",
                borderRadius: "8px",
                padding: "6px 20px",
                border: "none",
              }}
              styleTextButton={{
                color: "#fff",
                fontWeight: "bold",
              }}
            />
          </WrapperButton>
        </WrapperInfoSection>
      </WrapperProfileContainer>

      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ProfilePage;
