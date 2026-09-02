// =====================================================
// RETRIEVE AND DISPLAY USER UPLOADS
// =====================================================

const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";

const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// -----------------------------------------------------
// STEP 1: Get the logged-in user's UUID
// -----------------------------------------------------
async function getUserId() {
  const { data: sessionData } = await sb.auth.getSession();
  return sessionData?.session?.user?.id;
}

// -----------------------------------------------------
// STEP 2: Query instax table for user's records
// -----------------------------------------------------
async function getUserRecords(userId) {
  const { data: records, error } = await sb
    .from("instax")
    .select("image_path")
    .eq("user_id", userId);

  if (error) {
    console.error("DB query error:", error);
    return [];
  }

  return records || [];
}

// -----------------------------------------------------
// STEP 3: Get public URL from images bucket
// -----------------------------------------------------
function getImageUrl(imagePath) {
  const { data: urlData } = sb.storage.from("images").getPublicUrl(imagePath);
  return urlData?.publicUrl;
}

// -----------------------------------------------------
// STEP 4: Render images in grid
// -----------------------------------------------------
function renderGrid(records, gridElement) {
  gridElement.innerHTML = "";

  if (records.length === 0) {
    gridElement.innerHTML = "<p>No uploads found</p>";
    return;
  }

  records.forEach((record) => {
    const publicUrl = getImageUrl(record.image_path);
    if (!publicUrl) return;

    const item = document.createElement("div");
    item.className = "profile-upload-item";

    const img = document.createElement("img");
    img.src = publicUrl;
    img.alt = record.image_path;

    item.appendChild(img);
    gridElement.appendChild(item);
  });
}

// -----------------------------------------------------
// MAIN: Load and display user uploads
// -----------------------------------------------------
async function loadUserUploads() {
  const grid = document.getElementById("profileUploadsGrid");
  if (!grid) return;

  const userId = await getUserId();
  if (!userId) return;

  const records = await getUserRecords(userId);
  renderGrid(records, grid);
}

// Call when Uploads tab is clicked
document.addEventListener("DOMContentLoaded", () => {
  const uploadsTab = document.querySelector('[data-tab="uploadsTab"]');
  if (uploadsTab) {
    uploadsTab.addEventListener("click", loadUserUploads);
  }
});
