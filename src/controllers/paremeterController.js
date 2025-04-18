const Parameter = require("../models/Parameter");

exports.registerParameter = async (req, res) => {
  try {

    const { parameterName, parameterList } = req.body;

    if (!parameterName || !parameterList || !parameterList.length) {
      return res.status(400).json({ msg: "Todos los campos son requeridos." });
    }

    const newParameter = new Parameter({
      parameterName,
      parameterList,
    });

    await newParameter.save();

    console.log(newParameter);

    res.status(201).json({ msg: "Parámetro registrado exitosamente.", data: newParameter });
  } catch (error) {
    console.error("Error al registrar parámetro:", error);
    if (error.code === 11000) {
      res.status(400).json({ msg: "Ya existe un parametro con ese nombre."});
    } else {
      res.status(500).json({ msg: "Error al registrar el parámetro." });
    }
  }
};

exports.getParameters = async (req, res) => {
  try {
    const parameters = await Parameter.find();
    res.status(200).json({ msg: "Parametros obtenidos exitosamente.", data: parameters });
  } catch (error) {
    console.error("Error al obtener parametros:", error);
    res.status(500).json({ msg: "Error al obtener los parametros." });
  }
};

exports.getParameterByName = async (req, res) => {
  try {
    const { name } = req.params;

    const parameter = await Parameter.find({ parameterName: name });
    
    if (!parameter) {
      return res.status(404).json({ msg: "Parametro no encontrado." });
    }

    res.status(200).json({ msg: "Parametro obtenido exitosamente.", data: parameter });
  } catch (error) {
    console.error("Error al obtener el parametro:", error);
    res.status(500).json({ msg: "Error al obtener el parametro." });
  }
};

exports.getParameterById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const parameter = await Parameter.findById(id);

    if (!parameter) {
      return res.status(404).json({ msg: "Parametro no encontrado." });
    }

    res.status(200).json({ msg: "Parametro obtenido exitosamente.", data: parameter });
  } catch (error) {
    console.error("Error al obtener el parametro:", error);
    res.status(500).json({ msg: "Error al obtener el parametro." });
  }
};

exports.updateParameter = async (req, res) => {
  try {
    const { id } = req.params;
    const { parameterName, parameterList } = req.body;

    if (!parameterName || !parameterList || !parameterList.length) {
      return res.status(400).json({ msg: "Todos los campos son requeridos para actualizar." });
    }

    const updatedParameter = await Parameter.findByIdAndUpdate(
      id,
      { parameterName, parameterList },
      { new: true, runValidators: true }
    );

    if (!updatedParameter) {
      return res.status(404).json({ msg: "Parametro no encontrado para actualizar." });
    }

    res.status(200).json({ msg: "Parametro actualizado exitosamente.", data: updatedParameter });
  } catch (error) {
    console.error("Error al actualizar el parametro:", error);
    if (error.code === 11000) {
      res.status(400).json({ msg: "Ya existe un parametro con ese nombre." });
    } else {
      res.status(500).json({ msg: "Error al actualizar el parametro." });
    }
  }
};

exports.deleteParameter = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedParameter = await Parameter.findByIdAndDelete(id);

    if (!deletedParameter) {
      return res.status(404).json({ msg: "Parametro no encontrado para eliminar." });
    }

    res.status(200).json({ msg: "Parametro eliminado exitosamente.", data: deletedParameter });
  } catch (error) {
    console.error("Error al eliminar el parametro:", error);
    res.status(500).json({ msg: "Error al eliminar el parametro." });
  }
};


