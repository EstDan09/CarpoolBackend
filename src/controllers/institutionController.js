const Institution = require("../models/Institution");

exports.registerInstitution = async (req, res) => {
  try {
    const { nombre, oficinas } = req.body;

    if (!nombre) {
      return res.status(400).json({ msg: "El nombre es obligatorio." });
    }

    const newInstitution = new Institution({
      nombre,
      oficinas: oficinas || []
    });

    await newInstitution.save();

    res.status(201).json({ msg: "Institución registrada exitosamente.", data: newInstitution });
  } catch (error) {
    console.error("Error al registrar institución:", error);
    res.status(500).json({ msg: "Error al registrar la institución." });
  }
};

exports.getInstitutions = async (req, res) => {
  try {
    const institutions = await Institution.find().populate("oficinas");
    res.status(200).json({ msg: "Instituciones obtenidas exitosamente.", data: institutions });
  } catch (error) {
    console.error("Error al obtener instituciones:", error);
    res.status(500).json({ msg: "Error al obtener las instituciones." });
  }
};

exports.getInstitutionById = async (req, res) => {
  try {
    const { id } = req.params;

    const institution = await Institution.findById(id).populate("oficinas");

    if (!institution) {
      return res.status(404).json({ msg: "Institución no encontrada." });
    }

    res.status(200).json({ msg: "Institución obtenida exitosamente.", data: institution });
  } catch (error) {
    console.error("Error al obtener la institución:", error);
    res.status(500).json({ msg: "Error al obtener la institución." });
  }
};

exports.updateInstitution = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, oficinas } = req.body;

    const updatedInstitution = await Institution.findByIdAndUpdate(
      id,
      { nombre, oficinas },
      { new: true, runValidators: true }
    );

    if (!updatedInstitution) {
      return res.status(404).json({ msg: "Institución no encontrada para actualizar." });
    }

    res.status(200).json({ msg: "Institución actualizada exitosamente.", data: updatedInstitution });
  } catch (error) {
    console.error("Error al actualizar institución:", error);
    res.status(500).json({ msg: "Error al actualizar la institución." });
  }
};

exports.deleteInstitution = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedInstitution = await Institution.findByIdAndDelete(id);

    if (!deletedInstitution) {
      return res.status(404).json({ msg: "Institución no encontrada para eliminar." });
    }

    res.status(200).json({ msg: "Institución eliminada exitosamente.", data: deletedInstitution });
  } catch (error) {
    console.error("Error al eliminar institución:", error);
    res.status(500).json({ msg: "Error al eliminar la institución." });
  }
};
