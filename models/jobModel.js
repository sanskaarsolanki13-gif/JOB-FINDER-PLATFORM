const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
  title: String,
  description: String,
  location: String,
  salary: String,
  tags: [String],
  companyName: String,
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "recruiter",
    required: true,
  },

  applicants: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
      },
      resume: String,
    },
  ],

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("job", JobSchema);
