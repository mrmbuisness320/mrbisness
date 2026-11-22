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
  supabaseUrl: "YOUR_SUPABASE_URL",
  supabaseAnonKey: "YOUR_SUPABASE_ANON_KEY",
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

    // Portfolio pages (editable later in Admin -> Settings)
    owner_name: "MRM",
    portfolio_experience: "",   // e.g. "2" shows a "2 years experience" badge; empty hides it
    dev_summary: "I build modern Android apps and websites with clean design, fast performance and easy-to-manage dashboards.",
    dev_skills: "Android Apps, Websites, UI Design, Admin Dashboards, Supabase",
    video_summary: "I edit short-form and long-form videos that hold attention, and I publish ready-to-use CapCut templates.",
    video_skills: "Short-form edits, CapCut Templates, Motion graphics, Color grading, Sound sync",

    // Free-plan limits used by the admin storage meters (change if your Supabase plan changes)
    limit_storage_mb: "1024",
    limit_db_mb: "500",

    // Text
    tagline: "Apps, websites and video edits that stand out.",
    about_text:
      "MRM is a one-person studio building modern Android apps and websites, and creating eye-catching video edits and CapCut templates. Whether you need a product that works beautifully or a video that holds attention, you get one person who cares about the result from first message to final delivery."
  }
};
