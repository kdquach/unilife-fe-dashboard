import React, { useEffect, useRef, useState } from "react";
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Form,
  Input,
  Modal,
  Progress,
  Row,
  Slider,
  Space,
  Spin,
  Tabs,
  Tag,
  Tooltip,
  Typography,
  Upload,
} from "antd";
import {
  CameraOutlined,
  CheckCircleFilled,
  CheckCircleOutlined,
  CopyOutlined,
  IdcardOutlined,
  KeyOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  RedoOutlined,
  RotateRightOutlined,
  SafetyCertificateFilled,
  SafetyCertificateOutlined,
  SafetyOutlined,
  SaveOutlined,
  ScissorOutlined,
  UserOutlined,
  ZoomInOutlined,
  ZoomOutOutlined,
} from "@ant-design/icons";
import { useAuth } from "../features/auth/AuthContext";
import { profileService } from "../features/profile/profileService";
import { getImageUrl } from "../utils/image";
import { notify } from "../utils/notify";

const { Title, Text } = Typography;

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  // Avatar Adjust Modal state
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState(null);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const [profileForm] = Form.useForm();
  const [passwordForm] = Form.useForm();
  const previewImageRef = useRef(null);

  const VIEWPORT_SIZE = 280;

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await profileService.getProfile();
      const userData = data?.user || data?.data || data;
      if (userData) {
        setProfileData(userData);
        updateUser(userData);
        profileForm.setFieldsValue({
          fullName: userData?.fullName || "",
          phone: userData?.phone || "",
          email: userData?.email || "",
          role: userData?.role || "ADMIN",
        });
      }
    } catch (err) {
      notify.error("Failed to load profile details", err?.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (values) => {
    setUpdatingProfile(true);
    try {
      const res = await profileService.updateProfile({
        fullName: values.fullName,
        phone: values.phone,
      });
      const updatedUser = res?.user || res?.data || res;
      setProfileData((prev) => ({ ...prev, ...updatedUser }));
      updateUser({
        fullName: values.fullName,
        phone: values.phone,
        ...(updatedUser.avatarUrl || updatedUser.avatar
          ? {
              avatarUrl: updatedUser.avatarUrl || updatedUser.avatar,
              avatar: updatedUser.avatarUrl || updatedUser.avatar,
            }
          : {}),
      });
      notify.success("Profile updated successfully");
    } catch (err) {
      notify.error("Failed to update profile", err?.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (values) => {
    setUpdatingPassword(true);
    try {
      await profileService.changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });
      notify.success("Password changed successfully");
      passwordForm.resetFields();
    } catch (err) {
      notify.error("Failed to change password", err?.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  // Step 1: When user selects image file, load natural dimensions and open Adjust Modal
  const handleFileSelected = ({ file }) => {
    const rawFile = file?.originFileObj || file;
    const isFile =
      rawFile &&
      (typeof window !== "undefined"
        ? rawFile instanceof window.File || rawFile instanceof window.Blob
        : Boolean(rawFile.size));

    if (!isFile) return;

    const previewUrl = URL.createObjectURL(rawFile);
    const tempImg = new Image();
    tempImg.onload = () => {
      setImageDimensions({ width: tempImg.naturalWidth, height: tempImg.naturalHeight });
      setSelectedImageSrc(previewUrl);
      setZoom(1);
      setRotation(0);
      setOffset({ x: 0, y: 0 });
      setAdjustModalOpen(true);
    };
    tempImg.src = previewUrl;
  };

  // Calculate base dimensions so the entire original image fits inside VIEWPORT_SIZE (contain mode)
  const getBaseDimensions = () => {
    const { width, height } = imageDimensions;
    if (!width || !height) return { baseW: VIEWPORT_SIZE, baseH: VIEWPORT_SIZE };

    const aspect = width / height;
    if (aspect >= 1) {
      return { baseW: VIEWPORT_SIZE, baseH: VIEWPORT_SIZE / aspect };
    }
    return { baseW: VIEWPORT_SIZE * aspect, baseH: VIEWPORT_SIZE };
  };

  // Dragging logic for image position adjustments
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleResetAdjustments = () => {
    setZoom(1);
    setRotation(0);
    setOffset({ x: 0, y: 0 });
  };

  // Step 2: Render cropped image to Canvas matching exact preview ratio and upload
  const handleSaveAdjustedAvatar = () => {
    if (!previewImageRef.current) return;

    setUploadingAvatar(true);
    const CANVAS_SIZE = 400;
    const ratio = CANVAS_SIZE / VIEWPORT_SIZE;

    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");

    const img = previewImageRef.current;
    const { baseW, baseH } = getBaseDimensions();
    const canvasBaseW = baseW * ratio;
    const canvasBaseH = baseH * ratio;

    ctx.save();
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    // Draw circular clip path
    ctx.beginPath();
    ctx.arc(CANVAS_SIZE / 2, CANVAS_SIZE / 2, CANVAS_SIZE / 2, 0, Math.PI * 2);
    ctx.clip();

    // Center canvas transformation
    ctx.translate(
      CANVAS_SIZE / 2 + offset.x * ratio,
      CANVAS_SIZE / 2 + offset.y * ratio
    );
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(zoom, zoom);

    // Draw image centered matching exact preview aspect and scale
    ctx.drawImage(img, -canvasBaseW / 2, -canvasBaseH / 2, canvasBaseW, canvasBaseH);
    ctx.restore();

    canvas.toBlob(async (blob) => {
      if (!blob) {
        setUploadingAvatar(false);
        return;
      }
      const croppedFile = new File([blob], "avatar.webp", { type: "image/webp" });

      try {
        const res = await profileService.uploadAvatar(croppedFile);
        const updatedUser = res?.user || res?.data || res;
        const avatarUrl =
          updatedUser?.avatarUrl ||
          updatedUser?.avatar ||
          (typeof res === "string" ? res : null);

        if (avatarUrl) {
          setProfileData((prev) => ({ ...prev, avatar: avatarUrl, avatarUrl }));
          updateUser({ avatar: avatarUrl, avatarUrl });
        }
        notify.success("Avatar updated successfully");
        setAdjustModalOpen(false);
      } catch (err) {
        notify.error("Failed to upload avatar", err?.message);
      } finally {
        setUploadingAvatar(false);
      }
    }, "image/webp", 0.9);
  };

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    notify.success("Copied to clipboard");
  };

  const currentUser = profileData || user;
  const avatarSrc = currentUser?.avatar || currentUser?.avatarUrl;
  const { baseW, baseH } = getBaseDimensions();

  const roleTagColors = {
    ADMIN: "orange",
    MANAGER: "purple",
    KITCHEN_STAFF: "gold",
    STAFF: "blue",
  };

  if (loading && !profileData) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Spin size="large" tip="Loading profile details..." />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-2 md:p-6">
      {/* Light Theme Profile Header Card with Orange Accent */}
      <Card
        className="overflow-hidden rounded-3xl border border-slate-100 shadow-sm bg-white"
        bodyStyle={{ padding: 0 }}
      >
        {/* Orange Brand Banner */}
        <div className="h-28 bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 px-6 pt-4 relative">
          <div className="absolute top-4 right-6 flex items-center gap-2">
            <Tag color={roleTagColors[currentUser?.role] || "orange"} className="font-semibold px-3 py-1 text-xs uppercase rounded-full border-none shadow-sm">
              {currentUser?.role || "ADMIN"}
            </Tag>
          </div>
        </div>

        {/* User Identity Info Header */}
        <div className="px-6 pb-6 pt-0 relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center md:items-end gap-5 -mt-12">
            {/* Avatar with Orange Ring & Camera Upload Overlay */}
            <div className="relative group">
              <Avatar
                size={105}
                src={avatarSrc ? getImageUrl(avatarSrc) : undefined}
                icon={!avatarSrc && <UserOutlined />}
                className="border-4 border-white bg-orange-500 shadow-md text-3xl font-bold text-white"
              >
                {!avatarSrc && (currentUser?.fullName?.[0]?.toUpperCase() || "A")}
              </Avatar>

              <Upload
                showUploadList={false}
                beforeUpload={() => false}
                onChange={handleFileSelected}
                accept="image/*"
              >
                <Tooltip title="Edit / Adjust avatar picture">
                  <Button
                    shape="circle"
                    icon={<CameraOutlined />}
                    loading={uploadingAvatar}
                    className="absolute bottom-1 right-1 border-2 border-white bg-slate-900 text-white hover:!bg-orange-500 hover:!text-white shadow transition-transform hover:scale-105"
                    size="small"
                  />
                </Tooltip>
              </Upload>
            </div>

            {/* Name & Email */}
            <div className="text-center md:text-left mb-1">
              <Title level={3} className="!text-slate-900 !mb-0 font-bold">
                {currentUser?.fullName || "System Admin"}
              </Title>
              <div className="flex items-center justify-center md:justify-start gap-2 text-slate-500 text-sm mt-1">
                <MailOutlined className="text-orange-500" />
                <span>{currentUser?.email || "admin@unilife.com"}</span>
                <Tooltip title="Copy Email">
                  <Button
                    type="text"
                    size="small"
                    icon={<CopyOutlined className="text-slate-400 hover:text-orange-500" />}
                    onClick={() => copyToClipboard(currentUser?.email)}
                  />
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Quick Status Pills */}
          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 mb-1">
            <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 border border-emerald-200/70 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
              <CheckCircleFilled className="text-emerald-500 text-sm" />
              <span>Status: Active Account</span>
            </div>
            <div className="flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200/70 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-2xs">
              <SafetyCertificateFilled className="text-orange-500 text-sm" />
              <span>Security Level: Protected</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Two-Column Layout */}
      <Row gutter={[24, 24]}>
        {/* Left Column: Account Details & Security Cards */}
        <Col span={24} lg={8} className="space-y-6">
          {/* Account Details Card */}
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white">
            <Title level={5} className="!mb-3 flex items-center gap-2 text-slate-800 font-semibold">
              <IdcardOutlined className="text-orange-500" /> Account Overview
            </Title>
            <Divider className="my-3" />

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between items-center py-0.5">
                <Text type="secondary">Account ID</Text>
                <Text code className="text-xs rounded-md bg-slate-50">{currentUser?.id || currentUser?._id || "N/A"}</Text>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <Text type="secondary">Role Access</Text>
                <Tag color="orange" className="font-semibold rounded-md border-none">{currentUser?.role || "ADMIN"}</Tag>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <Text type="secondary">Email Status</Text>
                <span className="flex items-center gap-1 text-emerald-600 font-medium text-xs">
                  <CheckCircleOutlined /> Verified
                </span>
              </div>
              <div className="flex justify-between items-center py-0.5">
                <Text type="secondary">Phone Number</Text>
                <Text className="font-medium text-slate-700">{currentUser?.phone || "Not provided"}</Text>
              </div>
            </div>
          </Card>

          {/* Security Health Card */}
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white">
            <div className="flex items-center justify-between mb-2">
              <Title level={5} className="!mb-0 flex items-center gap-2 text-slate-800 font-semibold">
                <SafetyOutlined className="text-orange-500" /> Security Status
              </Title>
              <Tag color="success" className="rounded-full font-medium">100% Secure</Tag>
            </div>
            <Text type="secondary" className="text-xs">Your profile password and credentials are up to date.</Text>

            <div className="mt-4 space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-600">Account Protection Level</span>
                <span className="text-orange-500">High</span>
              </div>
              <Progress percent={100} showInfo={false} strokeColor="#f97316" size="small" />
            </div>
          </Card>
        </Col>

        {/* Right Column: Tabbed Settings Form Card */}
        <Col span={24} lg={16}>
          <Card className="rounded-3xl border border-slate-100 shadow-sm bg-white p-2">
            <Tabs
              defaultActiveKey="profile"
              size="large"
              tabBarStyle={{ marginBottom: 20 }}
              items={[
                {
                  key: "profile",
                  label: (
                    <span className="flex items-center gap-2 font-medium px-2">
                      <UserOutlined />
                      Personal Information
                    </span>
                  ),
                  children: (
                    <Form
                      form={profileForm}
                      layout="vertical"
                      onFinish={handleUpdateProfile}
                      className="pt-1 max-w-2xl"
                    >
                      <Row gutter={16}>
                        <Col span={24} md={12}>
                          <Form.Item
                            label={<span className="font-medium text-slate-700">Full Name</span>}
                            name="fullName"
                            rules={[
                              { required: true, message: "Please enter full name" },
                            ]}
                          >
                            <Input
                              prefix={<UserOutlined className="text-slate-400 mr-1" />}
                              placeholder="Enter full name"
                              size="large"
                              className="rounded-xl"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24} md={12}>
                          <Form.Item
                            label={<span className="font-medium text-slate-700">Phone Number</span>}
                            name="phone"
                            normalize={(value) => (value ? value.replace(/\D/g, "") : "")}
                            rules={[
                              {
                                pattern: /^[0-9]{9,15}$/,
                                message: "Invalid phone number format (9-15 digits)",
                              },
                            ]}
                          >
                            <Input
                              prefix={<PhoneOutlined className="text-slate-400 mr-1" />}
                              placeholder="Enter phone number"
                              size="large"
                              className="rounded-xl"
                              maxLength={15}
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Row gutter={16}>
                        <Col span={24} md={12}>
                          <Form.Item
                            label={<span className="font-medium text-slate-700">Email Address (Read-only)</span>}
                            name="email"
                          >
                            <Input
                              prefix={<MailOutlined className="text-slate-400 mr-1" />}
                              disabled
                              size="large"
                              className="rounded-xl !bg-slate-50"
                            />
                          </Form.Item>
                        </Col>

                        <Col span={24} md={12}>
                          <Form.Item
                            label={<span className="font-medium text-slate-700">Role Permission (Read-only)</span>}
                            name="role"
                          >
                            <Input
                              prefix={<SafetyCertificateOutlined className="text-slate-400 mr-1" />}
                              disabled
                              size="large"
                              className="rounded-xl !bg-slate-50"
                            />
                          </Form.Item>
                        </Col>
                      </Row>

                      <Divider className="my-4" />

                      <div className="flex justify-end">
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<SaveOutlined />}
                          loading={updatingProfile}
                          size="large"
                          className="bg-orange-500 hover:!bg-orange-600 border-none font-semibold px-8 rounded-xl shadow-sm transition-all"
                        >
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  ),
                },
                {
                  key: "password",
                  label: (
                    <span className="flex items-center gap-2 font-medium px-2">
                      <KeyOutlined />
                      Change Password
                    </span>
                  ),
                  children: (
                    <Form
                      form={passwordForm}
                      layout="vertical"
                      onFinish={handleChangePassword}
                      className="pt-1 max-w-xl"
                    >
                      <div className="bg-orange-50 border border-orange-200/60 rounded-2xl p-4 mb-5 text-xs text-orange-950 space-y-1">
                        <div className="font-semibold flex items-center gap-1.5 text-sm text-orange-800">
                          <LockOutlined className="text-orange-500" /> Password Policy Requirements:
                        </div>
                        <ul className="list-disc pl-5 space-y-0.5 text-slate-600">
                          <li>Minimum 8 characters in length</li>
                          <li>Must be different from your current password</li>
                        </ul>
                      </div>

                      <Form.Item
                        label={<span className="font-medium text-slate-700">Current Password</span>}
                        name="currentPassword"
                        rules={[
                          { required: true, message: "Please enter current password" },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-slate-400 mr-1" />}
                          placeholder="Enter current password"
                          size="large"
                          className="rounded-xl"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="font-medium text-slate-700">New Password</span>}
                        name="newPassword"
                        rules={[
                          { required: true, message: "Please enter new password" },
                          { min: 8, message: "New password must be at least 8 characters" },
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-slate-400 mr-1" />}
                          placeholder="Enter new password (at least 8 characters)"
                          size="large"
                          className="rounded-xl"
                        />
                      </Form.Item>

                      <Form.Item
                        label={<span className="font-medium text-slate-700">Confirm New Password</span>}
                        name="confirmPassword"
                        dependencies={["newPassword"]}
                        rules={[
                          { required: true, message: "Please confirm new password" },
                          ({ getFieldValue }) => ({
                            validator(_, value) {
                              if (!value || getFieldValue("newPassword") === value) {
                                return Promise.resolve();
                              }
                              return Promise.reject(
                                new Error("Passwords do not match!")
                              );
                            },
                          }),
                        ]}
                      >
                        <Input.Password
                          prefix={<LockOutlined className="text-slate-400 mr-1" />}
                          placeholder="Re-enter new password"
                          size="large"
                          className="rounded-xl"
                        />
                      </Form.Item>

                      <Divider className="my-4" />

                      <div className="flex justify-end">
                        <Button
                          type="primary"
                          htmlType="submit"
                          icon={<KeyOutlined />}
                          loading={updatingPassword}
                          size="large"
                          className="bg-orange-500 hover:!bg-orange-600 border-none font-semibold px-8 rounded-xl shadow-sm transition-all"
                        >
                          Update Password
                        </Button>
                      </div>
                    </Form>
                  ),
                },
              ]}
            />
          </Card>
        </Col>
      </Row>

      {/* Interactive Avatar Adjustment Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2 font-semibold text-slate-800 text-lg pb-1">
            <ScissorOutlined className="text-orange-500" /> Adjust Avatar Picture
          </div>
        }
        open={adjustModalOpen}
        onCancel={() => setAdjustModalOpen(false)}
        footer={[
          <Button key="cancel" onClick={() => setAdjustModalOpen(false)} className="rounded-xl">
            Cancel
          </Button>,
          <Button
            key="reset"
            icon={<RedoOutlined />}
            onClick={handleResetAdjustments}
            className="rounded-xl"
          >
            Reset
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<SaveOutlined />}
            loading={uploadingAvatar}
            onClick={handleSaveAdjustedAvatar}
            className="bg-orange-500 hover:!bg-orange-600 border-none font-semibold rounded-xl"
          >
            Save Avatar
          </Button>,
        ]}
        width={480}
        destroyOnHidden
        className="rounded-3xl overflow-hidden"
      >
        <div className="py-2 space-y-4">
          <Text type="secondary" className="text-xs">
            Drag to position the image inside the crop circle. Use controls below to zoom and rotate.
          </Text>

          {/* Interactive Crop Viewport with Contain Base Dimensions */}
          <div
            className="relative w-[280px] h-[280px] mx-auto rounded-full border-4 border-orange-500 shadow-xl overflow-hidden bg-slate-950 cursor-grab active:cursor-grabbing select-none"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {selectedImageSrc && (
              <img
                ref={previewImageRef}
                src={selectedImageSrc}
                alt="Avatar preview"
                className="absolute max-w-none transition-transform duration-75 pointer-events-none"
                style={{
                  width: `${baseW}px`,
                  height: `${baseH}px`,
                  left: "50%",
                  top: "50%",
                  marginLeft: `-${baseW / 2}px`,
                  marginTop: `-${baseH / 2}px`,
                  transform: `translate(${offset.x}px, ${offset.y}px) rotate(${rotation}deg) scale(${zoom})`,
                  transformOrigin: "center center",
                }}
              />
            )}
          </div>

          {/* Adjustment Controls */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-3">
            <div className="flex items-center gap-3">
              <ZoomOutOutlined className="text-slate-400 text-base" />
              <Slider
                min={1}
                max={3.5}
                step={0.05}
                value={zoom}
                onChange={(val) => setZoom(val)}
                className="flex-1"
              />
              <ZoomInOutlined className="text-slate-400 text-base" />
            </div>

            <div className="flex items-center justify-between pt-1">
              <Button
                icon={<RotateRightOutlined />}
                onClick={handleRotate}
                size="small"
                className="rounded-lg text-xs"
              >
                Rotate 90°
              </Button>
              <Text type="secondary" className="text-xs">
                Zoom: {(zoom * 100).toFixed(0)}% | Rotation: {rotation}°
              </Text>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
