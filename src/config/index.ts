export const config = () => ({
  Backend_URL: process.env.NEXT_PUBLIC_API_URL as string,
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
});
