export const config = () => ({
  Backend_URL: process.env.NEXT_PUBLIC_API_URL as string,
  VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string,
  EmailJS_Service_ID: process.env.NEXT_PUBLIC_EmailJS_Service_ID,
  EmailJS_Template_ID: process.env.NEXT_PUBLIC_EmailJS_Template_ID,
  EmailJS_User_ID: process.env.NEXT_PUBLIC_EmailJS_User_ID,
  Google_Client_ID: process.env.NEXT_GOOGLE_CLIENT_ID,
  Google_Client_Secret: process.env.NEXT_GOOGLE_CLIENT_SECRET,
  Github_Client_ID: process.env.NEXT_GITHUB_CLIENT_ID,
  Github_Client_Secret: process.env.NEXT_GITHUB_CLIENT_SECRET,
});
