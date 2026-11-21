/*
  MRM website configuration
  -------------------------
  1) Create a free project at https://supabase.com
  2) Project Settings -> API: copy the "Project URL" and the "anon public" key below.
  3) NEVER put the "service_role" key here. Only the anon (public) key is safe in this file.

  The values under `defaults` are shown on the site until you change them
  from the Admin panel (Admin -> Site Settings), which saves them to Supabase.
*/
window.MRM_CONFIG = {
  supabaseUrl: "https://zikgjqfaffpweabuunaf.supabase.co",
  supabaseAnonKey: "sb_publishable_2TW7Cn-QCeC27Phw_sk9eQ_Xp3zVNHJ",
  storageBucket: "app-files",   // public bucket: app icons
  apkBucket: "app-apks",        // PRIVATE bucket: APK files (login required to download)

  defaults: {
    // Video editing contacts
    edit_email: "mreditz883@gmail.com",
    edit_whatsapp: "+8801614492857",
    edit_phone: "+8809638575491",
    edit_facebook: "https://www.facebook.com/share/1dSM5TxSf1/",
    edit_capcut: "https://mobile.capcutshare.com/sv2/ZSpKLtYvx/",
    edit_tiktok: "https://www.tiktok.com/@mreditz520?_r=1&_t=ZS-9BYmIKlUQmC",
    edit_telegram: "https://t.me/capcutvideomaterial",

    // App & web development contacts
    dev_email: "connecttomrm320@gmail.com",
    dev_whatsapp: "+8801614492857",
    dev_phone: "+8809638575491",
    dev_facebook: "https://www.facebook.com/share/1dSM5TxSf1/",
    dev_telegram: "https://t.me/mrappdevolopment",
    dev_website: "",

    // Text
    tagline: "Apps, websites and video edits that stand out.",
    about_text:
      "MRM is a one-person studio building modern Android apps and websites, and creating eye-catching video edits and CapCut templates. Whether you need a product that works beautifully or a video that holds attention, you get one person who cares about the result from first message to final delivery."
  }
};
