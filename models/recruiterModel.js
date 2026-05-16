const mongoose = require("mongoose");

const RecruiterSchema = new mongoose.Schema({
  recruiterName: String,
  companyName: String,
  email: String,
  password: String,
  companyWebsite: String,

  jobsPosted: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "job",
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("recruiter", RecruiterSchema);
