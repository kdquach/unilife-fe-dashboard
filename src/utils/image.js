import imageNotFound from "../assets/image-not-found.png";

const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  "http://localhost:5000/api/v1";

const assetBaseUrl = apiBaseUrl.replace(/\/api\/v1\/?$/, "");

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return imageNotFound;

  if (/^https?:\/\//i.test(imageUrl)) {
    return imageUrl;
  }

  return `${assetBaseUrl}${
    imageUrl.startsWith("/") ? "" : "/"
  }${imageUrl}`;
};

export { imageNotFound };