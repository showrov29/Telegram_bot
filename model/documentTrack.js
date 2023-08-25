const mongoose = require("mongoose");

const FileSchema = mongoose.Schema({
	userId: {
		type: String,
		required: true,
	},
	fileId: {
		type: String,
		required: true,
	},
	fileName: {
		type: String,
		required: true,
	},
});

const FileHistory = mongoose.model("FileHistory", FileSchema);
module.exports = FileHistory;
