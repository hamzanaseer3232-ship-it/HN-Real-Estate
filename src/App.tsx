import { useState, useEffect, ChangeEvent, FormEvent } from "react";
import { motion } from "motion/react";
import luxuryHeroBg from "./assets/images/luxury_hq_hero_1782417450935.jpg";
import { 
  Building, 
  Home, 
  MapPin, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  LogOut, 
  Lock, 
  Mail, 
  Key, 
  Check, 
  X, 
  Video, 
  Image as ImageIcon, 
  Filter, 
  Bed, 
  Bath, 
  Maximize, 
  Star, 
  Database,
  CloudLightning,
  LayoutDashboard,
  Eye,
  Heart,
  Phone,
  HelpCircle,
  Sparkles,
  ShieldCheck,
  Award,
  Layers,
  Compass,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Map,
  Send,
  CheckCircle2
} from "lucide-react";

// Types corresponding to MongoDB / Fallback Property schema
interface PropertyType {
  _id?: string;
  id?: number | string;
  title: string;
  description: string;
  price: string;
  type: "Sale" | "Rent";
  category: "House" | "Plot" | "Apartment" | "Commercial" | "School" | "Hospital";
  location: string;
  city: string;
  beds: string;
  baths: string;
  area: string;
  image: string;
  gallery?: string[];
  images?: string[];
  video?: string;
  featured: boolean;
  features: string[];
  createdAt?: string;
}

// Safe LocalStorage helper supporting iframe environments with restricted storage access
const safeStorage = {
  getItem(key: string): string {
    try {
      return localStorage.getItem(key) || "";
    } catch (e) {
      console.warn(`Storage item read failed for key ${key}: storage access may be disabled inside iframe. Falling back to in-memory store.`, e);
      return (window as any).__in_memory_storage?.[key] || "";
    }
  },
  setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn(`Storage item write failed for key ${key}: storage access may be disabled inside iframe. Falling back to in-memory store.`, e);
      if (!(window as any).__in_memory_storage) {
        (window as any).__in_memory_storage = {};
      }
      (window as any).__in_memory_storage[key] = value;
    }
  },
  removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`Storage item removal failed for key ${key}: storage access may be disabled inside iframe. Falling back to in-memory store.`, e);
      if ((window as any).__in_memory_storage) {
        delete (window as any).__in_memory_storage[key];
      }
    }
  }
};

// Premium Gold Interlocking Serif Logo Component
const HNLogo = ({ className = "h-12 w-auto" }: { className?: string }) => {
  return (
    <svg 
      className={className} 
      viewBox="0 0 220 180" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#dcb963" />
          <stop offset="35%" stopColor="#c9a84c" />
          <stop offset="70%" stopColor="#ab8b35" />
          <stop offset="100%" stopColor="#dcb963" />
        </linearGradient>
      </defs>
      
      {/* Left stem of H */}
      <path d="M45 40 H70 V50 H60 V130 H70 V140 H45 V130 H53 V50 H45 V40 Z" fill="url(#goldGradient)" />
      {/* Right stem of H / Interlocking Left of N */}
      <path d="M100 40 H125 V50 H115 V130 H125 V140 H100 V130 H108 V50 H100 V40 Z" fill="url(#goldGradient)" />
      {/* Bridge of H */}
      <path d="M60 85 H108 V95 H60 V85 Z" fill="url(#goldGradient)" />
      
      {/* Letter N diagonal and right stem */}
      <path d="M115 50 L167 130 V50 H157 V40 H183 V50 H173 V130 H183 V140 H157 L115 75 V130 H120 V140 H100 V130 H108 V50 L115 50 Z" fill="url(#goldGradient)" />
      <path d="M173 40 H198 V50 H188 V130 H198 V140 H173 V130 H180 V50 H173 V40 Z" fill="url(#goldGradient)" />

      {/* Double Gold Wave across */}
      <path 
        d="M20 115 C 80 135, 140 75, 200 95 C 160 85, 100 115, 20 115 Z" 
        fill="url(#goldGradient)" 
        opacity="0.95"
      />
      <path 
        d="M25 125 C 85 140, 135 90, 195 105 C 155 95, 105 125, 25 125 Z" 
        fill="url(#goldGradient)" 
        opacity="0.75"
      />
    </svg>
  );
};

const prioritizedCountries = [
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+1", name: "USA", flag: "🇺🇸" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+91", name: "India", flag: "🇮🇳" }
];

const otherCountries = [
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "+852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "+353", name: "Ireland", flag: "🇮🇪" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+64", name: "New Zealand", flag: "🇳🇿" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" }
].sort((a, b) => a.name.localeCompare(b.name));

const countryList = [...prioritizedCountries, ...otherCountries];

export default function App() {
  // Scroll Position for Parallax Effects
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Client-Side Router State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    try {
      return window.location.pathname || "/";
    } catch (e) {
      console.warn("Unable to access window.location.pathname inside sandbox iframe. Defaulting path state to root.", e);
      return "/";
    }
  });
  
  // App Global Auth States
  const [token, setToken] = useState<string>(() => safeStorage.getItem("hamza_real_estate_token") || "");
  const [userEmail, setUserEmail] = useState<string>(() => safeStorage.getItem("hamza_real_estate_email") || "");

  // API Backend States
  const [health, setHealth] = useState<any>(null);
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [allProperties, setAllProperties] = useState<PropertyType[]>([]);
  const [listingsLoading, setListingsLoading] = useState(false);

  // Home Page / Public Portal States
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [selectedPropertyDetails, setSelectedPropertyDetails] = useState<PropertyType | null>(null);
  const [modalActiveImageIdx, setModalActiveImageIdx] = useState(0);

  // Admin Login States
  const [loginEmail, setLoginEmail] = useState("admin@hamzarealestate.pk");
  const [loginPassword, setLoginPassword] = useState("admin123");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Admin Form States (Unified Add/Edit modal/drawer)
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null); // null means adding a new one
  
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formType, setFormType] = useState<"Sale" | "Rent">("Sale");
  const [formCategory, setFormCategory] = useState<"House" | "Plot" | "Apartment" | "Commercial" | "School" | "Hospital">("House");
  const [formLocation, setFormLocation] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formBeds, setFormBeds] = useState("");
  const [formBaths, setFormBaths] = useState("");
  const [formArea, setFormArea] = useState("");
  const [formFeatured, setFormFeatured] = useState(false);
  const [formFeatures, setFormFeatures] = useState("");

  const [formImages, setFormImages] = useState<FileList | null>(null);
  const [formVideo, setFormVideo] = useState<File | null>(null);
  
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadStatus, setUploadStatus] = useState<string>("");

  // Notification UI helpers
  const [globalNotification, setGlobalNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Saved properties state (locally persistent bookmark list)
  const [savedPropertyIds, setSavedPropertyIds] = useState<string[]>(() => {
    try {
      const stored = safeStorage.getItem("hn_saved_properties");
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      return [];
    }
  });

  const toggleSaveProperty = (id: string) => {
    setSavedPropertyIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      try {
        safeStorage.setItem("hn_saved_properties", JSON.stringify(updated));
      } catch (e) {
        console.warn("Saving bookmarked properties failed:", e);
      }
      showNotification(
        prev.includes(id) ? "Property removed from your saved list." : "⭐ Property saved! You can view it anytime.",
        "success"
      );
      return updated;
    });
  };

  // Advanced search states for client-side filtering
  const [filterCity, setFilterCity] = useState("");
  const [filterPriceRange, setFilterPriceRange] = useState(""); // "", "under-50", "50-100", "100-200", "over-200"
  const [filterSize, setFilterSize] = useState(""); // "", "small", "medium", "large", "huge"

  // FAQ accordion active state
  const [activeFaqIdx, setActiveFaqIdx] = useState<number | null>(null);

  // Review Slider State
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [reviewsList, setReviewsList] = useState([
    { text: "Hamza Naseer is very honest. He helped me buy my house in Sialkot. The paperwork was done so fast and there were no hidden charges at all!", author: "Muhammad Bilal", location: "Sialkot City", rating: 5 },
    { text: "I live abroad and wanted to buy a plot in Punjab. Hamza Naseer verified everything for me, sent videos, and handled all details perfectly. I highly recommend him!", author: "Zahid Mahmood", location: "London / Sialkot", rating: 5 },
    { text: "Excellent service! They replied to my WhatsApp messages instantly and showed me multiple properties that perfectly fit my budget.", author: "Aisha Khan", location: "Lahore", rating: 5 }
  ]);

  // Contact form submission local feedback state
  const [contactFormSubmitted, setContactFormSubmitted] = useState(false);
  const [contactFormName, setContactFormName] = useState("");
  const [contactFormEmail, setContactFormEmail] = useState("");
  const [contactCountryCode, setContactCountryCode] = useState("+92");
  const [contactFormPhone, setContactFormPhone] = useState("");
  const [contactFormMsg, setContactFormMsg] = useState("");

  const showNotification = (message: string, type: "success" | "error" | "info" = "success") => {
    setGlobalNotification({ message, type });
    setTimeout(() => setGlobalNotification(null), 5000);
  };

  // Router dispatcher
  const navigate = (path: string) => {
    try {
      window.history.pushState({}, "", path);
    } catch (e) {
      console.warn("History pushState failed, likely due to iframe sandbox restrictions:", e);
    }
    setCurrentPath(path);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      try {
        window.scrollTo(0, 0);
      } catch (scrollError) {
        // Safe fallback
      }
    }
  };

  // Handle browser navigation actions (Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      try {
        setCurrentPath(window.location.pathname || "/");
      } catch (e) {
        console.warn("Could not read location pathname in popstate listener.", e);
      }
    };
    try {
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    } catch (e) {
      console.warn("Could not register popstate event listener.", e);
    }
  }, []);

  // Fetch initial app telemetry & property items
  useEffect(() => {
    fetchHealth();
    fetchProperties();
  }, []);

  const verifySession = async (tokenToVerify: string) => {
    if (!tokenToVerify) return;
    try {
      const authHeaderValue = tokenToVerify.startsWith("Bearer ") ? tokenToVerify : `Bearer ${tokenToVerify}`;
      const res = await fetch("/api/auth/verify", {
        headers: {
          Authorization: authHeaderValue,
        },
      });
      if (res.status === 401) {
        console.warn("Session validation failed. Clearing stored token.");
        setToken("");
        setUserEmail("");
        safeStorage.removeItem("hamza_real_estate_token");
        safeStorage.removeItem("hamza_real_estate_email");
        showNotification("⚠️ Your session has expired or is invalid. Please sign in again.", "error");
        navigate("/admin/login");
      }
    } catch (err: any) {
      console.error("Session verification failed to connect:", err.message);
    }
  };

  // Auto routing security guard for protected paths
  useEffect(() => {
    if (currentPath === "/admin/dashboard") {
      if (!token) {
        showNotification("🔒 Protection Guard: Authenticate session to access administrator panel.", "info");
        navigate("/admin/login");
      } else {
        verifySession(token);
      }
    }
  }, [currentPath, token]);

  const fetchHealth = async () => {
    try {
      const res = await fetch("/api/health");
      const data = await res.json();
      setHealth(data);
    } catch (e) {
      console.warn("API health connection failed: operating with default fallback configuration.", e);
    }
  };

  const fetchProperties = async () => {
    setListingsLoading(true);
    try {
      // 1. Fetch filtered properties list
      const params = new URLSearchParams();
      if (filterType) params.append("type", filterType);
      if (filterCategory) params.append("category", filterCategory);
      if (searchQuery) params.append("search", searchQuery);

      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error("Status " + res.status);
      const json = await res.json();
      if (json.success) {
        setProperties(json.data || []);
      }

      // 2. Fetch unfiltered full roster to calculate accurate, correct dashboard stats
      if (filterType || filterCategory || searchQuery) {
        const unfilteredRes = await fetch("/api/properties");
        if (unfilteredRes.ok) {
          const unfilteredJson = await unfilteredRes.json();
          if (unfilteredJson.success) {
            setAllProperties(unfilteredJson.data || []);
          }
        }
      } else {
        if (json.success) {
          setAllProperties(json.data || []);
        }
      }
    } catch (err: any) {
      console.error("Property database acquisition error:", err.message);
      showNotification("Error connecting to real estate listings pipeline.", "error");
    } finally {
      setListingsLoading(false);
    }
  };

  // Trigger search with delay
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchProperties();
    }, 400);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, filterType, filterCategory]);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setAuthLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const json = await res.json();

      if (json.success) {
        setToken(json.token);
        setUserEmail(json.user.email);
        safeStorage.setItem("hamza_real_estate_token", json.token);
        safeStorage.setItem("hamza_real_estate_email", json.user.email);
        
        setAuthSuccess("🔑 Credentials verified! Admin session validated successfully.");
        showNotification("Welcome back, Administrator!", "success");
        
        // Immediate redirect to dashboard
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 1000);
      } else {
        setAuthError(json.message || "Invalid administrator email or password.");
      }
    } catch (err: any) {
      setAuthError("Auth connection failure: " + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setToken("");
    setUserEmail("");
    safeStorage.removeItem("hamza_real_estate_token");
    safeStorage.removeItem("hamza_real_estate_email");
    showNotification("Admin session terminated safely. Goodbye!", "info");
    navigate("/admin/login");
  };

  // Open property form in Add Mode
  const handleOpenAddMode = () => {
    setEditingId(null);
    setFormTitle("");
    setFormPrice("");
    setFormType("Sale");
    setFormCategory("House");
    setFormLocation("");
    setFormCity("");
    setFormBeds("");
    setFormBaths("");
    setFormArea("");
    setFormFeatured(false);
    setFormFeatures("");
    setFormDescription("");
    setFormImages(null);
    setFormVideo(null);
    
    setFormError("");
    setFormSuccess("");
    setIsFormOpen(true);
  };

  // Open property form in Edit Mode
  const handleOpenEditMode = (prop: PropertyType) => {
    if (!prop._id) return;
    setEditingId(prop._id);
    setFormTitle(prop.title);
    setFormPrice(prop.price);
    setFormType(prop.type);
    setFormCategory(prop.category);
    setFormLocation(prop.location);
    setFormCity(prop.city || "Sialkot");
    setFormBeds(prop.beds || "0");
    setFormBaths(prop.baths || "0");
    setFormArea(prop.area);
    setFormFeatured(prop.featured);
    setFormFeatures(prop.features ? prop.features.join(", ") : "");
    setFormDescription(prop.description);
    setFormImages(null);
    setFormVideo(null);

    setFormError("");
    setFormSuccess("");
    setIsFormOpen(true);
  };

  const uploadToCloudinary = async (file: File, resourceType: "image" | "video"): Promise<string> => {
    // Fetch dynamic Cloudinary configurations from the server
    let cloudName = "dphnh7jci";
    let uploadPreset = "hamza_realestate_unsigned";
    try {
      const configRes = await fetch("/api/config/cloudinary");
      if (configRes.ok) {
        const configData = await configRes.json();
        if (configData.cloudName) cloudName = configData.cloudName;
        if (configData.uploadPreset) uploadPreset = configData.uploadPreset;
      }
    } catch (err) {
      console.warn("⚠️ Failed to fetch dynamic Cloudinary config, using fallbacks:", err);
    }

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      const url = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      
      xhr.open("POST", url, true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(percentComplete);
        }
      };
      
      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          try {
            const response = JSON.parse(xhr.responseText);
            if (response.secure_url) {
              resolve(response.secure_url);
            } else {
              reject(new Error("Cloudinary response missing secure_url"));
            }
          } catch (e: any) {
            reject(new Error("Failed to parse Cloudinary response: " + e.message));
          }
        } else {
          reject(new Error(`Cloudinary responded with status ${xhr.status}: ${xhr.responseText}`));
        }
      };
      
      xhr.onerror = () => {
        reject(new Error("Network error during Cloudinary upload"));
      };
      
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      
      xhr.send(formData);
    });
  };

  const handlePropertyFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) {
      setFormError("Session token expired. Please re-authenticate as administrator.");
      return;
    }

    setFormLoading(true);
    setFormError("");
    setFormSuccess("");
    setUploadProgress(0);
    setUploadStatus("");

    try {
      const authHeaderValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      // 1. Direct browser upload for images if selected
      let uploadedImageUrls: string[] = [];
      if (formImages && formImages.length > 0) {
        for (let i = 0; i < formImages.length; i++) {
          setUploadProgress(0);
          setUploadStatus(`Uploading image ${i + 1} of ${formImages.length}...`);
          try {
            const url = await uploadToCloudinary(formImages[i], "image");
            uploadedImageUrls.push(url);
          } catch (uploadErr: any) {
            console.error(`❌ Image ${i + 1} direct upload failed:`, uploadErr);
            throw new Error(`Failed to upload image ${i + 1} directly to Cloudinary: ${uploadErr.message}`);
          }
        }
      }

      // 2. Direct browser upload for walkthrough video if selected
      let uploadedVideoUrl = "";
      if (formVideo && formVideo instanceof File) {
        setUploadProgress(0);
        setUploadStatus("Uploading walkthrough tour video...");
        try {
          uploadedVideoUrl = await uploadToCloudinary(formVideo, "video");
        } catch (uploadErr: any) {
          console.error("❌ Video direct upload failed:", uploadErr);
          throw new Error(`Failed to upload video directly to Cloudinary: ${uploadErr.message}`);
        }
      }

      // 3. Construct clean JSON payload
      const propertyPayload: any = {
        title: formTitle,
        description: formDescription,
        price: formPrice,
        type: formType,
        category: formCategory,
        location: formLocation,
        city: formCity,
        beds: formBeds,
        baths: formBaths,
        area: formArea,
        featured: formFeatured,
        features: formFeatures,
      };

      if (uploadedImageUrls.length > 0) {
        propertyPayload.image = uploadedImageUrls[0];
        propertyPayload.images = uploadedImageUrls;
        propertyPayload.gallery = uploadedImageUrls;
      }

      if (uploadedVideoUrl) {
        propertyPayload.video = uploadedVideoUrl;
      }

      const isEditing = !!editingId;
      const url = isEditing ? `/api/properties/${editingId}` : "/api/properties";
      const method = isEditing ? "PUT" : "POST";

      setUploadStatus("Saving property details to database...");
      setUploadProgress(95);

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeaderValue,
        },
        body: JSON.stringify(propertyPayload),
      });

      if (res.status === 401) {
        console.warn("Operation failed due to 401. Clearing stored token.");
        setToken("");
        setUserEmail("");
        safeStorage.removeItem("hamza_real_estate_token");
        safeStorage.removeItem("hamza_real_estate_email");
        showNotification("⚠️ Your session has expired or is invalid. Please login again.", "error");
        setIsFormOpen(false);
        navigate("/admin/login");
        return;
      }

      const json = await res.json();

      if (json.success) {
        showNotification(
          isEditing 
            ? "Property record successfully modified in database cluster!" 
            : "New property listing published successfully!", 
          "success"
        );
        setIsFormOpen(false);
        fetchProperties();
      } else {
        setFormError(json.message || "Upload process returned validation failure state.");
      }
    } catch (err: any) {
      console.error("❌ Form submit failed:", err);
      setFormError("Asset upload/saving failed: " + err.message);
    } finally {
      setFormLoading(false);
      setUploadProgress(0);
      setUploadStatus("");
    }
  };

  const handleDeleteProperty = async (id: string | number) => {
    if (!token) {
      showNotification("Permission denied. Admin authorization token mandatory.", "error");
      return;
    }

    try {
      const authHeaderValue = token.startsWith("Bearer ") ? token : `Bearer ${token}`;
      console.log(`[DELETE Listing] Initiating call for property ${id} with token prefix:`, authHeaderValue.substring(0, 15) + "...");
      
      const res = await fetch(`/api/properties/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: authHeaderValue,
        },
      });
      
      if (res.status === 401) {
        console.warn("Operation failed due to 401. Clearing stored token.");
        setToken("");
        setUserEmail("");
        safeStorage.removeItem("hamza_real_estate_token");
        safeStorage.removeItem("hamza_real_estate_email");
        showNotification("⚠️ Your session has expired or is invalid. Please login again.", "error");
        navigate("/admin/login");
        return;
      }
      
      const json = await res.json();
      
      if (json.success) {
        showNotification("Property listing deleted successfully.", "success");
        fetchProperties();
      } else {
        showNotification("Deletion rejected by cluster server: " + json.message, "error");
      }
    } catch (err: any) {
      showNotification("Network server deletion call aborted: " + err.message, "error");
    } finally {
      setDeleteConfirmId(null);
    }
  };

  // Helper properties to render default thumbnails
  const placeholderHomeImage = "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop";

  // Intelligent client-side real estate parser & filtering matrix
  const filteredPropertiesList = properties.filter((prop) => {
    // 1. City / Location filter
    if (filterCity) {
      const cityLower = (prop.city || "").toLowerCase();
      const locLower = (prop.location || "").toLowerCase();
      const query = filterCity.toLowerCase();
      if (!cityLower.includes(query) && !locLower.includes(query)) {
        return false;
      }
    }

    // 2. Price Range filter supporting lakhs, crores, lac, cr
    if (filterPriceRange) {
      const parsePrice = (priceStr: string): number => {
        const cleaned = priceStr.replace(/[^0-9.]/g, "");
        const val = parseFloat(cleaned) || 0;
        const lower = priceStr.toLowerCase();
        if (lower.includes("lakh") || lower.includes("lac") || lower.includes("lcs")) {
          return val * 100000;
        }
        if (lower.includes("crore") || lower.includes("cr")) {
          return val * 10000000;
        }
        // if raw large values
        if (val < 100000) return val * 100000; // auto format minor values
        return val;
      };

      const priceNum = parsePrice(prop.price);
      if (filterPriceRange === "under-50l") {
        if (priceNum > 5000000) return false;
      } else if (filterPriceRange === "50l-1c") {
        if (priceNum < 5000000 || priceNum > 10000000) return false;
      } else if (filterPriceRange === "1c-3c") {
        if (priceNum < 10000000 || priceNum > 30000000) return false;
      } else if (filterPriceRange === "over-3c") {
        if (priceNum < 30000000) return false;
      }
    }

    // 3. Property Size / Area filter (supporting Marla, Kanal formats)
    if (filterSize) {
      const areaLower = (prop.area || "").toLowerCase();
      const numVal = parseFloat(areaLower) || 0;
      
      if (filterSize === "under-5m") {
        if (areaLower.includes("kanal")) return false;
        if (areaLower.includes("marla") && numVal > 5) return false;
      } else if (filterSize === "5-10m") {
        if (areaLower.includes("kanal")) return false;
        if (areaLower.includes("marla") && (numVal < 5 || numVal > 10)) return false;
      } else if (filterSize === "10-20m") {
        if (areaLower.includes("kanal")) return false;
        if (areaLower.includes("marla") && (numVal < 10 || numVal > 20)) return false;
      } else if (filterSize === "over-1k") {
        if (!areaLower.includes("kanal") && !(areaLower.includes("marla") && numVal >= 20)) return false;
      }
    }

    return true;
  });

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#050913] text-gray-100 font-sans selection:bg-gold selection:text-navy">
      
      {/* Dynamic Pop-up Toast Notifications */}
      {globalNotification && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-xl max-w-md animate-bounce ${
          globalNotification.type === "success" 
            ? "bg-slate-900/95 border-emerald-500/50 text-emerald-400" 
            : globalNotification.type === "error"
            ? "bg-slate-900/95 border-red-500/50 text-red-400"
            : "bg-slate-900/95 border-gold/50 text-gold"
        }`}>
          <div className="text-sm font-semibold tracking-wide">
            {globalNotification.message}
          </div>
          <button onClick={() => setGlobalNotification(null)} className="text-gray-400 hover:text-white transition-colors ml-auto">
            <X size={15} />
          </button>
        </div>
      )}

      {/* Custom React-based Delete Confirmation Dialog Modal */}
      {deleteConfirmId && (
        <div id="delete-confirmation-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div id="delete-confirmation-card" className="w-full max-w-md bg-[#0b1329] border border-red-500/30 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-start gap-4">
              <div className="bg-red-500/10 p-3 rounded-xl border border-red-500/20 text-red-400">
                <Trash2 size={24} />
              </div>
              <div className="space-y-1.5 flex-1">
                <h3 className="text-lg font-bold text-white tracking-tight">Confirm Deletion</h3>
                <p className="text-sm text-gray-400 leading-relaxed">
                  Are you sure you want to permanently delete this property listing? This action cannot be undone and will immediately sync with the database.
                </p>
                <div className="text-xs bg-black/30 p-2.5 rounded-lg border border-white/5 font-mono text-gray-500 break-all select-all mt-2">
                  ID: {deleteConfirmId}
                </div>
              </div>
            </div>
            
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                id="delete-cancel-btn"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border border-white/10 hover:border-white/20 hover:bg-white/5 rounded-xl text-sm font-medium text-gray-300 transition-colors cursor-pointer"
              >
                Cancel Action
              </button>
              <button
                id="delete-confirm-btn"
                onClick={() => handleDeleteProperty(deleteConfirmId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-500 hover:shadow-[0_0_12px_rgba(239,68,68,0.4)] active:scale-95 rounded-xl text-sm font-bold text-white transition-all cursor-pointer"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Top Header Navigation Panel */}
      <header className="sticky top-0 z-40 bg-navy bg-opacity-95 backdrop-blur-md border-b border-white border-opacity-5 py-4 px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Logo Brand Title */}
          <div onClick={() => navigate("/")} className="cursor-pointer flex items-center gap-2 group">
            <HNLogo className="h-10 md:h-12 w-auto transition-transform duration-300 group-hover:scale-105" />
            <div className="flex flex-col border-l border-white/10 pl-3">
              <h1 className="text-base md:text-lg font-black tracking-widest text-white uppercase leading-none">
                HAMZA <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold">NASEER</span>
              </h1>
              <p className="text-[9px] tracking-widest text-gray-400 font-medium uppercase mt-1">Trusted Real Estate Partner</p>
            </div>
          </div>

          {/* Action Links & Active Operators indicators */}
          <nav className="flex items-center gap-6">
            <button 
              onClick={() => navigate("/")} 
              className={`text-sm font-medium transition-all ${currentPath === "/" ? "text-gold underline underline-offset-8" : "text-gray-300 hover:text-white"}`}
            >
              Public Catalog
            </button>

            {token ? (
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate("/admin/dashboard")} 
                  className={`text-sm font-semibold flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${currentPath === "/admin/dashboard" ? "bg-gold/10 text-gold border border-gold/20" : "text-gray-300 hover:text-white"}`}
                >
                  <LayoutDashboard size={14} />
                  <span>Dashboard</span>
                </button>
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-[11px] text-gray-400 font-bold uppercase">Authorized Operator</span>
                  <span className="text-[10px] text-emerald-400 font-mono italic max-w-[140px] truncate">{userEmail}</span>
                </div>
                <button 
                  onClick={handleLogout} 
                  title="Logout Operator Session"
                  className="bg-transparent text-gray-400 hover:text-red-400 p-2.5 rounded-lg transition-all hover:bg-white/5 active:scale-95 border border-transparent hover:border-red-400/20"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate("/admin/login")} 
                className={`text-sm font-semibold flex items-center gap-2 px-4 py-2 rounded-lg border transition-all ${currentPath === "/admin/login" ? "bg-gold text-navy border-gold" : "border-gold/30 text-gold hover:bg-gold/10 hover:border-gold"}`}
              >
                <Lock size={14} />
                <span>Admin Login</span>
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* Main Container Content */}
      <main className="flex-grow">
        
        {/* Dynamic View Route #1: Public Catalog Portal */}
        {currentPath === "/" && (
          <div className="space-y-24 pb-24 bg-slate-950">
            
            {/* Elegant Hero Welcome Section */}
            <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-slate-950 py-24 px-6 text-center">
              
              {/* Background Luxury Architectural Image with Subtle Parallax and Zoom */}
              <div className="absolute inset-0 z-0 overflow-hidden">
                <img 
                  src={luxuryHeroBg} 
                  alt="Premium Real Estate Headquarters" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover origin-center brightness-105 contrast-105 saturate-105 transition-transform duration-300 ease-out"
                  style={{ 
                    transform: `translateY(${scrollY * 0.12}px) scale(${1.05 + scrollY * 0.0001})`,
                    willChange: "transform"
                  }}
                />
                
                {/* Precise Dark Luxury Overlay (40-50% for high contrast readability) */}
                <div className="absolute inset-0 bg-slate-950/45 mix-blend-multiply z-10"></div>
                
                {/* Radial Glass Gradient & Bottom Blend to slate-950 */}
                <div className="absolute inset-0 bg-gradient-to-b from-[#060b18]/65 via-slate-950/50 to-slate-950 z-10"></div>
                
                {/* Floating Soft Ambient Gold Lighting Aura */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-[450px] h-[450px] rounded-full bg-gold/10 blur-[130px] pointer-events-none animate-pulse"></div>
              </div>
              
              {/* Animated Content Wrapper */}
              <motion.div 
                initial={{ opacity: 0, y: 35 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
                className="relative z-20 max-w-5xl mx-auto space-y-8"
              >
                {/* Floating Glassmorphic Trust Badge with Sliding Reflection Sheen */}
                <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-gold text-xs font-black uppercase tracking-widest backdrop-blur-md shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] relative overflow-hidden group">
                  <Star size={13} className="fill-gold animate-pulse" />
                  <span>Premium Properties in Sialkot</span>
                  <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-in-out"></span>
                </div>
                
                {/* Main Heading & Subtitle with Gold Soft Glow */}
                <h2 className="text-4xl md:text-7xl lg:text-8xl font-black tracking-tight text-white leading-tight">
                  Find Your <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold drop-shadow-xl filter saturate-110">
                    Perfect Property
                  </span>
                </h2>
                
                <p className="text-gray-200 text-sm md:text-xl max-w-3xl mx-auto font-light leading-relaxed drop-shadow-md">
                  Buy, Sell, and Rent Houses, Plots, Shops, and Commercial Properties with Confidence.
                </p>

                {/* Hero Primary Actions with Premium Styling and Glass Refraction */}
                <div className="flex flex-wrap items-center justify-center gap-5 pt-4">
                  <a
                    href="#catalog-grid"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("catalog-grid")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="relative px-8 py-4 bg-gradient-to-r from-gold via-gold-light to-gold hover:from-gold-light hover:to-gold-dark text-slate-950 text-sm font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-gold/20 hover:shadow-gold/40 active:scale-95 duration-200 overflow-hidden group cursor-pointer"
                  >
                    <span className="relative z-10">Explore Properties</span>
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 ease-in-out"></span>
                  </a>
                  <a
                    href="#contact-section"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
                    }}
                    className="relative px-8 py-4 border border-white/10 hover:border-gold/35 bg-white/5 hover:bg-white/10 backdrop-blur-md text-white hover:text-gold text-sm font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 duration-200 overflow-hidden group cursor-pointer"
                  >
                    <span className="relative z-10">Contact Us</span>
                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-1000 ease-in-out"></span>
                  </a>
                </div>

                {/* DB Telemetry State Badge (Humble standard indicator) */}
                <div className="inline-flex items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-slate-900/70 border border-white/5 backdrop-blur-md text-xs text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${health?.database === "Connected" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"}`}></span>
                  <span>Database Status: <strong className="text-gray-200">{health?.database || "Connected Securely"}</strong></span>
                  {allProperties.length > 0 && (
                    <>
                      <span className="text-gray-600">|</span>
                      <span><strong className="text-gold font-bold">{allProperties.length}</strong> verified listings active</span>
                    </>
                  )}
                </div>
              </motion.div>
            </section>

            {/* Property Categories Section */}
            <section className="max-w-7xl mx-auto px-6 scroll-mt-24">
              <div className="text-center space-y-3 mb-12">
                <div className="inline-flex p-3 rounded-2xl bg-gold/5 border border-gold/10 text-gold mb-1">
                  <Layers size={24} />
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider">Browse By Category</h3>
                <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                  Click on any category below to instantly find the perfect property that fits your needs.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { key: "House", label: "Houses & Villas", icon: <Home size={22} />, desc: "Ready to move in" },
                  { key: "Plot", label: "Plots & Land", icon: <MapPin size={22} />, desc: "Build your dream" },
                  { key: "Apartment", label: "Apartments", icon: <Building size={22} />, desc: "Modern flat living" },
                  { key: "Commercial", label: "Shops & Commercial", icon: <Compass size={22} />, desc: "Business properties" },
                  { key: "School", label: "Educational", icon: <Award size={22} />, desc: "School & college sites" },
                  { key: "Hospital", label: "Healthcare", icon: <ShieldCheck size={22} />, desc: "Clinics & labs" }
                ].map((cat) => (
                  <button
                    key={cat.key}
                    onClick={() => {
                      setFilterCategory(cat.key);
                      setTimeout(() => {
                        document.getElementById("catalog-grid")?.scrollIntoView({ behavior: "smooth" });
                      }, 100);
                    }}
                    className={`p-6 rounded-2xl text-center border transition-all duration-300 flex flex-col items-center justify-between gap-4 cursor-pointer group ${
                      filterCategory === cat.key 
                        ? "bg-gradient-to-b from-gold/15 to-gold/5 border-gold shadow-[0_4px_20px_rgba(201,168,76,0.15)]" 
                        : "bg-slate-900/30 border-white/5 hover:border-gold/30 hover:bg-slate-900/60"
                    }`}
                  >
                    <div className={`p-3 rounded-xl transition-colors duration-300 ${
                      filterCategory === cat.key 
                        ? "bg-gold text-slate-950" 
                        : "bg-slate-950 text-gold group-hover:bg-gold group-hover:text-slate-950"
                    }`}>
                      {cat.icon}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-100 group-hover:text-gold transition-colors">{cat.label}</h4>
                      <p className="text-[10px] text-gray-500 mt-1">{cat.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            {/* Featured Properties Section */}
            {allProperties.filter(p => p.featured).length > 0 && (
              <section className="max-w-7xl mx-auto px-6">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-white/5 pb-6">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-gold">
                      <Sparkles size={16} />
                      <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Premium Handpicked Deals</span>
                    </div>
                    <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider">Featured Properties</h3>
                    <p className="text-sm text-gray-400 max-w-lg leading-relaxed">
                      Our most recommended properties with prime location and premium features
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 font-mono">
                    Showing <span className="text-gold font-bold">{allProperties.filter(p => p.featured).length}</span> handpicked assets
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {allProperties.filter(p => p.featured).slice(0, 3).map((prop) => (
                    <article 
                      key={prop._id || prop.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-gradient-to-b from-[#0c1328]/90 to-slate-950 border border-gold/30 hover:border-gold transition-all duration-300 hover:-translate-y-1 shadow-xl shadow-black/40 relative"
                    >
                      {/* Premium Featured Tag */}
                      <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-gold to-gold-dark text-slate-950 text-[10px] font-black tracking-widest px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1">
                        <Star size={11} className="fill-slate-950" /> FEATURED
                      </div>

                      {/* Media Image container */}
                      <div className="relative aspect-video overflow-hidden bg-slate-950">
                        <img 
                          src={prop.image || prop.images?.[0] || placeholderHomeImage} 
                          alt={prop.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderHomeImage;
                          }}
                        />
                        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-md text-gold text-[11px] font-bold px-3 py-1 rounded-lg border border-gold/20">
                          {prop.area}
                        </div>
                      </div>

                      {/* Info Panel */}
                      <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-gold/10 text-gold border border-gold/20">
                              For {prop.type}
                            </span>
                            <span className="text-xs text-gray-400 font-medium">
                              {prop.category}
                            </span>
                          </div>

                          <h4 className="text-lg font-bold text-gray-100 group-hover:text-gold transition-colors line-clamp-1">
                            {prop.title}
                          </h4>

                          <div className="flex items-center text-xs text-gray-400 gap-1.5">
                            <MapPin size={13} className="text-gold" />
                            <span className="truncate">{prop.location}, {prop.city}</span>
                          </div>

                          <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-2 pt-1">
                            {prop.description}
                          </p>
                        </div>

                        {/* Specs and actions */}
                        <div className="pt-4 border-t border-white/5 space-y-4">
                          <div className="flex items-center justify-between text-xs text-gray-400 font-mono">
                            <span className="text-lg font-black text-gold">{prop.price}</span>
                            <div className="flex items-center gap-3">
                              {prop.beds && (
                                <span className="flex items-center gap-1"><Bed size={13} className="text-gold" /> {prop.beds}</span>
                              )}
                              {prop.baths && (
                                <span className="flex items-center gap-1"><Bath size={13} className="text-gold" /> {prop.baths}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedPropertyDetails(prop);
                                setModalActiveImageIdx(0);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-gradient-to-r from-gold to-gold-dark hover:opacity-95 text-slate-950 rounded-xl transition-all text-xs tracking-wider font-extrabold cursor-pointer duration-200 shadow-sm"
                            >
                              <Eye size={13} /> See Details
                            </button>
                            <button
                              onClick={() => toggleSaveProperty(String(prop._id || prop.id || ""))}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                savedPropertyIds.includes(String(prop._id || prop.id || "")) 
                                  ? "bg-gold/10 border-gold text-gold" 
                                  : "border-white/10 text-gray-400 hover:border-gold/30 hover:text-white"
                              }`}
                              title="Save Property"
                            >
                              <Heart size={15} className={savedPropertyIds.includes(String(prop._id || prop.id || "")) ? "fill-gold" : ""} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            )}

            {/* Simple Trust Section / Why Choose US */}
            <section className="bg-slate-900/30 border-y border-white/5 py-20 px-6">
              <div className="max-w-7xl mx-auto">
                <div className="text-center space-y-3 mb-16">
                  <div className="inline-flex p-3 rounded-2xl bg-gold/5 border border-gold/10 text-gold mb-1">
                    <ShieldCheck size={24} />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
                    <span>Why Choose</span>
                    <HNLogo className="h-10 md:h-14 w-auto inline-block align-middle" />
                    <span>Real Estate</span>
                  </h3>
                  <p className="text-sm text-gray-400 max-w-xl mx-auto leading-relaxed">
                    We keep things simple, transparent, and honest so you can buy, sell, or rent with absolute peace of mind.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                  {[
                    { title: "Verified Properties", desc: "We check government records, files, and ownership of every property before listing so you are always safe." },
                    { title: "Honest Guidance", desc: "No hidden charges, no complicated jargon, and no false promises. We tell you the direct owner facts." },
                    { title: "Trusted Service", desc: "Years of professional, dedicated service helping hundreds of families buy their homes with total trust." },
                    { title: "Easy Process", desc: "We do all the hard paperwork, registration, and file transfers for you. You just relax and get your keys." },
                    { title: "Fast Response", desc: "Our friendly team is always active. We reply to your WhatsApp messages, calls, and questions in minutes." }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className="p-6 rounded-2xl bg-slate-950/40 border border-white/5 hover:border-gold/30 transition-all duration-300 space-y-4 text-center group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gold/10 border border-gold/20 text-gold flex items-center justify-center mx-auto transition-transform duration-300 group-hover:scale-110">
                        {idx === 0 && <ShieldCheck size={20} />}
                        {idx === 1 && <Compass size={20} />}
                        {idx === 2 && <Star size={20} className="fill-gold/10" />}
                        {idx === 3 && <Layers size={20} />}
                        {idx === 4 && <Phone size={20} />}
                      </div>
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">{item.title}</h4>
                      <p className="text-xs text-gray-400 leading-relaxed font-light">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Latest Properties / Search Grid Section */}
            <section id="catalog-grid" className="max-w-7xl mx-auto px-6 space-y-12 scroll-mt-24">
              
              <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-white/5 pb-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gold">
                    <Building size={16} />
                    <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Interactive Live Catalog</span>
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider">Latest Properties</h3>
                  <p className="text-sm text-gray-400 max-w-lg leading-relaxed">
                    Browse our latest verified property listings across Sialkot — houses, plots, shops, clinics and more.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400 bg-slate-900/40 px-4 py-2.5 rounded-xl border border-white/5">
                  <span>Currently Filtered:</span>
                  <strong className="text-gold font-mono">{filteredPropertiesList.length} listings</strong>
                </div>
              </div>

              {/* Dynamic Luxury Filter / Search Panel */}
              <div className="p-6 rounded-2xl bg-gradient-to-b from-slate-900/60 to-slate-950 border border-white/5 space-y-4 shadow-xl shadow-black/20">
                
                {/* Search Term Text Input */}
                <div className="relative flex items-center">
                  <Search size={18} className="absolute left-4 text-gray-400" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Type to search e.g. '5 marla modern house Sialkot'..."
                    className="w-full bg-slate-950 text-sm text-gray-100 rounded-xl pl-12 pr-16 py-4 border border-white/5 focus:border-gold outline-none transition-all placeholder:text-gray-500"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")} 
                      className="absolute right-4 text-gray-400 hover:text-white text-xs cursor-pointer font-bold"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Grid of Interactive Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                  
                  {/* Filter Selector Type (Buy or Rent) */}
                  <div className="relative flex items-center">
                    <Filter size={15} className="absolute left-4 text-gold" />
                    <select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-gray-300 rounded-xl pl-10 pr-4 py-3.5 border border-white/5 focus:border-gold outline-none appearance-none cursor-pointer font-semibold"
                    >
                      <option value="">Buy or Rent (All)</option>
                      <option value="Sale">Buy / Sale Only</option>
                      <option value="Rent">Rent Only</option>
                    </select>
                  </div>

                  {/* Filter Category type (Property Type) */}
                  <div className="relative flex items-center">
                    <Home size={15} className="absolute left-4 text-gold" />
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-gray-300 rounded-xl pl-10 pr-4 py-3.5 border border-white/5 focus:border-gold outline-none appearance-none cursor-pointer font-semibold"
                    >
                      <option value="">Property Type (All)</option>
                      <option value="House">Houses & Villas</option>
                      <option value="Plot">Plots & Land</option>
                      <option value="Apartment">Apartments</option>
                      <option value="Commercial">Commercial Sites</option>
                      <option value="School">Schools & Colleges</option>
                      <option value="Hospital">Hospitals & Clinics</option>
                    </select>
                  </div>

                  {/* Filter City / Area */}
                  <div className="relative flex items-center">
                    <MapPin size={15} className="absolute left-4 text-gold" />
                    <select
                      value={filterCity}
                      onChange={(e) => setFilterCity(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-gray-300 rounded-xl pl-10 pr-4 py-3.5 border border-white/5 focus:border-gold outline-none appearance-none cursor-pointer font-semibold"
                    >
                      <option value="">City / Area (All)</option>
                      <option value="Sialkot">Sialkot</option>
                      <option value="Aminabad">Aminabad Road</option>
                      <option value="Punjab">Punjab Region</option>
                      <option value="Lahore">Lahore</option>
                      <option value="Islamabad">Islamabad</option>
                    </select>
                  </div>

                  {/* Filter Price Range */}
                  <div className="relative flex items-center">
                    <Sparkles size={15} className="absolute left-4 text-gold" />
                    <select
                      value={filterPriceRange}
                      onChange={(e) => setFilterPriceRange(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-gray-300 rounded-xl pl-10 pr-4 py-3.5 border border-white/5 focus:border-gold outline-none appearance-none cursor-pointer font-semibold"
                    >
                      <option value="">Price Range (All)</option>
                      <option value="under-50l">Under 50 Lakh (50 Lacs)</option>
                      <option value="50l-1c">50 Lakh to 1 Crore</option>
                      <option value="1c-3c">1 Crore to 3 Crore</option>
                      <option value="over-3c">Over 3 Crore</option>
                    </select>
                  </div>

                  {/* Filter Size */}
                  <div className="relative flex items-center">
                    <Maximize size={15} className="absolute left-4 text-gold" />
                    <select
                      value={filterSize}
                      onChange={(e) => setFilterSize(e.target.value)}
                      className="w-full bg-slate-950 text-xs text-gray-300 rounded-xl pl-10 pr-4 py-3.5 border border-white/5 focus:border-gold outline-none appearance-none cursor-pointer font-semibold"
                    >
                      <option value="">Property Size (All)</option>
                      <option value="under-5m">Under 5 Marla</option>
                      <option value="5-10m">5 to 10 Marla</option>
                      <option value="10-20m">10 to 20 Marla</option>
                      <option value="over-1k">1 Kanal or Larger</option>
                    </select>
                  </div>

                </div>

                {/* Reset button inside filters */}
                {(searchQuery || filterType || filterCategory || filterCity || filterPriceRange || filterSize) && (
                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => {
                        setSearchQuery("");
                        setFilterType("");
                        setFilterCategory("");
                        setFilterCity("");
                        setFilterPriceRange("");
                        setFilterSize("");
                        showNotification("Cleared all search filters.", "info");
                      }}
                      className="text-xs text-gold border border-gold/20 hover:border-gold/50 bg-gold/5 hover:bg-gold/10 px-4 py-2 rounded-xl transition-all cursor-pointer font-bold"
                    >
                      Reset All Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Listings Render State */}
              {listingsLoading ? (
                <div className="flex flex-col items-center justify-center py-24 space-y-4">
                  <div className="relative w-12 h-12 flex items-center justify-center">
                    <div className="w-full h-full rounded-full border-4 border-gold/10 border-t-gold animate-spin"></div>
                  </div>
                  <p className="text-sm text-gray-400 font-mono tracking-wider animate-pulse uppercase">Searching Listings...</p>
                </div>
              ) : filteredPropertiesList.length === 0 ? (
                <div className="text-center py-20 bg-slate-900/10 border border-white/5 rounded-3xl space-y-4">
                  <div className="text-4xl">🏡🔍</div>
                  <h3 className="text-lg font-bold text-gray-200">No matching property records found</h3>
                  <p className="text-xs text-gray-500 max-w-md mx-auto">
                    Try changing your search terms or choosing another category, city, or price.
                  </p>
                  <button 
                    onClick={() => { 
                      setSearchQuery(""); 
                      setFilterCategory(""); 
                      setFilterType(""); 
                      setFilterCity(""); 
                      setFilterPriceRange(""); 
                      setFilterSize(""); 
                    }}
                    className="bg-transparent border border-gold/40 text-gold text-xs px-5 py-2 hover:bg-gold/10 rounded-xl transition-all uppercase tracking-wide font-bold"
                  >
                    Reset Grid Filters
                  </button>
                </div>
              ) : (
                
                /* Redesigned Premium Cards Portfolio Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPropertiesList.map((prop) => (
                    <article 
                      key={prop._id || prop.id}
                      className="group flex flex-col justify-between overflow-hidden rounded-2xl bg-slate-900/30 border border-white/5 hover:border-gold/30 transition-all duration-300 hover:bg-slate-900/50 hover:-translate-y-1 shadow-lg shadow-black/30"
                    >
                      {/* Media Cover image container */}
                      <div className="relative aspect-video overflow-hidden bg-slate-950">
                        <img 
                          src={prop.image || prop.images?.[0] || placeholderHomeImage} 
                          alt={prop.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-all duration-500"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = placeholderHomeImage;
                          }}
                        />

                        {/* Top floaters */}
                        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                          <span className="text-[10px] font-black tracking-widest px-2.5 py-1 rounded bg-slate-950 border border-gold/30 text-gold shadow-md">
                            FOR {prop.type.toUpperCase()}
                          </span>
                          <span className="text-[10px] font-bold tracking-wider px-2.5 py-1 rounded bg-black/75 text-gray-200 backdrop-blur-sm border border-white/5">
                            {prop.category}
                          </span>
                        </div>

                        {prop.featured && (
                          <div className="absolute top-3 right-3 bg-gradient-to-r from-gold to-gold-dark p-1.5 rounded-lg text-slate-950 shadow-md" title="Premium Featured Listing">
                            <Star size={12} className="fill-slate-950" />
                          </div>
                        )}

                        <div className="absolute bottom-3 left-3 bg-slate-950/80 backdrop-blur-sm text-white text-[11px] font-bold px-3 py-1 rounded-lg border border-white/10">
                          {prop.area}
                        </div>
                      </div>

                      {/* Info Frame Panel */}
                      <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                        <div className="space-y-2">
                          
                          {/* Price Tag */}
                          <div className="text-2xl font-black text-gold">
                            {prop.price}
                          </div>

                          {/* Title with max chars */}
                          <h3 className="text-lg font-bold text-gray-100 group-hover:text-gold transition-colors line-clamp-1">
                            {prop.title}
                          </h3>

                          {/* Address / Location */}
                          <div className="flex items-center text-xs text-gray-400 gap-1.5">
                            <MapPin size={13} className="text-gold" />
                            <span className="truncate">{prop.location}, {prop.city}</span>
                          </div>

                          {/* Excerpt */}
                          <p className="text-xs text-gray-400 font-light leading-relaxed line-clamp-2 pt-1">
                            {prop.description}
                          </p>
                        </div>

                        {/* Attribute Badges Grid */}
                        <div className="pt-4 border-t border-white/5 space-y-4">
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <div className="flex items-center gap-1.5" title="Beds">
                              <Bed size={13} className="text-gold" />
                              <span>{prop.beds || "-"} Beds</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Bathrooms">
                              <Bath size={13} className="text-gold" />
                              <span>{prop.baths || "-"} Baths</span>
                            </div>
                            <div className="flex items-center gap-1.5" title="Area">
                              <Maximize size={13} className="text-gold" />
                              <span>{prop.area}</span>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedPropertyDetails(prop);
                                setModalActiveImageIdx(0);
                              }}
                              className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-slate-900/80 hover:bg-gold hover:text-slate-950 text-gold border border-gold/30 hover:border-gold rounded-xl transition-all text-xs tracking-wider font-extrabold cursor-pointer duration-200"
                            >
                              <Eye size={13} />
                              <span>See Details</span>
                            </button>
                            <button
                              onClick={() => toggleSaveProperty(String(prop._id || prop.id || ""))}
                              className={`p-3 rounded-xl border transition-all cursor-pointer ${
                                savedPropertyIds.includes(String(prop._id || prop.id || "")) 
                                  ? "bg-gold/10 border-gold text-gold" 
                                  : "border-white/10 text-gray-400 hover:border-gold/30 hover:text-white"
                              }`}
                              title="Save Property"
                            >
                              <Heart size={15} className={savedPropertyIds.includes(String(prop._id || prop.id || "")) ? "fill-gold" : ""} />
                            </button>
                          </div>
                        </div>

                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>

            {/* Customer Reviews Section */}
            <section className="bg-slate-900/30 border-y border-white/5 py-20 px-6">
              <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-3">
                  <div className="inline-flex p-3 rounded-2xl bg-gold/5 border border-gold/10 text-gold mb-1">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider">What Our Clients Say</h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
                    Real words from real people we have helped. We work honestly to make everyone happy.
                  </p>
                </div>

                <div className="relative bg-slate-950/65 border border-white/5 rounded-3xl p-8 md:p-12 shadow-xl">
                  {/* Quotes mark decorator */}
                  <span className="absolute top-6 left-6 text-6xl text-gold/10 font-serif pointer-events-none select-none">“</span>
                  
                  {/* Reviews carousel active item */}
                  {reviewsList.map((review, idx) => idx === activeReviewIdx && (
                    <div key={idx} className="space-y-6 animate-fade-in text-center md:text-left">
                      <p className="text-sm md:text-lg text-gray-200 leading-relaxed font-light italic">
                        "{review.text}"
                      </p>
                      
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-4 border-t border-white/5">
                        <div>
                          <h4 className="font-bold text-white text-sm md:text-base">{review.author}</h4>
                          <p className="text-xs text-gray-500">{review.location}</p>
                        </div>
                        <div className="flex items-center justify-center gap-1 text-gold">
                          {Array.from({ length: 5 }).map((_, rIdx) => (
                            <Star 
                              key={rIdx} 
                              size={13} 
                              className={rIdx < (review.rating || 5) ? "fill-gold text-gold" : "text-gray-600"} 
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Carousel Indicators */}
                  <div className="flex items-center justify-center gap-2.5 mt-8">
                    {reviewsList.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveReviewIdx(idx)}
                        className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${activeReviewIdx === idx ? "bg-gold w-6" : "bg-white/10 hover:bg-white/30"}`}
                        title={`Go to review ${idx + 1}`}
                      ></button>
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* Contact Us Section & Map */}
            <section id="contact-section" className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 scroll-mt-24">
              
              {/* Contact Coordinate Columns */}
              <div className="lg:col-span-5 space-y-8">
                <div className="space-y-3">
                  <div className="inline-flex p-3 rounded-2xl bg-gold/5 border border-gold/10 text-gold mb-1">
                    <Phone size={24} />
                  </div>
                  <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider">Need Help?</h3>
                  <p className="text-sm text-gray-400 leading-relaxed font-light">
                    Our team is ready to assist you. Feel free to contact us anytime for premium property insights.
                  </p>
                </div>

                {/* Info Blocks - Premium Luxury Design Cards */}
                <div className="space-y-4 pt-2">
                  {/* Hamza Naseer Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0c1220] border border-white/10 hover:border-gold/30 transition-all duration-300 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none group-hover:bg-gold/10 transition-all duration-500"></div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gold">
                          <span className="text-lg">📱</span>
                          <span className="text-xs font-black uppercase tracking-widest">Owner Contact</span>
                        </div>
                        <h4 className="text-lg font-black text-white">Hamza Naseer</h4>
                        <p className="text-[10px] text-gold/80 font-bold uppercase tracking-wider">WhatsApp Only</p>
                        <a 
                          href="https://wa.me/923480177950" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-sm font-bold text-white hover:text-gold transition-colors block mt-2 font-mono"
                        >
                          📱 WhatsApp: 0348-0177950
                        </a>
                      </div>
                      <a 
                        href="https://wa.me/923480177950" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center cursor-pointer active:scale-95 self-center"
                        title="Chat on WhatsApp"
                      >
                        <MessageSquare size={18} className="fill-emerald-400/10" />
                      </a>
                    </div>
                  </div>

                  {/* Naseer Ahmad Card */}
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-[#0c1220] border border-white/10 hover:border-gold/30 transition-all duration-300 shadow-xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gold/5 rounded-full blur-2xl pointer-events-none group-hover:bg-gold/10 transition-all duration-500"></div>
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-gold">
                          <span className="text-lg">📞</span>
                          <span className="text-xs font-black uppercase tracking-widest">Senior Partner</span>
                        </div>
                        <h4 className="text-lg font-black text-white">Naseer Ahmad</h4>
                        <p className="text-[10px] text-gray-400 font-medium">Call & WhatsApp</p>
                        <a 
                          href="tel:+923338678460" 
                          className="text-sm font-bold text-white hover:text-gold transition-colors block mt-2 font-mono"
                        >
                          📞 Call / WhatsApp: 0333-8678460
                        </a>
                      </div>
                      <div className="flex gap-2 self-center">
                        <a 
                          href="tel:+923338678460" 
                          className="p-3 bg-gold/10 hover:bg-gold/20 text-gold rounded-xl border border-gold/20 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                          title="Call Naseer Ahmad"
                        >
                          <Phone size={16} />
                        </a>
                        <a 
                          href="https://wa.me/923338678460" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/20 transition-all flex items-center justify-center cursor-pointer active:scale-95"
                          title="Chat with Naseer Ahmad"
                        >
                          <MessageSquare size={16} className="fill-emerald-400/10" />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Email & Location Summary */}
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold font-mono">Email Address</span>
                      <a href="mailto:hamzanaseer3232@gmail.com" className="text-xs font-bold text-white hover:text-gold transition-colors block font-mono">hamzanaseer3232@gmail.com</a>
                    </div>
                    <div className="p-4 rounded-xl bg-slate-900/30 border border-white/5 space-y-1">
                      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold font-mono">Office Address</span>
                      <p className="text-xs font-bold text-white leading-tight">Aminabad Road, Sialkot</p>
                    </div>
                  </div>
                </div>

                {/* Location Map Mockup */}
                <div className="p-5 rounded-2xl bg-slate-900/40 border border-white/5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gold">
                      <Map size={15} />
                      <span className="text-[10px] uppercase font-bold tracking-widest font-mono">Office Map Coordinates</span>
                    </div>
                    <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded font-mono">Sialkot Hub</span>
                  </div>
                  <div className="relative aspect-[21/9] rounded-xl overflow-hidden bg-slate-950 border border-white/5 flex items-center justify-center text-center p-4">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#c9a84c_1px,transparent_1px)] [background-size:16px_16px]"></div>
                    <div className="space-y-1 z-10">
                      <p className="text-xs font-bold text-white flex items-center justify-center gap-1">
                        <MapPin size={12} className="text-gold animate-bounce" /> Aminabad Road Office
                      </p>
                      <p className="text-[10px] text-gray-500">Sialkot Cantonment Region, Punjab</p>
                    </div>
                  </div>
                  <p className="text-[11px] text-gray-400 leading-relaxed">
                    Our central listing office is located right on main Aminabad Road. Free car parking is available for all visitors.
                  </p>
                </div>
              </div>

              {/* Redesigned Contact Lead Form */}
              <div className="lg:col-span-7 bg-slate-900/20 border border-white/5 rounded-3xl p-8 space-y-6">
                <div className="space-y-1">
                  <h4 className="text-lg font-bold text-white uppercase tracking-wider">Send a Message</h4>
                  <p className="text-xs text-gray-400">Fill in the quick form below and Hamza Naseer will call you directly.</p>
                </div>

                {contactFormSubmitted ? (
                  <div className="p-8 bg-emerald-950/20 border border-emerald-500/30 text-center rounded-2xl space-y-4 animate-fade-in">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                      <CheckCircle2 size={24} />
                    </div>
                    <h5 className="text-base font-bold text-white">Review Submitted Successfully!</h5>
                    <p className="text-sm text-gray-200 leading-relaxed max-w-sm mx-auto font-medium">
                      Redirecting to WhatsApp... Thank you for contacting HN Real Estate!
                    </p>
                    <p className="text-xs text-gray-400 max-w-xs mx-auto">
                      Your review has been added live to our client testimonials! Hamza Naseer will reach out on <strong className="text-white">{contactCountryCode} {contactFormPhone}</strong> within 15 minutes.
                    </p>
                    <div className="pt-2 text-xs text-gray-400">
                      If the WhatsApp window did not open, click{" "}
                      <a 
                        href={`https://wa.me/923480177950?text=${encodeURIComponent(
                          `🏠 *New Property Inquiry - HN Real Estate*\n\n👤 *Name:* ${contactFormName}\n📞 *Phone:* ${contactCountryCode} ${contactFormPhone}\n📧 *Email:* ${contactFormEmail || "Not provided"}\n⭐ *Rating:* ⭐⭐⭐⭐⭐ (5/5)\n\n💬 *Message:*\n${contactFormMsg || "No message provided."}`
                        )}`}
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-gold hover:underline font-bold"
                      >
                        here to open WhatsApp manually
                      </a>.
                    </div>
                    <button
                      onClick={() => {
                        setContactFormSubmitted(false);
                        setContactFormName("");
                        setContactFormEmail("");
                        setContactFormPhone("");
                        setContactFormMsg("");
                      }}
                      className="text-xs text-gold underline hover:text-white transition-colors cursor-pointer block mx-auto mt-4"
                    >
                      Send another message / review
                    </button>
                  </div>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!contactFormName || !contactFormPhone) {
                        showNotification("Please fill in your name and phone number.", "error");
                        return;
                      }

                      // Create and append the new review to the dynamic state
                      const newReview = {
                        text: contactFormMsg || "Excellent, professional services and highly recommended properties in Sialkot!",
                        author: contactFormName,
                        location: "Verified Client",
                        rating: 5
                      };

                      setReviewsList(prev => [...prev, newReview]);
                      
                      // Highlight the newly submitted review in the slider
                      setActiveReviewIdx(reviewsList.length);

                      // Construct WhatsApp deep link
                      const formattedPhone = `${contactCountryCode} ${contactFormPhone}`;
                      const starsSelected = "⭐⭐⭐⭐⭐";
                      const emailVal = contactFormEmail ? contactFormEmail : "Not provided";
                      
                      const waMessage = `🏠 *New Property Inquiry - HN Real Estate*

👤 *Name:* ${contactFormName}
📞 *Phone:* ${formattedPhone}
📧 *Email:* ${emailVal}
⭐ *Rating:* ${starsSelected} (5/5)

💬 *Message:*
${contactFormMsg || "No message provided."}`;

                      const encodedMsg = encodeURIComponent(waMessage);
                      const waUrl = `https://wa.me/923480177950?text=${encodedMsg}`;

                      // Open WhatsApp in a new tab
                      window.open(waUrl, "_blank");

                      setContactFormSubmitted(true);
                      showNotification("Thank you! Your review has been submitted.", "success");
                    }}
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Full Name</label>
                        <input
                          type="text"
                          required
                          value={contactFormName}
                          onChange={(e) => setContactFormName(e.target.value)}
                          placeholder="e.g. Zahid Mahmood"
                          className="w-full bg-slate-950 text-xs px-4 py-3.5 rounded-xl border border-white/5 focus:border-gold outline-none text-gray-200"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Phone Number (WhatsApp)</label>
                        <div className="flex gap-2">
                          <select
                            value={contactCountryCode}
                            onChange={(e) => setContactCountryCode(e.target.value)}
                            className="bg-slate-950 text-xs px-3 py-3.5 rounded-xl border border-white/5 focus:border-gold outline-none text-gray-200 cursor-pointer max-w-[120px] transition-all"
                          >
                            {countryList.map((country, cIdx) => (
                              <option key={cIdx} value={country.code} className="bg-slate-950 text-xs text-gray-200">
                                {country.flag} {country.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            required
                            value={contactFormPhone}
                            onChange={(e) => setContactFormPhone(e.target.value)}
                            placeholder="e.g. 3338678460"
                            className="flex-1 bg-slate-950 text-xs px-4 py-3.5 rounded-xl border border-white/5 focus:border-gold outline-none text-gray-200"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Email Address (Optional)</label>
                      <input
                        type="email"
                        value={contactFormEmail}
                        onChange={(e) => setContactFormEmail(e.target.value)}
                        placeholder="e.g. zahid@example.com"
                        className="w-full bg-slate-950 text-xs px-4 py-3.5 rounded-xl border border-white/5 focus:border-gold outline-none text-gray-200"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Your Message / What are you looking for?</label>
                      <textarea
                        rows={4}
                        required
                        value={contactFormMsg}
                        onChange={(e) => setContactFormMsg(e.target.value)}
                        placeholder="e.g. I am looking for a 5 Marla house for sale near Aminabad Road Sialkot. My budget is..."
                        className="w-full bg-slate-950 text-xs px-4 py-3.5 rounded-xl border border-white/5 focus:border-gold outline-none text-gray-200 resize-none"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-4 bg-gradient-to-r from-gold to-gold-dark hover:from-gold-light hover:to-gold text-slate-950 text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-md active:scale-95 duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                      <Send size={13} />
                      <span>Send Message</span>
                    </button>
                  </form>
                )}
              </div>
            </section>

            {/* Frequently Asked Questions (FAQ) Section */}
            <section className="max-w-4xl mx-auto px-6 scroll-mt-24">
              <div className="text-center space-y-3 mb-12">
                <div className="inline-flex p-3 rounded-2xl bg-gold/5 border border-gold/10 text-gold mb-1">
                  <HelpCircle size={24} />
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-white uppercase tracking-wider">Frequently Asked Questions</h3>
                <p className="text-sm text-gray-400 leading-relaxed max-w-md mx-auto">
                  Simple and clear answers to help you understand how we work.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { q: "How do I book a free property visit?", a: "Simply click 'Contact Us' or send us a WhatsApp message. We will pick a time that works best for you and show you the property for free. No charges at all!" },
                  { q: "Are the property prices negotiable?", a: "Yes, definitely! We arrange direct meetings between buyers and owners so you can negotiate honestly. We help you get the best and fairest market price." },
                  { q: "How do you verify the properties?", a: "We double-check the registry, owner's CNIC, government tax records, and allotment papers for every single plot, house, and shop before listing it here. You are 100% safe." },
                  { q: "I live abroad. Can I buy property through you?", a: "Yes, we specialize in helping overseas Pakistanis buy land or houses safely. We send you high-resolution videos, video call from the site, and secure all documents under government transfer laws." },
                  { q: "What papers do I need to prepare to buy?", a: "You only need your CNIC (National ID Card) copy and some passport-size photographs. We take care of writing the sales deeds, stamp papers, and handling the official transfer process for you!" }
                ].map((faq, idx) => {
                  const isOpen = activeFaqIdx === idx;
                  return (
                    <div 
                      key={idx}
                      className="rounded-2xl border border-white/5 bg-slate-900/20 overflow-hidden transition-all duration-200"
                    >
                      <button
                        onClick={() => setActiveFaqIdx(isOpen ? null : idx)}
                        className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-slate-900/40 transition-colors"
                      >
                        <h4 className="text-sm md:text-base font-bold text-white">{faq.q}</h4>
                        <span className="text-gold flex-shrink-0">
                          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </span>
                      </button>
                      
                      {isOpen && (
                        <div className="px-6 pb-6 pt-2 animate-fade-in border-t border-white/5 bg-slate-950/40">
                          <p className="text-xs md:text-sm text-gray-300 leading-relaxed font-light font-sans">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

          </div>
        )}

        {/* Dynamic View Route #2: Admin Login Portal */}
        {currentPath === "/admin/login" && (
          <section className="min-h-[calc(100vh-140px)] flex items-center justify-center p-6 relative">
            <div className="absolute inset-x-0 top-1/4 -z-10 h-64 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gold/30 to-transparent"></div>
            
            <div className="w-full max-w-md bg-navy/40 backdrop-blur border border-white/10 rounded-2xl p-8 space-y-6 shadow-2xl">
              
              {/* Form Branding */}
              <div className="text-center space-y-2">
                <div className="inline-flex p-3 rounded-xl bg-gold/10 border border-gold/30 text-gold mb-2">
                  <Lock size={24} />
                </div>
                <h2 className="text-2xl font-black text-white uppercase tracking-wider">
                  Operator Login
                </h2>
                <p className="text-xs text-gray-400">
                  Authenticate credentials to manage Hamza database nodes.
                </p>
              </div>

              {/* Login Error & Success Alerts */}
              {authError && (
                <div className="p-3 bg-red-950/50 border border-red-500/40 text-red-400 rounded-xl text-xs font-semibold leading-relaxed">
                  ⚠️ Error: {authError}
                </div>
              )}
              {authSuccess && (
                <div className="p-3 bg-emerald-950/50 border border-emerald-500/40 text-emerald-400 rounded-xl text-xs font-semibold leading-relaxed flex items-center gap-2">
                  <Check size={14} className="stroke-[3]" />
                  <span>{authSuccess}</span>
                </div>
              )}

              {/* Email / Password Login Form */}
              <form onSubmit={handleLogin} className="space-y-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Operator Email address</label>
                  <div className="relative flex items-center text-gray-400 focus-within :text-white">
                    <Mail size={16} className="absolute left-3.5 text-gray-500" />
                    <input 
                      type="email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. admin@hamzarealestate.pk"
                      required
                      className="w-full bg-slate-950 text-xs px-4 py-3 pl-10.5 rounded-xl border border-white/10 focus:border-gold-light focus:ring-1 focus:ring-gold outline-none text-gray-200 tracking-wide font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Security Gate Password</label>
                  <div className="relative flex items-center text-gray-400">
                    <Key size={16} className="absolute left-3.5 text-gray-500" />
                    <input 
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••••••"
                      required
                      className="w-full bg-slate-950 text-xs px-4 py-3 pl-10.5 rounded-xl border border-white/10 focus:border-gold-light focus:ring-1 focus:ring-gold outline-none text-gray-200 tracking-wide font-medium"
                    />
                  </div>
                </div>

                {/* DB Telemetry context for login screen */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-white/5 space-y-1.5">
                  <span className="text-[9px] font-bold text-gold tracking-widest block uppercase">Pre-Loaded Core credentials:</span>
                  <div className="text-[10px] text-gray-400 space-y-1">
                    <p>• Auth Email: <code className="text-gray-200 bg-navy/60 px-1 py-0.5 rounded select-all font-mono">admin@hamzarealestate.pk</code></p>
                    <p>• Auth Password: <code className="text-gray-200 bg-navy/60 px-1 py-0.5 rounded select-all font-mono">admin123</code></p>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full bg-gold hover:bg-gold-light text-navy py-3 px-4 rounded-xl text-xs uppercase tracking-widest font-black transition-all active:scale-95 disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <>
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-navy border-t-transparent animate-spin"></div>
                      <span>Verifying Authority...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Secure Certificate</span>
                    </>
                  )}
                </button>

              </form>

            </div>
          </section>
        )}

        {/* Dynamic View Route #3: Protected Admin Dashboard */}
        {currentPath === "/admin/dashboard" && token && (
          <section className="max-w-7xl mx-auto px-6 py-10 space-y-8 animate-fade-in">
            
            {/* Dashboard Welcome Header with quick status metrics */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-gold">
                  <Database size={16} />
                  <span className="text-[10px] uppercase font-black tracking-widest font-mono">Real-Time Properties Hub</span>
                </div>
                <h2 className="text-3xl font-extrabold text-white">
                  Real Estate Control Center
                </h2>
                <p className="text-xs text-gray-400 leading-relaxed font-light">
                  Query listing matrices, publish verified estate nodes, edit active listings, and sync directly with Cloudinary pipelines.
                </p>
              </div>

              {/* Action Buttons to Trigger add mode */}
              <button
                onClick={handleOpenAddMode}
                className="self-start md:self-auto bg-gradient-to-r from-gold to-[#ab8b35] hover:opacity-90 active:scale-95 text-navy font-bold text-xs py-3.5 px-6 rounded-xl shadow-lg shadow-gold/10 flex items-center gap-2 uppercase tracking-widest font-mono"
              >
                <Plus size={16} className="stroke-[3]" />
                <span>Publish New Listing</span>
              </button>
            </div>

            {/* Statistics Dashboard Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              
              <div className="bg-navy/25 border border-white/5 p-5 rounded-2xl space-y-1 shadow-lg shadow-black/10">
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest font-mono">Total Listed Units</p>
                <p className="text-3xl font-black text-white font-mono">{allProperties.length}</p>
              </div>

              <div className="bg-navy/25 border border-white/5 p-5 rounded-2xl space-y-1 shadow-lg shadow-black/10">
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest font-mono">For Sale Units</p>
                <p className="text-3xl font-black text-gold font-mono">
                  {allProperties.filter((p: PropertyType) => p.type === "Sale").length}
                </p>
              </div>

              <div className="bg-navy/25 border border-white/5 p-5 rounded-2xl space-y-1 shadow-lg shadow-black/10">
                <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest font-mono">For Rent Units</p>
                <p className="text-3xl font-black text-gray-300 font-mono">
                  {allProperties.filter((p: PropertyType) => p.type === "Rent").length}
                </p>
              </div>

              <div className="bg-navy/25 border border-white/5 p-5 rounded-2xl space-y-1 shadow-lg shadow-black/10">
                <p className="text-[10px] uppercase text-emerald-500 font-bold tracking-widest font-mono">Featured Estates</p>
                <div className="flex items-center gap-2">
                  <p className="text-3xl font-black text-emerald-400 font-mono">
                    {allProperties.filter((p: PropertyType) => p.featured).length}
                  </p>
                  <Star size={18} className="fill-emerald-400 text-emerald-400" />
                </div>
              </div>

            </div>

            {/* Dashboard list filtration */}
            <div className="p-4 bg-slate-900/40 border border-white/5 rounded-xl flex items-center flex-wrap gap-4">
              <span className="text-xs text-gray-400 uppercase font-bold tracking-widest mr-2 flex items-center gap-1.5">
                <Filter size={13} className="text-gold" /> Filter Nodes:
              </span>
              
              <input 
                type="text"
                placeholder="Search catalog titles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 border border-white/5 text-xs text-gray-200 px-3.5 py-2 rounded-lg outline-none focus:border-gold max-w-xs"
              />

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-white/5 text-xs text-gray-300 px-3 py-2 rounded-lg outline-none cursor-pointer"
              >
                <option value="">All Transactions</option>
                <option value="Sale">Sale Listing</option>
                <option value="Rent">Rent Listing</option>
              </select>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-slate-950 border border-white/5 text-xs text-gray-300 px-3 py-2 rounded-lg outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                <option value="House">House</option>
                <option value="Plot">Plot</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
                <option value="School">School</option>
                <option value="Hospital">Hospital</option>
              </select>
            </div>

            {/* Main Interactive Table Grid */}
            <div className="bg-slate-900/20 border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
              
              {/* Full Width Responsive Data Matrix Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-navy bg-opacity-80 border-b border-white/5">
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-gold text-center w-24">Media Preview</th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-gold">Property Details</th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-gold">Price Structure</th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-gold">Scope Parameters</th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-gold">Featured</th>
                      <th className="py-4 px-6 text-[10px] uppercase font-black tracking-widest text-gold text-right w-36">Write Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {properties.map((prop) => (
                      <tr key={prop._id || prop.id} className="hover:bg-white/[0.02] transition-colors group">
                        
                        {/* Thumbnail Cell */}
                        <td className="py-4 px-6 align-middle">
                          <div className="relative w-16 h-12 overflow-hidden rounded bg-slate-950 border border-white/10 mx-auto">
                            <img 
                              src={prop.image || prop.images?.[0] || placeholderHomeImage} 
                              alt="" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = placeholderHomeImage;
                              }}
                            />
                            {prop.video && (
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-gold" title="Video clip available">
                                <Video size={10} />
                              </div>
                            )}
                          </div>
                        </td>

                        {/* Title & Core Details Cell */}
                        <td className="py-4 px-6 align-middle">
                          <div className="space-y-0.5 max-w-sm">
                            <h4 className="text-sm font-bold text-gray-200 line-clamp-1 group-hover:text-gold transition-colors">{prop.title}</h4>
                            <p className="text-[11px] text-gray-400 truncate flex items-center gap-1">
                              <MapPin size={10} className="text-gold" />
                              <span>{prop.location}, {prop.city}</span>
                            </p>
                          </div>
                        </td>

                        {/* Price & Rent/Sale cell */}
                        <td className="py-4 px-6 align-middle font-mono text-xs">
                          <div className="space-y-0.5">
                            <p className="font-bold text-gold">{prop.price}</p>
                            <span className={`inline-block text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded text-navy bg-gold/90 ${prop.type === "Sale" ? "" : ""}`}>
                              {prop.type === "Sale" ? "FOR SALE" : "FOR RENT"}
                            </span>
                          </div>
                        </td>

                        {/* Category & specifications specifications layout */}
                        <td className="py-4 px-6 align-middle text-xs text-gray-300">
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="text-[10px] text-gray-400 font-bold uppercase font-sans">Cat:</span>
                              <span className="text-gray-300 font-medium">{prop.category}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500">
                              <span>Beds: {prop.beds || "-"}</span>
                              <span>•</span>
                              <span>Baths: {prop.baths || "-"}</span>
                              <span>•</span>
                              <span className="text-gray-400">{prop.area}</span>
                            </div>
                          </div>
                        </td>

                        {/* Featured status mark */}
                        <td className="py-4 px-6 align-middle">
                          {prop.featured ? (
                            <span className="inline-flex items-center gap-1.5 text-xs text-gold bg-gold/10 px-2 py-1 rounded-lg border border-gold/20 font-mono font-bold">
                              <Star size={12} className="fill-gold" />
                              <span>Featured</span>
                            </span>
                          ) : (
                            <span className="text-xs text-gray-500 font-mono">Standard</span>
                          )}
                        </td>

                        {/* CRUD buttons */}
                        <td className="py-4 px-6 align-middle text-right">
                          <div className="flex items-center justify-end gap-2.5">
                            
                            {/* Edit Button */}
                            <button
                              onClick={() => handleOpenEditMode(prop)}
                              title="Modify active property data layout"
                              className="p-2.5 rounded-lg border border-white/5 bg-slate-900 text-gray-400 hover:text-white hover:border-gold hover:bg-gold/10 transition-all cursor-pointer active:scale-90"
                            >
                              <Edit2 size={13} />
                            </button>

                            {/* Delete Button */}
                            <button
                              onClick={() => setDeleteConfirmId(prop._id || (prop.id ? String(prop.id) : ""))}
                              title="Delete real estate listing safely"
                              className="p-2.5 rounded-lg border border-white/5 bg-slate-900 text-gray-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-950/20 transition-all cursor-pointer active:scale-90"
                            >
                              <Trash2 size={13} />
                            </button>

                          </div>
                        </td>

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {properties.length === 0 && !listingsLoading && (
                <div className="p-12 text-center text-gray-500 italic">
                  No active property records are loaded on this cluster database node. Click &quot;Publish New Listing&quot; to push your first asset.
                </div>
              )}

            </div>

          </section>
        )}

      </main>

      {/* Property Form Modals (Dedicated pop up overlay drawer for Add / Edit) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col justify-between">
            
            {/* Modal Header */}
            <header className="p-6 bg-navy text-white border-b border-white/5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <span className="text-gold">🏡</span>
                  <span>{editingId ? "Edit Property Module" : "Publish New Real Estate Listing"}</span>
                </h3>
                <p className="text-[10px] text-gray-400 tracking-wide uppercase">Multi-Part stream to Atlas & Cloudinary</p>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                title="Discard edit operations"
              >
                <X size={18} />
              </button>
            </header>

            {/* Modal Body form container */}
            <form onSubmit={handlePropertyFormSubmit} className="flex-grow overflow-y-auto p-6 space-y-5">
              
              {/* Overlay alerts */}
              {formError && (
                <div className="p-3.5 bg-red-950/40 border border-red-500/30 text-red-500 rounded-xl text-xs font-semibold">
                  ⚠️ Error: {formError}
                </div>
              )}
              {formSuccess && (
                <div className="p-3.5 bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 rounded-xl text-xs font-semibold">
                  {formSuccess}
                </div>
              )}

              {/* Row 1: Title and Area Size */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Property Listing Title</label>
                  <input
                    type="text"
                    required
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g. Luxury 10 Marla Double Story Villa"
                    className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Area Size (Marla/Kanal)</label>
                  <input
                    type="text"
                    required
                    value={formArea}
                    onChange={(e) => setFormArea(e.target.value)}
                    placeholder="e.g. 10 Marla"
                    className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100"
                  />
                </div>

              </div>

              {/* Row 2: Price Structure */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Price (PKR or USD rate)</label>
                  <input
                    type="text"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(e.target.value)}
                    placeholder="e.g. PKR 3.5 Crore"
                    className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Transaction Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value as "Sale" | "Rent")}
                    className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-200 cursor-pointer font-bold"
                  >
                    <option value="Sale">Sale Listing</option>
                    <option value="Rent">Rent Listing</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Asset Category</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as any)}
                    className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-200 cursor-pointer"
                  >
                    <option value="House">House</option>
                    <option value="Plot">Plot (Land)</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial Project</option>
                    <option value="School">School Building</option>
                    <option value="Hospital">Hospital / Clinic</option>
                  </select>
                </div>

              </div>

              {/* Row 3: Specifications and Coordinates */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase font-mono">Beds count</label>
                  <input
                    type="text"
                    value={formBeds}
                    onChange={(e) => setFormBeds(e.target.value)}
                    placeholder="5 or -"
                    className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100 text-center font-mono"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase font-mono">Baths count</label>
                  <input
                    type="text"
                    value={formBaths}
                    onChange={(e) => setFormBaths(e.target.value)}
                    placeholder="4 or -"
                    className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100 text-center font-mono"
                  />
                </div>

                <div className="md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase font-sans">City Region Location</label>
                  <input
                    type="text"
                    required
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    placeholder="Sialkot"
                    className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100"
                  />
                </div>

              </div>

              {/* Row 4: Street address details */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Street Address / Block / Area Location</label>
                <input
                  type="text"
                  required
                  value={formLocation}
                  onChange={(e) => setFormLocation(e.target.value)}
                  placeholder="e.g. Civic Center Commercial Block, DHA Phase 1"
                  className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100"
                />
              </div>

              {/* Description textarea */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase font-sans">Detailed Amenities Description</label>
                <textarea
                  required
                  rows={4}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Draft specifications about tiling, wood type, utility pipelines, nearest commercial hub, double glazing, servant quarters, and luxury features detail..."
                  className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100 font-sans"
                />
              </div>

              {/* Features strings input separated by commas */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black tracking-widest text-gray-400 uppercase">Listed Features & Amenities (comma-separated list)</label>
                <input
                  type="text"
                  value={formFeatures}
                  onChange={(e) => setFormFeatures(e.target.value)}
                  placeholder="e.g. Triple Kitchen, CCTV Monitored, False Ceiling, Tile Floor, Corner Villa"
                  className="w-full bg-slate-950 border border-white/10 text-xs px-3.5 py-2.5 rounded-lg focus:border-gold outline-none text-gray-100"
                />
              </div>

              {/* Featured listing checkbox */}
              <div className="flex items-center gap-3 bg-slate-950 p-4 rounded-xl border border-white/5">
                <input
                  type="checkbox"
                  id="form_featured_checkbox"
                  checked={formFeatured}
                  onChange={(e) => setFormFeatured(e.target.checked)}
                  className="w-4.5 h-4.5 accent-gold border-white/10 rounded cursor-pointer"
                />
                <div>
                  <label htmlFor="form_featured_checkbox" className="text-xs font-bold text-gray-200 cursor-pointer flex items-center gap-1.5 select-none font-sans">
                    <Star size={13} className="fill-gold text-gold" />
                    <span>Flag Listing as Featured</span>
                  </label>
                  <p className="text-[10px] text-gray-500 font-light font-sans mt-0.5">Featured listings get promoted to the primary luxury row in the public portal.</p>
                </div>
              </div>

              {/* Media File uploads */}
              <div className="bg-slate-950 p-4 rounded-xl border border-white/5 space-y-4">
                <h4 className="text-[10px] font-black tracking-widest text-[#ab8b35] uppercase font-mono">Media Upload Engine</h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Images upload (Multiple) */}
                  <div className="p-3 border border-white/5 bg-slate-900 rounded-lg space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <ImageIcon size={12} className="text-gold" /> Upload Gallery Images
                    </span>
                    <input 
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files) setFormImages(e.target.files);
                      }}
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-gold file:text-navy file:uppercase file:tracking-widest cursor-pointer"
                    />
                    <p className="text-[9px] text-gray-500">Supports selecting multiple files up to 12. Generates slideshow suites.</p>
                    {formImages && (
                      <div className="text-[10px] text-emerald-400 font-bold font-mono">
                        ✓ {formImages.length} image files selected
                      </div>
                    )}
                  </div>

                  {/* Video upload (Single Clip) */}
                  <div className="p-3 border border-white/5 bg-slate-900 rounded-lg space-y-2">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block flex items-center gap-1.5">
                      <Video size={12} className="text-gold" /> Upload Tour Video Clip
                    </span>
                    <input 
                      type="file"
                      accept="video/*"
                      onChange={(e: ChangeEvent<HTMLInputElement>) => {
                        if (e.target.files && e.target.files[0]) setFormVideo(e.target.files[0]);
                      }}
                      className="w-full text-xs text-gray-400 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-[10px] file:font-semibold file:bg-gray-700 file:text-white file:uppercase file:tracking-widest cursor-pointer"
                    />
                    <p className="text-[9px] text-gray-500">Supports single .mp4/webm formats to offer tour previews.</p>
                    {formVideo && (
                      <div className="text-[10px] text-emerald-400 font-bold font-mono flex items-center justify-between">
                        <span>✓ Video clip selected</span>
                        <button type="button" onClick={() => setFormVideo(null)} className="text-red-400 hover:text-white font-sans text-[9px] uppercase">Cancel</button>
                      </div>
                    )}
                  </div>

                </div>

                <div className="bg-navy/30 p-2.5 rounded text-[10px] text-gray-400 border border-white/5 flex items-center gap-1.5 leading-relaxed">
                  <CloudLightning size={12} className="text-gold flex-shrink-0 animate-pulse" />
                  <span>Media uploads stream directly to our Cloudinary cluster. Large files may extend wait times. Don&apos;t refresh while upload is processing.</span>
                </div>
              </div>

              {/* Real-time Upload Progress Display */}
              {formLoading && uploadStatus && (
                <div className="bg-slate-950 p-4 rounded-xl border border-white/10 space-y-2 mt-4">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className="text-gold uppercase tracking-widest font-bold animate-pulse flex items-center gap-1.5">
                      <CloudLightning size={12} className="text-gold" /> {uploadStatus}
                    </span>
                    <span className="text-gold font-bold bg-navy/80 px-2 py-0.5 rounded border border-white/5">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-white/5">
                    <div 
                      className="bg-gradient-to-r from-[#ab8b35] via-gold to-yellow-400 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Modal footer footer */}
              <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 bg-transparent text-gray-400 hover:text-white text-xs font-bold uppercase tracking-widest"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-6 py-3 bg-gold hover:bg-gold-light text-navy text-xs font-bold uppercase tracking-widest rounded-xl transition-all active:scale-95 disabled:opacity-40 flex items-center gap-2 font-mono"
                >
                  {formLoading ? (
                    <>
                      <div className="w-3 h-3 rounded-full border-2 border-navy border-t-transparent animate-spin"></div>
                      <span>Cloud Syncing...</span>
                    </>
                  ) : (
                    <>
                      <span>{editingId ? "Save Record Edition" : "Publish Listing Node"}</span>
                    </>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Property Inspection Detailing Modal (Public Interactive Slideshow & Detail Overlay) */}
      {selectedPropertyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl bg-[#090e1a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden my-8 max-h-[90vh] flex flex-col justify-between">
            
            {/* Modal Header details */}
            <header className="p-5 bg-navy border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[9px] uppercase font-black tracking-widest text-gold">{selectedPropertyDetails.category} Transaction Node</span>
                <h3 className="text-lg font-bold text-white line-clamp-1">{selectedPropertyDetails.title}</h3>
              </div>
              <button 
                onClick={() => setSelectedPropertyDetails(null)}
                className="p-1.5 bg-white/5 hover:bg-white/10 hover:text-white transition-colors text-gray-400 rounded-lg cursor-pointer"
                title="Exit Detailing Screen"
              >
                <X size={16} />
              </button>
            </header>

            {/* Modal Body */}
            <div className="flex-grow overflow-y-auto p-6 space-y-6">
              
              {/* Slideshow gallery & Video frame screen wrapper */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                
                {/* Large main media slider display */}
                <div className="lg:col-span-3 space-y-3">
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black border border-white/5 shadow-inner">
                    
                    {/* Check if video was selected inside the active index */}
                    {selectedPropertyDetails.video && modalActiveImageIdx === -1 ? (
                      <video 
                        src={selectedPropertyDetails.video}
                        controls
                        autoPlay
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <img 
                        src={
                          selectedPropertyDetails.images && selectedPropertyDetails.images.length > 0 
                            ? selectedPropertyDetails.images[modalActiveImageIdx] 
                            : selectedPropertyDetails.image || placeholderHomeImage
                        } 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = placeholderHomeImage;
                        }}
                      />
                    )}

                    {/* Transaction overlay text badges */}
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded bg-navy text-gold border border-gold/25 shadow">
                        FOR {selectedPropertyDetails.type}
                      </span>
                      {selectedPropertyDetails.featured && (
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-gold text-navy font-mono flex items-center gap-1">
                          <Star size={10} className="fill-navy" /> Featured
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 bg-black/70 px-3 py-1 rounded text-xs text-gray-300 font-mono">
                      Media Node {modalActiveImageIdx === -1 ? "Tour Video" : `${modalActiveImageIdx + 1} / ${selectedPropertyDetails.images?.length || 1}`}
                    </div>
                  </div>

                  {/* Horizontal visual slider track list */}
                  <div className="flex items-center gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin scrollbar-thumb-white/10">
                    
                    {/* Render thumbnail item for images */}
                    {selectedPropertyDetails.images && selectedPropertyDetails.images.length > 0 ? (
                      selectedPropertyDetails.images.map((img, idx) => (
                        <button
                          key={idx}
                          onClick={() => setModalActiveImageIdx(idx)}
                          className={`w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border transition-all ${modalActiveImageIdx === idx ? "border-gold ring-1 ring-gold scale-95" : "border-white/10 hover:border-white/40 opacity-70 hover:opacity-100"}`}
                        >
                          <img 
                            src={img || placeholderHomeImage} 
                            alt="" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = placeholderHomeImage;
                            }}
                          />
                        </button>
                      ))
                    ) : (
                      <button className="w-16 h-12 flex-shrink-0 rounded-lg overflow-hidden border border-gold ring-1 ring-gold">
                        <img src={selectedPropertyDetails.image || placeholderHomeImage} alt="" className="w-full h-full object-cover" />
                      </button>
                    )}

                    {/* Render video file clip trigger if uploaded */}
                    {selectedPropertyDetails.video && (
                      <button
                        onClick={() => setModalActiveImageIdx(-1)}
                        className={`w-16 h-12 flex-shrink-0 rounded-lg bg-navy hover:bg-navy-light text-gold border flex flex-col justify-center items-center gap-0.5 font-mono text-[9px] transition-all uppercase ${modalActiveImageIdx === -1 ? "border-gold ring-1 ring-gold scale-95" : "border-white/10 opacity-70 hover:opacity-100"}`}
                      >
                        <Video size={14} />
                        <span>VIDEO TOUR</span>
                      </button>
                    )}

                  </div>
                </div>

                {/* Listing metadata specifications box */}
                <div className="lg:col-span-2 space-y-5 flex flex-col justify-between">
                  <div className="space-y-4">
                    
                    {/* Luxury details tags */}
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 font-mono">Verified Value Range</span>
                      <p className="text-3xl font-black text-gold font-mono">{selectedPropertyDetails.price}</p>
                    </div>

                    <div className="bg-slate-950 p-4 border border-white/5 rounded-xl space-y-3">
                      <h4 className="text-[10px] uppercase font-black tracking-widest text-[#ab8b35] font-mono">Physical Specifications</h4>
                      
                      <div className="grid grid-cols-2 gap-3.5 text-xs text-gray-300">
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-500 uppercase block font-sans">Total Area</span>
                          <strong className="text-white font-mono">{selectedPropertyDetails.area}</strong>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-500 uppercase block font-sans">Estate Layout</span>
                          <strong className="text-white">{selectedPropertyDetails.category}</strong>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-500 uppercase block font-sans">Beds</span>
                          <strong className="text-white font-mono">{selectedPropertyDetails.beds || "-"} units</strong>
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] text-gray-500 uppercase block font-sans">Baths</span>
                          <strong className="text-white font-mono">{selectedPropertyDetails.baths || "-"} units</strong>
                        </div>
                      </div>
                    </div>

                    {/* Key features pill list */}
                    {selectedPropertyDetails.features && selectedPropertyDetails.features.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-[10px] uppercase font-black tracking-widest text-[#ab8b35] font-mono">Premium Conveniences</h4>
                        <div className="flex flex-wrap gap-1.5">
                          {selectedPropertyDetails.features.map((item, idx) => (
                            <span key={idx} className="bg-navy bg-opacity-65 text-gold border border-gold/15 text-[10px] font-bold px-2.5 py-1 rounded">
                              ✓ {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Luxury contact panel inside property details page */}
                  <div className="bg-gradient-to-b from-slate-900 to-[#0e1626] p-5 rounded-2xl border border-white/10 space-y-4 shadow-lg">
                    <div className="text-center pb-2 border-b border-white/5">
                      <p className="text-xs text-gold uppercase tracking-widest font-black">Direct Contact Desk</p>
                      <p className="text-[11px] text-gray-400 font-light mt-0.5">Connect with our premium property consultants</p>
                    </div>

                    <div className="space-y-3.5">
                      {/* Hamza Naseer Contact */}
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3 hover:border-gold/20 transition-all">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-white flex items-center gap-1.5">
                            <span className="text-gold">📱</span> Hamza Naseer
                          </p>
                          <p className="text-[10px] text-gold font-bold uppercase tracking-wider">Owner (WhatsApp Only)</p>
                          <p className="text-[11px] text-gray-400 font-mono">0348-0177950</p>
                        </div>
                        <a 
                          href="https://wa.me/923480177950"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
                        >
                          <MessageSquare size={12} className="fill-emerald-400/20" />
                          <span>WhatsApp</span>
                        </a>
                      </div>

                      {/* Naseer Ahmad Contact */}
                      <div className="p-3 bg-white/5 border border-white/5 rounded-xl flex items-center justify-between gap-3 hover:border-gold/20 transition-all">
                        <div className="space-y-0.5">
                          <p className="text-xs font-black text-white flex items-center gap-1.5">
                            <span className="text-gold">📞</span> Naseer Ahmad
                          </p>
                          <p className="text-[10px] text-gray-400 font-medium">Call & WhatsApp</p>
                          <p className="text-[11px] text-gray-300 font-mono font-bold">0333-8678460</p>
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <a 
                            href="tel:+923338678460"
                            className="px-3.5 py-1.5 bg-gold/10 hover:bg-gold/25 border border-gold/20 hover:border-gold/40 text-gold text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center"
                          >
                            <Phone size={10} />
                            <span>Call</span>
                          </a>
                          <a 
                            href="https://wa.me/923338678460"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3.5 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/25 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 text-center"
                          >
                            <MessageSquare size={10} className="fill-emerald-400/20" />
                            <span>WhatsApp</span>
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>

              </div>

              {/* Complete long description detail block */}
              <div className="border-t border-white/5 pt-5 space-y-2">
                <h4 className="text-[10px] uppercase font-black tracking-widest text-[#ab8b35] font-mono">Comprehensive Property Details & Excerpt</h4>
                <p className="text-xs text-gray-300 leading-relaxed font-light font-sans max-h-40 overflow-y-auto pr-2">
                  {selectedPropertyDetails.description}
                </p>
              </div>

            </div>

            {/* Modal Footer buttons */}
            <footer className="p-4 bg-navy text-right border-t border-white/5">
              <button
                onClick={() => setSelectedPropertyDetails(null)}
                className="px-5 py-2.5 bg-gold hover:bg-gold-light text-navy text-xs font-bold uppercase tracking-wider rounded-xl transition-all cursor-pointer active:scale-95 duration-200 font-mono"
              >
                Exit Property Frame
              </button>
            </footer>

          </div>
        </div>
      )}

      {/* Prestigious Luxury Brand Footer */}
      <footer className="bg-[#040813] border-t border-white/5 py-16 px-6 text-center text-xs text-gray-400">
        <div className="max-w-7xl mx-auto space-y-10">
          
          {/* Main Footer Branding */}
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="scale-125 hover:rotate-12 transition-transform duration-300">
              <HNLogo />
            </div>
            
            <div className="space-y-1">
              <h2 className="text-2xl md:text-4xl font-black uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-gold via-gold-light to-gold drop-shadow-lg">
                Hamza Naseer
              </h2>
              <p className="text-gray-400 font-medium text-xs tracking-wider uppercase">
                Your Trusted Real Estate Partner
              </p>
            </div>
          </div>

          {/* Simple Link & Contact Coordinates Column Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-3xl mx-auto pt-6 text-center">
            
            <div className="space-y-3 text-left sm:text-center">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest border-b border-gold/20 pb-2">Direct Contact</h4>
              <div className="text-gray-400 space-y-3">
                <div className="space-y-0.5">
                  <p className="text-white font-bold text-xs">📱 Hamza Naseer</p>
                  <p className="text-[10px] text-gold/80 font-bold uppercase tracking-wider">WhatsApp Only</p>
                  <a href="https://wa.me/923480177950" target="_blank" rel="noopener noreferrer" className="text-gold font-bold hover:underline font-mono text-xs">0348-0177950</a>
                </div>
                <div className="space-y-0.5">
                  <p className="text-white font-bold text-xs">📞 Naseer Ahmad</p>
                  <p className="text-[10px] text-gray-500 font-medium">Call & WhatsApp</p>
                  <a href="tel:+923338678460" className="text-gold font-bold hover:underline font-mono text-xs">0333-8678460</a>
                </div>
                <div className="pt-1 border-t border-white/5 space-y-0.5">
                  <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Email Address</p>
                  <a href="mailto:hamzanaseer3232@gmail.com" className="text-gold font-bold hover:underline text-xs">hamzanaseer3232@gmail.com</a>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest border-b border-gold/20 pb-2">Location</h4>
              <p className="text-gray-400 leading-relaxed">
                Aminabad Road,<br />
                Sialkot Cantonment Region,<br />
                Punjab, Pakistan
              </p>
            </div>

            <div className="space-y-3">
              <h4 className="text-white text-xs font-bold uppercase tracking-widest border-b border-gold/20 pb-2">Office Hours</h4>
              <p className="text-gray-400">
                Monday to Saturday<br />
                9:00 AM - 9:00 PM
              </p>
              <p className="text-xs text-gold/60">
                Sunday: Closed for site visits
              </p>
            </div>

          </div>

          {/* Bottom Row Credits & Lock Portal */}
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between text-[11px] text-gray-500 gap-4 max-w-4xl mx-auto">
            <div>
              <p>© {new Date().getFullYear()} Hamza Naseer. All Rights Reserved. Verified Premium Property Listings.</p>
              <p className="text-[9px] text-gray-600 mt-0.5">Built in very simple English for easy reading and absolute peace of mind.</p>
            </div>

            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-mono text-[9px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active Vault Node</span>
              </span>
              <button 
                onClick={() => {
                  navigate("/admin/login");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }} 
                className="hover:text-gold transition-colors font-bold uppercase tracking-widest flex items-center gap-1 bg-slate-900 border border-white/5 px-3 py-1 rounded hover:border-gold/30 cursor-pointer text-gray-400"
              >
                <span>🔑 Admin Control Portal</span>
              </button>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
