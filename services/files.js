const FileHistory = require("../model/documentTrack");

const saveFile = async (msg) => {
	const file = {
		userId: msg.from.id,
		fileId: msg.document.file_id,
		fileName: msg.document.file_name,
	};

	const fileExist = await FileHistory.find({ userId: msg.from.id });

	if (fileExist.length > 0) {
		FileHistory.findOneAndUpdate(
			{ userId: msg.from.id },
			{ fileId: msg.document.file_id }
		);
	} else {
		const newRecord = new FileHistory(file);
		newRecord.save();
	}
};

module.exports = { saveFile };
