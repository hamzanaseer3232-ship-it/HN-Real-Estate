import { Router, Response } from "express";
import mongoose from "mongoose";
import multer from "multer";
import { Property } from "../models/Property";

const PropertyModel = Property as any;

import { upload, getCloudinary } from "../config/cloudinary";
import { authMiddleware, AuthenticatedRequest } from "../middleware/auth";

const router = Router();

// Handcrafted Sialkot Listings as seed template for fallback state
let fallbackProperties: any[] = [
  {
    _id: "65f000000000000000000001",
    id: 1,
    title: "Luxury 10-Marla Modern House",
    price: "PKR 3.5 Crore",
    location: "Citi Housing, Sialkot",
    type: "House",
    category: "House",
    city: "Sialkot",
    beds: "5",
    baths: "4",
    area: "10 Marla",
    image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1556911220-e15224bbafb0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop"
    ],
    images: [
      "https://images.unsplash.com/photo-1556911220-e15224bbafb0?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1583847268964-b28dc8f51f92?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1540518614846-7eded433c457?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "This architectural masterpiece in Sialkot offers unparalleled luxury. Featuring imported marble flooring, dual designer kitchens with top-tier appliances, and spacious TV lounges perfect for large family gatherings. Beautiful exterior elevations set perfectly in a premium gated street.",
    video: "https://assets.mixkit.co/videos/preview/mixkit-perfect-lawn-of-a-modern-house-43045-large.mp4",
    featured: true,
    features: ["Imported Marble", "Designer Kitchen", "Double Glazed Windows", "Servant Quarter", "Gated Security"]
  },
  {
    _id: "65f000000000000000000002",
    id: 2,
    title: "Premium 1-Kanal Residential Plot",
    price: "PKR 1.2 Crore",
    location: "DHA Phase 1, Sialkot",
    type: "Plot",
    category: "Plot",
    city: "Sialkot",
    beds: "-",
    baths: "-",
    area: "1 Kanal",
    image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=1200&auto=format&fit=crop",
    gallery: [
      "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?q=80&w=1200&auto=format&fit=crop"
    ],
    images: [
      "https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?q=80&w=1200&auto=format&fit=crop"
    ],
    description: "Prime residential plot available for immediate construction in Sialkot DHA. Located on a 100ft wide boulevard close to the primary parks, community clubhouse, and schools. Perfect for immediate construction or long term appreciation.",
    video: "",
    featured: true,
    features: ["Corner Plot", "Utility Connections Ready", "Near 100ft Boulevard", "Immediate Possession"]
  }
];

const checkDbConnection = (): boolean => {
  const state = mongoose.connection.readyState;
  return state === 1 || state === 2;
};

// HELPER to retrieve array of safe uploaded paths from file fields
const extractUploadedFilesUrls = (reqFiles: any): { images: string[]; video: string } => {
  const images: string[] = [];
  let video = "";

  if (reqFiles) {
    if (reqFiles.images && Array.isArray(reqFiles.images)) {
      reqFiles.images.forEach((file: any) => {
        if (file.path) {
          images.push(file.path);
        } else if (file.buffer) {
          const b64 = file.buffer.toString("base64");
          images.push(`data:${file.mimetype};base64,${b64}`);
        } else {
          images.push(file.filename || "");
        }
      });
    }
    if (reqFiles.video && Array.isArray(reqFiles.video) && reqFiles.video.length > 0) {
      const file = reqFiles.video[0];
      if (file.path) {
        video = file.path;
      } else if (file.buffer) {
        const b64 = file.buffer.toString("base64");
        video = `data:${file.mimetype};base64,${b64}`;
      } else {
        video = file.filename || "";
      }
    }
  }

  return { images, video };
};

// @route   GET /api/properties
// @desc    Get all properties (includes search matches and filter options)
// @access  Public
router.get("/", async (req: any, res: Response): Promise<void> => {
  try {
    const { search, type, category, city, featured } = req.query;

    if (checkDbConnection()) {
      const query: any = {};

      if (search) {
        query.$or = [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
          { location: { $regex: search, $options: "i" } }
        ];
      }

      if (type) query.type = { $regex: `^${type}$`, $options: "i" };
      if (category) query.category = { $regex: `^${category}$`, $options: "i" };
      if (city) query.city = { $regex: `^${city}$`, $options: "i" };
      if (featured) query.featured = featured === "true";

      const properties = await PropertyModel.find(query).sort({ createdAt: -1 });
      res.json({ success: true, count: properties.length, data: properties });
    } else {
      let results = [...fallbackProperties];

      if (search) {
        const term = String(search).toLowerCase();
        results = results.filter(
          (p) =>
            p.title.toLowerCase().includes(term) ||
            p.description.toLowerCase().includes(term) ||
            p.location.toLowerCase().includes(term)
        );
      }

      if (type) {
        results = results.filter((p) => p.type.toLowerCase() === String(type).toLowerCase());
      }
      if (category) {
        results = results.filter((p) => p.category.toLowerCase() === String(category).toLowerCase());
      }
      if (city) {
        results = results.filter((p) => p.city.toLowerCase() === String(city).toLowerCase());
      }
      if (featured) {
        results = results.filter((p) => p.featured === (featured === "true"));
      }

      res.json({
        success: true,
        fallbackMode: true,
        count: results.length,
        data: results
      });
    }
  } catch (error: any) {
    console.error("GET Error:", error);
    res.status(500).json({ success: false, message: "Fetch properties error", error: error.message });
  }
});

// @route   GET /api/properties/:id
// @desc    Get single property detail
// @access  Public
router.get("/:id", async (req: any, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    if (checkDbConnection()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid property primary ID parameter" });
        return;
      }
      const property = await PropertyModel.findById(id);
      if (!property) {
        res.status(404).json({ success: false, message: "Specified Property asset not found" });
        return;
      }
      res.json({ success: true, data: property });
    } else {
      const property = fallbackProperties.find((p) => String(p.id) === String(id) || p._id === String(id));
      if (!property) {
        res.status(404).json({ success: false, message: "Specified Property asset not found inside local memory" });
        return;
      }
      res.json({ success: true, fallbackMode: true, data: property });
    }
  } catch (error: any) {
    console.error("GET Single Error:", error);
    res.status(500).json({ success: false, message: "Error fetching specified property", error: error.message });
  }
});

type MulterFields = {
  [fieldname: string]: Express.Multer.File[];
};

const uploadFields = upload.fields([
  { name: "images", maxCount: 12 },
  { name: "video", maxCount: 1 }
]);

const runMultipartUpload = (req: any, res: any, next: any) => {
  try {
    if (req.headers["content-type"] && req.headers["content-type"].includes("application/json")) {
      return next();
    }
    uploadFields(req, res, (err: any) => {
      if (err) {
        console.error("❌ Multipart Upload Error:", err);
        return res.status(400).json({
          success: false,
          message: "Multipart form dispatch or media upload failed: " + err.message,
          error: err.toString()
        });
      }
      next();
    });
  } catch (outerErr: any) {
    console.error("❌ Critical Outer Multipart Error:", outerErr);
    return res.status(500).json({
      success: false,
      message: "An unexpected error occurred during multipart file processing",
      error: outerErr.message
    });
  }
};

const videoMemoryUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max limit
  },
});

// @route   POST /api/properties/upload-video
// @desc    Secure, isolated video upload to Cloudinary (returns JSON)
// @access  Private
router.post(
  "/upload-video",
  authMiddleware as any,
  (req: any, res: any, next: any) => {
    try {
      const singleVideoUpload = videoMemoryUpload.single("video");
      singleVideoUpload(req, res, (err: any) => {
        if (err) {
          console.error("❌ Isolated Video Upload Middleware Error:", err);
          return res.status(400).json({
            success: false,
            message: "Video file upload aborted or rejected by middleware: " + err.message,
            error: err.toString()
          });
        }
        next();
      });
    } catch (outerErr: any) {
      console.error("❌ Critical Outer Video Upload Error:", outerErr);
      return res.status(500).json({
        success: false,
        message: "An unexpected error occurred during video upload processing",
        error: outerErr.message
      });
    }
  },
  async (req: any, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({ success: false, message: "No video file was uploaded or matched the signature." });
        return;
      }

      const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
      const apiKey = process.env.CLOUDINARY_API_KEY;
      const apiSecret = process.env.CLOUDINARY_API_SECRET;

      const isCloudinaryActive = !!(
        cloudName &&
        apiKey &&
        apiSecret &&
        cloudName !== "your_cloud_name_here" &&
        apiKey !== "your_api_key_here" &&
        apiSecret !== "your_api_secret_here"
      );

      if (isCloudinaryActive) {
        console.log("⚡ Cloudinary is active. Streaming video to Cloudinary...");
        const cloudinaryInstance = getCloudinary();
        
        const uploadToCloudinary = () => {
          return new Promise<string>((resolve, reject) => {
            const stream = cloudinaryInstance.uploader.upload_stream(
              {
                folder: "hamza_real_estate",
                resource_type: "video",
                chunk_size: 6000000,
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else if (result && result.secure_url) {
                  resolve(result.secure_url);
                } else {
                  reject(new Error("Unknown error during Cloudinary video stream upload"));
                }
              }
            );
            stream.end(req.file.buffer);
          });
        };

        const videoUrl = await uploadToCloudinary();
        console.log("✅ Video uploaded successfully to Cloudinary:", videoUrl);
        res.status(200).json({
          success: true,
          message: "Video uploaded successfully to secure Cloudinary storage!",
          url: videoUrl
        });
      } else {
        console.log("⚠️ Cloudinary unconfigured. Falling back to in-memory Base64 data URL.");
        const b64 = req.file.buffer.toString("base64");
        const videoUrl = `data:${req.file.mimetype};base64,${b64}`;
        res.status(200).json({
          success: true,
          message: "Video saved to in-memory buffer (Cloudinary unconfigured)!",
          url: videoUrl
        });
      }
    } catch (err: any) {
      console.error("❌ Isolated Video Upload Route Error:", err);
      res.status(500).json({
        success: false,
        message: "Server encountered an error writing video stream to Cloudinary storage",
        error: err.message
      });
    }
  }
);

// @route   POST /api/properties
// @desc    Secure core addition of real estate properties (Admin authorized)
// @access  Private
router.post(
  "/",
  authMiddleware as any,
  runMultipartUpload,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const {
        title,
        description,
        price,
        type,
        category,
        location,
        city,
        beds,
        baths,
        area,
        featured,
        features,
        video
      } = req.body;

      // Extract file lists
      const filesUrls = extractUploadedFilesUrls(req.files as MulterFields);

      // Construct primary thumbnail from first uploaded image file, or rely on body image or fallback
      let primaryImage = filesUrls.images.length > 0 ? filesUrls.images[0] : "";
      if (req.body.image) {
        primaryImage = req.body.image;
      }

      let parsedGallery: string[] = [];
      if (filesUrls.images.length > 0) {
        parsedGallery = filesUrls.images;
      } else if (req.body.gallery) {
        if (Array.isArray(req.body.gallery)) {
          parsedGallery = req.body.gallery;
        } else if (typeof req.body.gallery === "string") {
          try {
            parsedGallery = JSON.parse(req.body.gallery);
          } catch {
            parsedGallery = req.body.gallery.split(",").map((g: string) => g.trim());
          }
        }
      } else if (req.body.images) {
        if (Array.isArray(req.body.images)) {
          parsedGallery = req.body.images;
        } else if (typeof req.body.images === "string") {
          try {
            parsedGallery = JSON.parse(req.body.images);
          } catch {
            parsedGallery = req.body.images.split(",").map((i: string) => i.trim());
          }
        }
      }

      const parsedFeatures = Array.isArray(features)
        ? features
        : typeof features === "string"
        ? features.split(",").map((f) => f.trim())
        : [];

      const newPropertyData = {
        title: title || "New Elegant Listing",
        description: description || "No detailed description supplied yet.",
        price: price || "Contact for Price",
        type: type || "Sale",
        category: category || "House",
        location: location || "Sialkot City Center",
        city: city || "Sialkot",
        beds: beds || "-",
        baths: baths || "-",
        area: area || "5 Marla",
        image: primaryImage || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=1200&auto=format&fit=crop",
        gallery: parsedGallery,
        images: parsedGallery,
        video: filesUrls.video || video || "",
        featured: featured === "true" || featured === true,
        features: parsedFeatures
      };

      if (checkDbConnection()) {
        const item = new PropertyModel(newPropertyData);
        await item.save();
        res.status(201).json({ success: true, message: "Asset saved and written to database!", data: item });
      } else {
        const inMemoryItem = {
          ...newPropertyData,
          _id: new mongoose.Types.ObjectId().toString(),
          id: fallbackProperties.length + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        fallbackProperties.unshift(inMemoryItem);
        res.status(201).json({
          success: true,
          fallbackMode: true,
          message: "⚠️ No database active. Created property local-only on memory heap.",
          data: inMemoryItem
        });
      }
    } catch (err: any) {
      console.error("POST Property Error:", err);
      res.status(500).json({ success: false, message: "Create property creation error", error: err.message });
    }
  }
);

// @route   PUT /api/properties/:id
// @desc    Secure core update of properties (Admin authorized)
// @access  Private
router.put(
  "/:id",
  authMiddleware as any,
  runMultipartUpload,
  async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      const updates = { ...req.body };

      // Handle newly uploaded files
      const filesUrls = extractUploadedFilesUrls(req.files as MulterFields);
      if (filesUrls.images.length > 0) {
        updates.image = filesUrls.images[0];
        updates.images = filesUrls.images;
        updates.gallery = filesUrls.images;
      } else {
        if (updates.gallery) {
          if (typeof updates.gallery === "string") {
            try {
              updates.gallery = JSON.parse(updates.gallery);
            } catch {
              updates.gallery = updates.gallery.split(",").map((g: string) => g.trim());
            }
          }
        }
        if (updates.images) {
          if (typeof updates.images === "string") {
            try {
              updates.images = JSON.parse(updates.images);
            } catch {
              updates.images = updates.images.split(",").map((i: string) => i.trim());
            }
          }
        }
      }
      if (filesUrls.video) {
        updates.video = filesUrls.video;
      }

      if (updates.features && typeof updates.features === "string") {
        updates.features = updates.features.split(",").map((f: string) => f.trim());
      }

      if (updates.featured !== undefined) {
        updates.featured = updates.featured === "true" || updates.featured === true;
      }

      if (checkDbConnection()) {
        if (!mongoose.Types.ObjectId.isValid(id)) {
          res.status(400).json({ success: false, message: "Invalid property ID parameter" });
          return;
        }

        const updated = await PropertyModel.findByIdAndUpdate(id, updates, { new: true });
        if (!updated) {
          res.status(404).json({ success: false, message: "Property lookup failed" });
          return;
        }
        res.json({ success: true, message: "Asset properties updated inside database", data: updated });
      } else {
        const index = fallbackProperties.findIndex((p) => String(p.id) === String(id) || p._id === String(id));
        if (index === -1) {
          res.status(404).json({ success: false, message: "Local memory lookup mismatch" });
          return;
        }

        fallbackProperties[index] = {
          ...fallbackProperties[index],
          ...updates,
          updatedAt: new Date().toISOString()
        };

        res.json({
          success: true,
          fallbackMode: true,
          message: "Transient memory node modified successfully",
          data: fallbackProperties[index]
        });
      }
    } catch (err: any) {
      console.error("PUT Error:", err);
      res.status(500).json({ success: false, message: "Update operation aborted", error: err.message });
    }
  }
);

// @route   DELETE /api/properties/:id
// @desc    Secure deletion of property (Admin authorized)
// @access  Private
router.delete("/:id", authMiddleware as any, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id;

    if (checkDbConnection()) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        res.status(400).json({ success: false, message: "Invalid property ID parameter" });
        return;
      }

      const deleted = await PropertyModel.findByIdAndDelete(id);
      if (!deleted) {
        res.status(404).json({ success: false, message: "Property node not found" });
        return;
      }
      res.json({ success: true, message: "Property node destroyed in database", data: deleted });
    } else {
      const index = fallbackProperties.findIndex((p) => String(p.id) === String(id) || p._id === String(id));
      if (index === -1) {
        res.status(404).json({ success: false, message: "Target element not found in local memory" });
        return;
      }

      const deleted = fallbackProperties.splice(index, 1)[0];
      res.json({
        success: true,
        fallbackMode: true,
        message: "Transient element popped from sequence successfully",
        data: deleted
      });
    }
  } catch (err: any) {
    console.error("DELETE Error:", err);
    res.status(500).json({ success: false, message: "Deletion event failed", error: err.message });
  }
});

export default router;
