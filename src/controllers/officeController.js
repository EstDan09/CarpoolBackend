const Office = require("../models/Office");

exports.registerOffice = async (req, res) => {
  try {
    const { name, members } = req.body;

    if (!name) {
      return res.status(400).json({ msg: "El nombre es obligatorio." });
    }

    const newOffice = new Office({
      name,
      members: members || []
    });

    await newOffice.save();

    res.status(201).json({ msg: "Oficina registrada exitosamente.", data: newOffice });
  } catch (error) {
    console.error("Error al registrar oficina:", error);
    res.status(500).json({ msg: "Error al registrar la oficina." });
  }
};

exports.getOffices = async (req, res) => {
  try {
    const offices = await Office.find().populate("members");
    res.status(200).json({ msg: "Oficinas obtenidas exitosamente.", data: offices });
  } catch (error) {
    console.error("Error al obtener oficinas:", error);
    res.status(500).json({ msg: "Error al obtener las oficinas." });
  }
};

exports.getOfficeById = async (req, res) => {
  try {
    const { id } = req.params;

    const office = await Office.findById(id).populate("members");

    if (!office) {
      return res.status(404).json({ msg: "Oficina no encontrada." });
    }

    res.status(200).json({ msg: "Oficina obtenida exitosamente.", data: office });
  } catch (error) {
    console.error("Error al obtener la oficina:", error);
    res.status(500).json({ msg: "Error al obtener la oficina." });
  }
};

exports.updateOffice = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, members } = req.body;

    const updatedOffice = await Office.findByIdAndUpdate(
      id,
      { name, members },
      { new: true, runValidators: true }
    );

    if (!updatedOffice) {
      return res.status(404).json({ msg: "Oficina no encontrada para actualizar." });
    }

    res.status(200).json({ msg: "Oficina actualizada exitosamente.", data: updatedOffice });
  } catch (error) {
    console.error("Error al actualizar la oficina:", error);
    res.status(500).json({ msg: "Error al actualizar la oficina." });
  }
};

exports.deleteOffice = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedOffice = await Office.findByIdAndDelete(id);

    if (!deletedOffice) {
      return res.status(404).json({ msg: "Oficina no encontrada para eliminar." });
    }

    res.status(200).json({ msg: "Oficina eliminada exitosamente.", data: deletedOffice });
  } catch (error) {
    console.error("Error al eliminar la oficina:", error);
    res.status(500).json({ msg: "Error al eliminar la oficina." });
  }
};
