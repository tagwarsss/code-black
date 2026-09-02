document.addEventListener("DOMContentLoaded", () => {

  console.log("DOM loaded");
  console.log("Script loaded");

  document
    .querySelectorAll(".nav-links a")
    .forEach((a) => {
      if (
        a.textContent.trim().toLowerCase() === "home"
      ) {
        a.classList.add("active");
      }
    });

  // =====================================================
  // SUPABASE
  // =====================================================

  const SUPABASE_URL =
    "https://gweqquavdxobtcpetlfr.supabase.co";

  const SUPABASE_ANON_KEY =
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd3ZXFxdWF2ZHhvYnRjcGV0bGZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxODUxMTEsImV4cCI6MjEwMzc2MTExMX0.S21SgiOoW5AYDMRlMe0KFiBLFTM2j14b_NypIvOlEO0";

  console.log(
    "Supabase available:",
    typeof window.supabase
  );

  if (!window.supabase) {
    console.error(
      "Supabase library was not loaded."
    );

    alert(
      "Supabase library is not loaded. Check your Supabase script tag."
    );

    return;
  }

  const sb = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
  );

  console.log(
    "Supabase client created successfully."
  );


// =====================================================
// NAVIGATION
// =====================================================

document
  .querySelectorAll(".nav-links a")
  .forEach((link) => {

    link.addEventListener("click", (e) => {

      if (
        link.id === "loginNavBtn" ||
        link.id === "accountNavBtn" ||
        link.id === "logoutBtn"
      ) {
        return;
      }

      e.preventDefault();

      document
        .querySelectorAll(".nav-links a")
        .forEach((a) => a.classList.remove("active"));

      link.classList.add("active");

      const target =
        link.textContent
          .trim()
          .toLowerCase();

      document
        .querySelectorAll(".section")
        .forEach((section) => {

          section.classList.remove("active");

        });

      const targetSection =
        document.getElementById(target);

      if (targetSection) {
        targetSection.classList.add("active");

        if (target === "gallery") {
          const galleryGrid =
            document.getElementById("galleryGrid");
          if (galleryGrid) {
            galleryGrid.style.opacity = "0";
            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                galleryGrid.style.opacity = "1";
              });
            });
          }
        }
      }

    });

  });


  // =====================================================
  // ACCOUNT MENU / LOGOUT
  // =====================================================

  const accountMenu =
    document.getElementById("accountMenu");

  const accountNavBtn =
    document.getElementById("accountNavBtn");

  const accountDropdown =
    document.getElementById("accountDropdown");

  const logoutBtn =
    document.getElementById("logoutBtn");

  const profileBtn =
    document.getElementById("profileBtn");

  const profileOverlay =
    document.getElementById("profileOverlay");

  const profileClose =
    document.getElementById("profileClose");

  const loginNavBtn =
    document.getElementById("loginNavBtn");


  const showAccountMenu = () => {

    if (loginNavBtn)
      loginNavBtn.parentElement.style.display = "none";

    if (accountMenu) {
      accountMenu.style.display = "";
      accountNavBtn.classList.add("active");
    }

  };


  const showLoginLink = () => {

    if (loginNavBtn) {
      loginNavBtn.parentElement.style.display = "";
      loginNavBtn.classList.add("active");
    }

    if (accountMenu) {
      accountMenu.style.display = "none";
      if (accountNavBtn)
        accountNavBtn.classList.remove("active");
    }

    if (accountDropdown)
      accountDropdown.classList.remove("open");

  };


  if (accountNavBtn) {

    accountNavBtn.addEventListener(
      "click",
      (e) => {

        e.preventDefault();

        if (accountDropdown) {
          accountDropdown.classList.toggle(
            "open"
          );
        }

      }
    );

  }


  document.addEventListener(
    "click",
    (e) => {

      if (
        accountMenu &&
        !accountMenu.contains(e.target) &&
        accountDropdown
      ) {
        accountDropdown.classList.remove(
          "open"
        );
      }

    }
  );


  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async (e) => {

        e.preventDefault();

        try {

          const { error } =
            await sb.auth.signOut();

          if (error) {

            console.error(
              "Logout error:",
              error
            );

            showToast(
              "Logout failed: " +
                error.message,
              "error"
            );

            return;

          }


          showToast("Logged out.");

          showLoginLink();

        } catch (err) {

          console.error(
            "Logout exception:",
            err
          );

        }

      }
    );

  }


  if (profileBtn) {

    profileBtn.addEventListener("click", (e) => {

      e.preventDefault();

      if (accountDropdown)
        accountDropdown.classList.remove("open");

      if (profileOverlay)
        profileOverlay.classList.add("open");

    });

  }


  if (profileClose) {

    profileClose.addEventListener("click", () => {

      if (profileOverlay)
        profileOverlay.classList.remove("open");

    });

  }


  if (profileOverlay) {

    profileOverlay.addEventListener("click", (e) => {

      if (e.target === profileOverlay)
        profileOverlay.classList.remove("open");

    });

  }


  // -----------------------------------------------------
  // PROFILE TABS
  // -----------------------------------------------------
  const profileNavItems = document.querySelectorAll(".profile-nav-item");
  const profileTabs = document.querySelectorAll(".profile-tab");

  profileNavItems.forEach((item) => {
    item.addEventListener("click", () => {
      const tabId = item.getAttribute("data-tab");
      profileNavItems.forEach((nav) => nav.classList.remove("active"));
      profileTabs.forEach((tab) => tab.classList.remove("active"));
      item.classList.add("active");
      const target = document.getElementById(tabId);
      if (target) target.classList.add("active");
      if (tabId === "uploadsTab") {
        console.log("Uploads tab clicked, loading uploads...");
        loadUserUploads();
      }
    });
  });


  let uploadsLoadId = 0;

  const loadUserUploads = async () => {
    const grid = document.getElementById("profileUploadsGrid");
    if (!grid) return;

    const thisLoadId = ++uploadsLoadId;

    const { data: sessionData } = await sb.auth.getSession();
    const userId = sessionData?.session?.user?.id;
    if (!userId || thisLoadId !== uploadsLoadId) return;

    const { data: records, error: dbError } = await sb
      .from("instax")
      .select("image_path")
      .eq("user_id", userId);

    if (dbError || thisLoadId !== uploadsLoadId) return;

    grid.innerHTML = "";

    for (const record of records) {
      if (thisLoadId !== uploadsLoadId) return;

      const { data: urlData, error: urlError } = await sb.storage
        .from("images")
        .createSignedUrl(record.image_path, 3600);

      if (urlError || thisLoadId !== uploadsLoadId) continue;

      const item = document.createElement("div");
      item.className = "profile-upload-item";
      const img = document.createElement("img");
      img.src = urlData.signedUrl;
      img.alt = record.image_path;
      item.appendChild(img);
      grid.appendChild(item);
    }
  };


  // -----------------------------------------------------
  // CHANGE PASSWORD
  // -----------------------------------------------------
  const passwordForm = document.getElementById("passwordForm");

  if (passwordForm) {
    passwordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const currentPassword = document.getElementById("currentPassword").value;
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      if (newPassword !== confirmPassword) {
        showToast("New passwords do not match");
        return;
      }

      if (newPassword.length < 6) {
        showToast("Password must be at least 6 characters");
        return;
      }

      try {
        const { error } = await sb.auth.updateUser({ password: newPassword });
        if (error) {
          showToast(error.message);
          return;
        }
        showToast("Password updated successfully");
        passwordForm.reset();
      } catch (err) {
        showToast("Failed to update password");
      }
    });
  }


  // -----------------------------------------------------
  // INITIAL SESSION CHECK
  // -----------------------------------------------------

  sb.auth.getSession().then(({ data }) => {

    if (data && data.session) {
      showAccountMenu();
    } else {
      showLoginLink();
    }

  });


  // =====================================================
  // UPLOAD SYSTEM
  // =====================================================
  (function () {

    const uploadBtn =
      document.querySelector(".upload-btn");

    const uploadPanel =
      document.getElementById(
        "uploadPanel"
      );

    const uploadClose =
      document.querySelector(
        ".upload-close"
      );

    const uploadInput =
      document.getElementById(
        "uploadFileInput"
      );

    const uploadCount =
      document.getElementById(
        "uploadCount"
      );

    const uploadSubmit =
      document.getElementById(
        "uploadSubmit"
      );

    const uploadFileList =
      document.getElementById(
        "uploadFileList"
      );


    if (!uploadBtn || !uploadPanel) {

      console.log(
        "Upload system not found. Skipping."
      );

      return;
    }


    const MAX_FILES = 3;

    let selectedFiles = [];


    // -----------------------------------------------------
    // UPDATE COUNT
    // -----------------------------------------------------

    const updateUploadCount = () => {

      if (!uploadCount) return;

      uploadCount.textContent =
        `${selectedFiles.length}/${MAX_FILES}`;

    };


    // -----------------------------------------------------
    // RENDER FILE LIST
    // -----------------------------------------------------

    const renderFileList = () => {

      if (!uploadFileList) return;

      uploadFileList.innerHTML = "";


      selectedFiles.forEach(
        (file, index) => {

          const item =
            document.createElement("div");

          item.className =
            "upload-file-item";


          const nameSpan =
            document.createElement("span");

          nameSpan.className =
            "upload-file-item-name";

          nameSpan.textContent =
            file.name;

          nameSpan.title =
            file.name;


          const removeBtn =
            document.createElement("button");

          removeBtn.type = "button";

          removeBtn.className =
            "upload-file-item-remove";

          removeBtn.innerHTML =
            "&times;";

          removeBtn.setAttribute(
            "aria-label",
            `Remove ${file.name}`
          );


          removeBtn.addEventListener(
            "click",
            (e) => {

              e.preventDefault();

              e.stopPropagation();

              selectedFiles.splice(
                index,
                1
              );

              renderFileList();

              updateUploadCount();

              if (uploadInput) {
                uploadInput.value = "";
              }

            }
          );


          item.appendChild(nameSpan);

          item.appendChild(removeBtn);

          uploadFileList.appendChild(item);

        }
      );

    };


    // -----------------------------------------------------
    // FILE INPUT
    // -----------------------------------------------------

    if (uploadInput) {

      uploadInput.addEventListener(
        "change",
        () => {

          const files =
            Array.from(
              uploadInput.files || []
            );

          const remaining =
            MAX_FILES -
            selectedFiles.length;

          const toAdd =
            files.slice(
              0,
              Math.max(0, remaining)
            );


          if (
            toAdd.length <
            files.length
          ) {

            void uploadPanel.offsetWidth;

            uploadPanel.classList.add(
              "shake"
            );

            setTimeout(() => {

              uploadPanel.classList.remove(
                "shake"
              );

            }, 400);

          }


          selectedFiles =
            selectedFiles.concat(
              toAdd
            );

          renderFileList();

          updateUploadCount();

          uploadInput.value = "";

        }
      );

    }


    // -----------------------------------------------------
    // OPEN / CLOSE UPLOAD
    // -----------------------------------------------------

    const toggleUpload = () => {

      const isOpen =
        uploadPanel.classList.toggle(
          "open"
        );

      uploadBtn.classList.toggle(
        "active",
        isOpen
      );


      if (
        isOpen &&
        uploadInput
      ) {

        uploadInput.value = "";

      }

    };


    uploadBtn.addEventListener(
      "click",
      () => {

        sb.auth.getSession().then(
          ({ data }) => {

            if (!data || !data.session) {

              showToast(
                "Please log in first to upload.",
                "error"
              );

              return;

            }

            toggleUpload();

          }
        );

      }
    );


    if (uploadClose) {

      uploadClose.addEventListener(
        "click",
        toggleUpload
      );

    }


    // -----------------------------------------------------
    // CLOSE OUTSIDE
    // -----------------------------------------------------

    document.addEventListener(
      "click",
      (e) => {

        if (
          !uploadPanel.classList.contains(
            "open"
          )
        ) {
          return;
        }


        if (
          uploadPanel.contains(
            e.target
          ) ||
          uploadBtn.contains(
            e.target
          )
        ) {
          return;
        }


        uploadPanel.classList.remove(
          "open"
        );

        uploadBtn.classList.remove(
          "active"
        );

      }
    );


    // -----------------------------------------------------
    // UPLOAD
    // -----------------------------------------------------

    if (
      uploadSubmit &&
      uploadInput
    ) {

      uploadSubmit.addEventListener(
        "click",
        async () => {

          const files =
            selectedFiles;


          if (!files.length) {

            void uploadPanel.offsetWidth;

            uploadPanel.classList.add(
              "shake"
            );

            setTimeout(() => {

              uploadPanel.classList.remove(
                "shake"
              );

            }, 400);

            return;
          }


          if (
            files.length >
            MAX_FILES
          ) {

            void uploadPanel.offsetWidth;

            uploadPanel.classList.add(
              "shake"
            );

            setTimeout(() => {

              uploadPanel.classList.remove(
                "shake"
              );

            }, 400);

            return;
          }


          uploadSubmit.disabled =
            true;


          let uploadedKeys = [];


          try {

            const { data: sessionData, error: sessionError } =
              await sb.auth.getSession();


            if (
              sessionError ||
              !sessionData ||
              !sessionData.session ||
              !sessionData.session.user
            ) {

              showToast(
                "Please log in first to upload.",
                "error"
              );

              return;

            }


            const userId =
              sessionData.session.user.id;


            console.log(
              "Authenticated user ID:",
              userId
            );


            for (
              const file of files
            ) {

              const finalName =
                `${userId}_${file.name}`;


              console.log(
                "Uploading:",
                finalName
              );


              const {
                error
              } = await sb.storage
                .from("images")
                .upload(
                  finalName,
                  file,
                  {
                    cacheControl:
                      "3600",
                    upsert:
                      false
                  }
                );


              if (error) {

                console.error(
                  "Storage upload error:",
                  error
                );

                throw error;

              }


              uploadedKeys.push(finalName);


              const {
                error: dbError
              } = await sb
                .from("instax")
                .insert({
                  user_id:
                    userId,
                  image_path:
                    finalName
                });


              if (dbError) {

                console.error(
                  "DB insert error:",
                  dbError
                );


                await sb.storage
                  .from("images")
                  .remove([
                    finalName
                  ]);


                uploadedKeys =
                  uploadedKeys.filter(
                    (k) =>
                      k !== finalName
                  );


                throw dbError;

              }

            }


            console.log(
              "All files uploaded."
            );


            showToast(
              "Upload complete!"
            );

            if (
              typeof window.refreshGallery ===
              "function"
            ) {
              window.refreshGallery();
            }

            uploadPanel.classList.remove(
              "open"
            );

            uploadBtn.classList.remove(
              "active"
            );

            selectedFiles = [];

            renderFileList();

            updateUploadCount();


          } catch (error) {

            console.error(
              "Upload failed:",
              error
            );


            if (
              uploadedKeys.length >
              0
            ) {

              try {

                await sb.storage
                  .from("images")
                  .remove(
                    uploadedKeys
                  );

              } catch (cleanupErr) {

                console.error(
                  "Cleanup failed:",
                  cleanupErr
                );

              }

            }


            showToast(
              "Upload failed: " +
                (error.message ||
                  "Unknown error"),
              "error"
            );


            void uploadPanel.offsetWidth;

            uploadPanel.classList.add(
              "shake"
            );

            setTimeout(() => {

              uploadPanel.classList.remove(
                "shake"
              );

            }, 400);

          } finally {

            uploadSubmit.disabled =
              false;

          }

        }
      );

    }

  })();


  // =====================================================
  // GALLERY SYSTEM - Instax Photos (from reference design)
  // =====================================================

  (function () {

    const galleryGrid =
      document.getElementById(
        "galleryGrid"
      );

    const gallerySection =
      document.getElementById(
        "gallery"
      );

    if (!galleryGrid) {

      console.log(
        "Gallery grid not found. Skipping gallery load."
      );

      return;

    }


    const IMAGE_EXTENSIONS =
      [
        ".jpg", ".jpeg",
        ".png", ".gif",
        ".webp", ".jfif",
        ".bmp", ".svg"
      ];

    const knownImages =
      new Set();

    const DRAG_THRESHOLD = 5;


    // -----------------------------------------------------
    // CHECK IF FILE IS AN IMAGE
    // -----------------------------------------------------

    const isImageFile = (
      name
    ) => {

      const lower =
        (name || "").toLowerCase();

      if (
        lower.endsWith("/")
      ) {

        return false;

      }

      return IMAGE_EXTENSIONS.some(
        (ext) =>
          lower.endsWith(ext)
      );

    };


    // -----------------------------------------------------
    // GET PUBLIC URL
    // -----------------------------------------------------

    const getPublicUrl = (
      fileName,
      client = sb,
      bucket = "images"
    ) => {
      const { data } = client.storage
        .from(bucket)
        .getPublicUrl(fileName);

      console.log(`Public URL for ${fileName}:`, data.publicUrl);
      return data.publicUrl;
    };

    // -----------------------------------------------------
    // GET SIGNED URL (fallback for private buckets)
    // -----------------------------------------------------

    const getSignedUrl = async (
      fileName,
      client = sb,
      bucket = "images"
    ) => {
      const { data, error } = await client.storage
        .from(bucket)
        .createSignedUrl(fileName, 3600);

      if (error) {
        console.error(`Signed URL error for ${fileName}:`, error);
        return null;
      }

      console.log(`Signed URL for ${fileName}:`, data.signedUrl);
      return data.signedUrl;
    };


    // -----------------------------------------------------
    // SCATTER ITEM (random position + rotation)
    // -----------------------------------------------------

    const scatterItem = (
      item
    ) => {

      const vw =
        window.innerWidth;

      const vh =
        window.innerHeight;

      const w = 160;

      const h = 180;

      const maxScale =
        1.4;

      const x =
        Math.max(
          0,
          Math.random() *
            (vw - w * maxScale)
        );

      const y =
        Math.max(
          0,
          Math.random() *
            (vh - h * maxScale)
        );

      const angle =
        (Math.random() - 0.5) *
        14;

      const scale =
        1.2 +
        Math.random() * 0.2;


      item.style.left =
        `${x}px`;

      item.style.top =
        `${y}px`;

      item.style.setProperty(
        "--rotate",
        `${angle}deg`
      );

      item.style.setProperty(
        "--scale",
        `${scale}`
      );

      item.style.zIndex =
        Math.floor(
          Math.random() * 10
        ) + 1;

    };


    // -----------------------------------------------------
    // CREATE INSTAX GALLERY ITEM
    // -----------------------------------------------------

    const createGalleryItem = (
      src,
      fileName
    ) => {

      const item =
        document.createElement(
          "div"
        );

      item.className =
        "instax-photo";

      item.dataset.fileName =
        fileName || "";

      item.style.opacity =
        "0";

      item.style.cursor =
        "grab";


      const img =
        document.createElement(
          "img"
        );

      img.src = src;

      img.alt = "";

      img.draggable = false;

      img.addEventListener(
        "dragstart",
        (e) =>
          e.preventDefault()
      );

      img.addEventListener(
        "error",
        async () => {
          console.error(
            "Failed to load public URL, trying signed URL..."
          );
          const signedUrl = await getSignedUrl(fileName);
          if (signedUrl) {
            img.src = signedUrl;
          } else {
            console.error(
              "Could not load image:",
              fileName
            );
            item.style.display = "none";
          }
        }
      );

      img.addEventListener(
        "load",
        () => {
          console.log(
            "Loaded gallery image:",
            fileName
          );
        }
      );


      item.appendChild(img);

      scatterItem(item);

      attachDrag(item);

      return item;

    };


    // -----------------------------------------------------
    // GALLERY OVERLAY (full-size view)
    // -----------------------------------------------------

    let activeImageOverlay =
      null;


    const closeOverlay = () => {

      if (
        !activeImageOverlay
      ) {

        return;

      }

      activeImageOverlay.classList.remove(
        "visible"
      );

      setTimeout(
        () => {

          if (
            activeImageOverlay
          ) {

            activeImageOverlay.style.display =
              "none";

          }

        },
        400
      );

    };


    const ensureOverlay = () => {

      if (
        !activeImageOverlay
      ) {

        activeImageOverlay =
          document.createElement(
            "div"
          );

        activeImageOverlay.className =
          "gallery-overlay";

        const overlayImg =
          document.createElement(
            "img"
          );

        overlayImg.draggable =
          false;

        overlayImg.addEventListener(
          "dragstart",
          (e) =>
            e.preventDefault()
        );

        overlayImg.addEventListener(
          "contextmenu",
          (e) =>
            e.preventDefault()
        );

        activeImageOverlay.appendChild(
          overlayImg
        );

        activeImageOverlay.addEventListener(
          "click",
          closeOverlay
        );

        activeImageOverlay.addEventListener(
          "contextmenu",
          (e) =>
            e.preventDefault()
        );

        document.body.appendChild(
          activeImageOverlay
        );

      }

      return activeImageOverlay;

    };


    // -----------------------------------------------------
    // ITEM CLICK (open overlay)
    // -----------------------------------------------------

    const onItemClick = (
      e
    ) => {

      const item =
        e.currentTarget;

      const img =
        item.querySelector(
          "img"
        );

      if (!img) return;

      const src =
        img.getAttribute(
          "src"
        );

      if (!src) return;

      const overlay =
        ensureOverlay();

      const overlayImg =
        overlay.querySelector(
          "img"
        );

      overlayImg.src = src;

      overlay.style.display =
        "flex";

      requestAnimationFrame(
        () => {

          overlay.classList.add(
            "visible"
          );

        }
      );

    };


    // -----------------------------------------------------
    // DRAG FUNCTIONALITY
    // -----------------------------------------------------

    const attachDrag = (
      item
    ) => {

      let isDragging =
        false;

      let hasDragged =
        false;

      let startX = 0;

      let startY = 0;

      let initialLeft = 0;

      let initialTop = 0;


      const onPointerDown = (
        e
      ) => {

        if (
          e.button !==
          0
        ) return;

        isDragging =
          true;

        hasDragged =
          false;

        startX =
          e.clientX;

        startY =
          e.clientY;

        initialLeft =
          item.offsetLeft;

        initialTop =
          item.offsetTop;

        let topZ = 0;
        galleryGrid.querySelectorAll(".instax-photo").forEach((el) => {
          if (el === item) return;
          const z = parseInt(el.style.zIndex, 10);
          if (!isNaN(z) && z > topZ) topZ = z;
        });
        item.style.zIndex = String(Math.max(100, topZ + 1));

        item.setPointerCapture(
          e.pointerId
        );

        item.style.cursor =
          "grabbing";

        e.preventDefault();

        e.stopPropagation();

      };


      const onPointerMove = (
        e
      ) => {

        if (
          !isDragging
        ) return;

        const dx =
          e.clientX -
          startX;

        const dy =
          e.clientY -
          startY;

        if (
          Math.abs(dx) >
            DRAG_THRESHOLD ||
          Math.abs(dy) >
            DRAG_THRESHOLD
        ) {

          hasDragged =
            true;

        }

        item.style.left =
          `${initialLeft + dx}px`;

        item.style.top =
          `${initialTop + dy}px`;

      };


      const onPointerUp = (
        e
      ) => {

        if (
          !isDragging
        ) return;

        isDragging =
          false;

        item.style.cursor =
          "grab";

        if (
          !hasDragged
        ) {

          onItemClick(e);

          return;

        }

        void item;

      };


      item.addEventListener(
        "pointerdown",
        onPointerDown
      );

      item.addEventListener(
        "pointermove",
        onPointerMove
      );

      item.addEventListener(
        "pointerup",
        onPointerUp
      );

      item.addEventListener(
        "pointercancel",
        onPointerUp
      );

      item.addEventListener(
        "click",
        () => {
          let topZ = 0;
          galleryGrid.querySelectorAll(".instax-photo").forEach((el) => {
            const z = parseInt(el.style.zIndex, 10);
            if (!isNaN(z) && z > topZ) topZ = z;
          });
          item.style.zIndex = String(topZ + 1);
        }
      );

    };


    galleryGrid.attachDragToItem =
      attachDrag;

    galleryGrid.createGalleryItem =
      createGalleryItem;


    // -----------------------------------------------------
    // GET IMAGE FILES from "images" bucket
    // -----------------------------------------------------

    const getImageFiles = async () => {
      let files = [];

      try {
        const { data: listData, error: listError } =
          await sb.storage.from("images").list();

        if (listError) {
          console.error("Images bucket list error:", listError);
          showToast("Bucket error: " + listError.message, "error");
          return files;
        }

        if (!listData || listData.length === 0) {
          console.log("Images bucket is empty");
          return files;
        }

        console.log("Found files in bucket:", listData);

        listData.forEach((file) => {
          if (!isImageFile(file.name)) {
            console.log("Skipping non-image file:", file.name);
            return;
          }

          const src = getPublicUrl(file.name, sb, "images");
          console.log("Image URL:", src);

          files.push({
            name: file.name,
            src: src
          });
        });

      } catch (listErr) {
        console.error("Images bucket exception:", listErr);
        showToast("Failed to load images: " + listErr.message, "error");
      }

      return files;
    };


    // -----------------------------------------------------
    // APPEND NEW GALLERY ITEMS
    // -----------------------------------------------------

    const appendGalleryItems = async (files) => {
      if (!files.length) return;

      let index = knownImages.size;
      const newFiles = [];

      files.forEach((file) => {
        const name = file.name || "";
        if (knownImages.has(name)) return;
        knownImages.add(name);
        newFiles.push(file);
      });

      const count = newFiles.length;
      const totalTime = 4;
      const delayBetween = 0.2;
      const animDuration = Math.max(0.5, totalTime - (count - 1) * delayBetween);

      newFiles.forEach((file, i) => {
        const src = file.src;
        const item = createGalleryItem(src, file.name);
        item.style.opacity = "0";
        item.style.animationDelay = `${i * delayBetween}s`;
        item.style.animationFillMode = "forwards";
        item.style.animationName = "instaxFadeIn";
        item.style.animationDuration = `${animDuration}s`;
        item.style.animationTimingFunction = "ease";
        galleryGrid.appendChild(item);
      });
    };


    // -----------------------------------------------------
    // LOAD GALLERY
    // -----------------------------------------------------

    let galleryLoaded = false;

    const loadGallery = async () => {
      try {
        console.log("Loading gallery from 'images' bucket...");

        const files = await getImageFiles();

        console.log("Files found:", files.length, files);

        if (!files.length) {
          if (!galleryLoaded) {
            showToast("No images found in the 'images' bucket.");
            galleryLoaded = true;
          }
          return;
        }

        galleryLoaded = true;
        await appendGalleryItems(files);

      } catch (error) {
        console.error("Gallery load error:", error);
        showToast("Gallery error: " + error.message, "error");
      }
    };


    // -----------------------------------------------------
    // EXPOSE FOR UPLOAD REFRESH
    // -----------------------------------------------------

    window.refreshGallery =
      loadGallery;


    // -----------------------------------------------------
    // LOAD IMMEDIATELY + POLL
    // -----------------------------------------------------

    loadGallery();

    setInterval(
      async () => {

        if (
          !gallerySection
        ) return;

        if (
          !gallerySection.classList.contains(
            "active"
          )
        ) return;

        try {

          const files =
            await getImageFiles();

          await appendGalleryItems(
            files
          );

        } catch (
          error
        ) {

          console.error(
            "Gallery poll error:",
            error
          );

        }

      },
      6000
    );

  })();


  // =====================================================
  // TOAST
  // =====================================================

  function showToast(
    message,
    type = "success"
  ) {

    const toastEl =
      document.getElementById(
        "toast"
      );

    if (!toastEl) {

      alert(message);

      return;
    }


    toastEl.textContent =
      message;

    toastEl.className =
      "toast";


    if (type === "error") {

      toastEl.classList.add(
        "error"
      );

    }


    toastEl.classList.add(
      "show"
    );


    setTimeout(() => {

      toastEl.classList.remove(
        "show"
      );

    }, 3000);

  }


  // =====================================================
  // AUTH SYSTEM
  // =====================================================

  (function () {

    const loginNavBtn =
      document.getElementById(
        "loginNavBtn"
      );

    const authOverlay =
      document.getElementById(
        "authOverlay"
      );

    const authClose =
      document.getElementById(
        "authClose"
      );

    const authTabs =
      document.querySelectorAll(
        ".auth-tab"
      );

    const authForms =
      document.querySelectorAll(
        ".auth-form"
      );

    const loginForm =
      document.getElementById(
        "loginForm"
      );

    const registerForm =
      document.getElementById(
        "registerForm"
      );


    console.log(
      "loginNavBtn:",
      !!loginNavBtn
    );

    console.log(
      "authOverlay:",
      !!authOverlay
    );

    console.log(
      "loginForm:",
      !!loginForm
    );

    console.log(
      "registerForm:",
      !!registerForm
    );


    if (
      !loginNavBtn ||
      !authOverlay
    ) {

      console.error(
        "Auth HTML elements are missing."
      );

      return;
    }


    const authPanel =
      authOverlay.querySelector(
        ".auth-panel"
      );


    // -----------------------------------------------------
    // SHAKE
    // -----------------------------------------------------

    const shakeAuthPanel = () => {

      if (!authPanel) return;

      void authPanel.offsetWidth;

      authPanel.classList.add(
        "shake"
      );

      setTimeout(() => {

        authPanel.classList.remove(
          "shake"
        );

      }, 400);

    };


    // -----------------------------------------------------
    // OPEN
    // -----------------------------------------------------

    const openAuth = () => {

      authOverlay.classList.add(
        "open"
      );

    };


    // -----------------------------------------------------
    // CLOSE
    // -----------------------------------------------------

    const closeAuth = () => {

      authOverlay.classList.remove(
        "open"
      );

    };


    // -----------------------------------------------------
    // LOGIN NAV BUTTON
    // -----------------------------------------------------

    loginNavBtn.addEventListener(
      "click",
      (e) => {

        e.preventDefault();

        openAuth();

      }
    );


    // -----------------------------------------------------
    // CLOSE
    // -----------------------------------------------------

    if (authClose) {

      authClose.addEventListener(
        "click",
        closeAuth
      );

    }


    // -----------------------------------------------------
    // CLOSE OUTSIDE
    // -----------------------------------------------------

    authOverlay.addEventListener(
      "click",
      (e) => {

        if (
          e.target === authOverlay
        ) {

          closeAuth();

        }

      }
    );


    // -----------------------------------------------------
    // AUTH TABS
    // -----------------------------------------------------

    authTabs.forEach(
      (tab) => {

        tab.addEventListener(
          "click",
          () => {

            const target =
              tab.dataset.tab;


            authTabs.forEach(
              (t) => {

                t.classList.remove(
                  "active"
                );

              }
            );


            tab.classList.add(
              "active"
            );


            authForms.forEach(
              (form) => {

                form.classList.toggle(
                  "active",
                  form.id ===
                    `${target}Form`
                );

              }
            );

          }
        );

      }
    );


    // -----------------------------------------------------
    // PASSWORD TOGGLE
    // -----------------------------------------------------

    document
      .querySelectorAll(
        ".password-toggle"
      )
      .forEach((btn) => {

        btn.addEventListener(
          "click",
          () => {

            const targetId =
              btn.dataset.target;

            const input =
              document.getElementById(
                targetId
              );

            if (!input) return;

            const isPassword =
              input.type === "password";

            input.type =
              isPassword ? "text" : "password";

            btn.setAttribute(
              "aria-label",
              isPassword
                ? "Hide password"
                : "Show password"
            );

            btn.classList.toggle(
              "show",
              isPassword
            );

          }
        );

      });


    // =====================================================
    // LOGIN
    // =====================================================

    if (loginForm) {

      loginForm.addEventListener(
        "submit",
        async (e) => {

          e.preventDefault();

          console.log(
            "=== LOGIN SUBMITTED ==="
          );


          const emailInput =
            document.getElementById(
              "loginEmail"
            );

          const passwordInput =
            document.getElementById(
              "loginPassword"
            );


          if (
            !emailInput ||
            !passwordInput
          ) {

            console.error(
              "Login inputs missing."
            );

            return;
          }


          const email =
            emailInput.value.trim();

          const password =
            passwordInput.value;


          if (
            !email ||
            !password
          ) {

            shakeAuthPanel();

            return;
          }


          try {

            console.log(
              "Signing in..."
            );


            const {
              data,
              error
            } =
              await sb.auth
                .signInWithPassword({
                  email:
                    email,
                  password:
                    password
                });


            if (error) {

              console.error(
                "Login failed:",
                error
              );

              showToast(
                "Login failed: " +
                  error.message,
                "error"
              );

              shakeAuthPanel();

              return;
            }


            console.log(
              "Login successful:",
              data.user
            );


            showToast(
              "Login successful!"
            );


            showAccountMenu();

            closeAuth();

          } catch (err) {

            console.error(
              "Login exception:",
              err
            );

            showToast(
              "Login failed: " +
                err.message,
              "error"
            );

          }

        }
      );

    }


    // =====================================================
    // REGISTER
    // =====================================================

    if (!registerForm) {

      console.error(
        "REGISTER FORM NOT FOUND!"
      );

      return;
    }


    console.log(
      "Register form found."
    );


    registerForm.addEventListener(
      "submit",
      async (e) => {

        e.preventDefault();

        e.stopPropagation();


        console.log(
          "================================"
        );

        console.log(
          "REGISTER BUTTON CLICKED"
        );

        console.log(
          "REGISTER FORM SUBMITTED"
        );

        console.log(
          "================================"
        );


        // -------------------------------------------------
        // GET INPUTS
        // -------------------------------------------------

        const emailInput =
          document.getElementById(
            "regEmail"
          );

        const passwordInput =
          document.getElementById(
            "regPassword"
          );


        if (!emailInput) {

          console.error(
            "regEmail NOT FOUND!"
          );

          alert(
            "Email input not found."
          );

          return;
        }


        if (!passwordInput) {

          console.error(
            "regPassword NOT FOUND!"
          );

          alert(
            "Password input not found."
          );

          return;
        }


        const email =
          emailInput.value.trim();

        const password =
          passwordInput.value;


        console.log(
          "Email:",
          email
        );


        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!email) {

          showToast(
            "Email is required.",
            "error"
          );

          shakeAuthPanel();

          return;
        }


        if (!password) {

          showToast(
            "Password is required.",
            "error"
          );

          shakeAuthPanel();

          return;
        }


        if (password.length < 6) {

          showToast(
            "Password must be at least 6 characters.",
            "error"
          );

          shakeAuthPanel();

          return;
        }


        // -------------------------------------------------
        // BUTTON
        // -------------------------------------------------

        const registerBtn =
          document.getElementById(
            "registerSubmitBtn"
          );


        if (registerBtn) {

          registerBtn.disabled =
            true;

          registerBtn.textContent =
            "Registering...";

        }


        try {

          console.log(
            "Calling Supabase Auth signUp..."
          );


          // =================================================
          // CREATE USER IN SUPABASE AUTH
          // =================================================

          const {
            data,
            error
          } =
            await sb.auth.signUp({

              email:
                email,

              password:
                password

            });


          console.log(
            "Supabase signUp returned:"
          );

          console.log(
            "Data:",
            data
          );

          console.log(
            "Error:",
            error
          );


          // -------------------------------------------------
          // ERROR
          // -------------------------------------------------

          if (error) {

            console.error(
              "SUPABASE REGISTRATION ERROR:",
              error
            );


            showToast(
              error.message,
              "error"
            );

            shakeAuthPanel();

            return;
          }


          // -------------------------------------------------
          // NO USER
          // -------------------------------------------------

          if (
            !data ||
            !data.user
          ) {

            console.error(
              "Supabase did not return a user."
            );


            showToast(
              "Registration failed. No user was created.",
              "error"
            );

            return;
          }


          // =================================================
          // SUCCESS
          // =================================================

          console.log(
            "================================"
          );

          console.log(
            "USER CREATED SUCCESSFULLY"
          );

          console.log(
            "USER ID:",
            data.user.id
          );

          console.log(
            "EMAIL:",
            data.user.email
          );

          console.log(
            "================================"
          );


          // -------------------------------------------------
          // EMAIL CONFIRMATION CHECK
          // -------------------------------------------------

          if (
            data.session
          ) {

            showToast(
              "Registration successful!"
            );

            showAccountMenu();

          } else {

            showToast(
              "Account created! Check your email to confirm your account."
            );

          }


          // -------------------------------------------------
          // CLEAR FORM
          // -------------------------------------------------

          emailInput.value =
            "";

          passwordInput.value =
            "";


          // -------------------------------------------------
          // CLOSE AUTH
          // -------------------------------------------------

          setTimeout(() => {

            closeAuth();

          }, 1000);


        } catch (err) {

          console.error(
            "UNEXPECTED REGISTRATION ERROR:",
            err
          );


          showToast(
            "Registration failed: " +
              err.message,
            "error"
          );

          shakeAuthPanel();


        } finally {

          if (registerBtn) {

            registerBtn.disabled =
              false;

            registerBtn.textContent =
              "Register";

          }

        }

      }
    );


    console.log(
      "================================"
    );

    console.log(
      "REGISTER LISTENER ATTACHED"
    );

    console.log(
      "================================"
    );

  })();

});