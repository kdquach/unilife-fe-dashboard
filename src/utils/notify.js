import { notification } from "antd";

export const notify = {
  success(title, description = "") {
    notification.success({
      message: title,
      description,
      placement: "topRight",
    });
  },

  error(title, description = "") {
    notification.error({
      message: title,
      description,
      placement: "topRight",
    });
  },

  warning(title, description = "") {
    notification.warning({
      message: title,
      description,
      placement: "topRight",
    });
  },

  info(title, description = "") {
    notification.info({
      message: title,
      description,
      placement: "topRight",
    });
  },
};