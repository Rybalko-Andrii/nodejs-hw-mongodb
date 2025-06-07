import { model, Schema } from "mongoose";

const contactsSchema = new Schema(
  {
    name: {
      type: String,
      require: true,
    },

    phoneNumber: {
      type: String,
      require: true,
    },
    email: {
      type: String,
      require: false,
    },
    isFavourite: {
      type: Boolean,
      default: false,
    },
    contactType: {
      type: String,
      enum: ["work", "home", "personal"],
      required: true,
      default: "personal",
    },
  },
  { timestamps: true }
);

export const ContactsCollection = model("contacts", contactsSchema);
