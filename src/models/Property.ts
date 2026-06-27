import mongoose from "mongoose";

const PropertySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Property title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Property description is required"],
    },
    price: {
      type: String,
      required: [true, "Price is required"],
    },
    type: {
      type: String,
      required: [true, "Type (Sale or Rent) is required"],
      trim: true,
    },
    category: {
      type: String,
      required: [true, "Category (House, School, Hospital, Plot, Commercial, Apartment) is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
      trim: true,
    },
    city: {
      type: String,
      default: "Sialkot",
    },
    beds: {
      type: String,
      default: "-",
    },
    baths: {
      type: String,
      default: "-",
    },
    area: {
      type: String,
      required: [true, "Area size (e.g. 10 Marla, 1 Kanal) is required"],
    },
    image: {
      type: String,
      default: "",
    },
    gallery: {
      type: [String],
      default: [],
    },
    images: {
      type: [String],
      default: [],
    },
    video: {
      type: String,
      default: "",
    },
    featured: {
      type: Boolean,
      default: false,
    },
    features: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Property = mongoose.models.Property || mongoose.model("Property", PropertySchema);
export default Property;
