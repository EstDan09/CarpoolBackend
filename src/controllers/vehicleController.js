const Vehicle = require("../models/Vehicle");

exports.registerVehicle = async (req, res) => {
  try {
    const { model, brand, color, plate } = req.body;

    if (!model || !brand || !color || !plate) {
      return res.status(400).json({ msg: "Todos los campos son requeridos." });
    }

    const newVehicle = new Vehicle({
      model,
      brand,
      color,
      plate
    });

    await newVehicle.save();

    res.status(201).json({ msg: "Vehiculo registrado exitosamente.", data: newVehicle });
  } catch (error) {
    console.error("Error al registrar vehiculo:", error);
    if (error.code === 11000) {
      res.status(400).json({ msg: "Ya existe un vehiculo con ese número de placa." });
    } else {
      res.status(500).json({ msg: "Error al registrar el vehiculo." });
    }
  }
};

exports.getVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find();
    res.status(200).json({ msg: "Vehiculos obtenidos exitosamente.", data: vehicles });
  } catch (error) {
    console.error("Error al obtener vehiculos:", error);
    res.status(500).json({ msg: "Error al obtener los vehiculos." });
  }
};

exports.getVehicleById = async (req, res) => {
  try {
    const { id } = req.params;

    const vehicle = await Vehicle.findById(id);

    if (!vehicle) {
      return res.status(404).json({ msg: "Vehiculo no encontrado." });
    }

    res.status(200).json({ msg: "Vehiculo obtenido exitosamente.", data: vehicle });
  } catch (error) {
    console.error("Error al obtener el vehiculo:", error);
    res.status(500).json({ msg: "Error al obtener el vehiculo." });
  }
};

exports.updateVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const { model, brand, color, plate } = req.body;

    if (!model || !brand || !color || !plate) {
      return res.status(400).json({ msg: "Todos los campos son requeridos para actualizar." });
    }

    const updatedVehicle = await Vehicle.findByIdAndUpdate(
      id,
      { model, brand, color, plate },
      { new: true, runValidators: true }
    );

    if (!updatedVehicle) {
      return res.status(404).json({ msg: "Vehiculo no encontrado para actualizar." });
    }

    res.status(200).json({ msg: "Vehiculo actualizado exitosamente.", data: updatedVehicle });
  } catch (error) {
    console.error("Error al actualizar el vehiculo:", error);
    if (error.code === 11000) {
      res.status(400).json({ msg: "Ya existe un vehiculo con ese número de placa." });
    } else {
      res.status(500).json({ msg: "Error al actualizar el vehiculo." });
    }
  }
};

exports.deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedVehicle = await Vehicle.findByIdAndDelete(id);

    if (!deletedVehicle) {
      return res.status(404).json({ msg: "Vehiculo no encontrado para eliminar." });
    }

    res.status(200).json({ msg: "Vehiculo eliminado exitosamente.", data: deletedVehicle });
  } catch (error) {
    console.error("Error al eliminar el vehiculo:", error);
    res.status(500).json({ msg: "Error al eliminar el vehiculo." });
  }
};
