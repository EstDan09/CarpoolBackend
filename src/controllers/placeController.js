  const Place = require("../models/Place");

  exports.registerPlace = async (req, res) => {
    try {
      const { name, description, longitude, latitude } = req.body;

      if (!name || !description || longitude == null || latitude == null) {
        return res.status(400).json({ msg: "Todos los campos son requeridos." });
      }

      const newPlace = new Place({
        name,
        description,
        longitude,
        latitude
      });

      await newPlace.save();

      res.status(201).json({ msg: "Lugar registrado exitosamente.", data: newPlace });
    } catch (error) {
      console.error("Error al registrar lugar:", error);
      res.status(500).json({ msg: "Error al registrar el lugar." });
    }
  };

  exports.getPlaces = async (req, res) => {
    try {
      const places = await Place.find();
      res.status(200).json({ msg: "Lugares obtenidos exitosamente.", data: places });
    } catch (error) {
      console.error("Error al obtener lugares:", error);
      res.status(500).json({ msg: "Error al obtener los lugares." });
    }
  };

  exports.getPlaceById = async (req, res) => {
    try {
      const { id } = req.params;

      const place = await Place.findById(id);

      if (!place) {
        return res.status(404).json({ msg: "Lugar no encontrado." });
      }

      res.status(200).json({ msg: "Lugar obtenido exitosamente.", data: place });
    } catch (error) {
      console.error("Error al obtener el lugar:", error);
      res.status(500).json({ msg: "Error al obtener el lugar." });
    }
  };

  exports.updatePlace = async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, longitude, latitude } = req.body;

      if (!name || !description || longitude == null || latitude == null) {
        return res.status(400).json({ msg: "Todos los campos son requeridos para actualizar." });
      }

      const updatedPlace = await Place.findByIdAndUpdate(
        id,
        {
          name,
          description,
          longitude,
          latitude
        },
        {
          new: true,
          runValidators: true
        }
      );

      if (!updatedPlace) {
        return res.status(404).json({ msg: "Lugar no encontrado para actualizar." });
      }

      res.status(200).json({ msg: "Lugar actualizado exitosamente.", data: updatedPlace });
    } catch (error) {
      console.error("Error al actualizar el lugar:", error);
      res.status(500).json({ msg: "Error al actualizar el lugar." });
    }
  };

  exports.deletePlace = async (req, res) => {
    try {
      const { id } = req.params;

      const deletedPlace = await Place.findByIdAndDelete(id);

      if (!deletedPlace) {
        return res.status(404).json({ msg: "Lugar no encontrado para eliminar." });
      }

      res.status(200).json({ msg: "Lugar eliminado exitosamente.", data: deletedPlace });
    } catch (error) {
      console.error("Error al eliminar el lugar:", error);
      res.status(500).json({ msg: "Error al eliminar el lugar." });
    }
  };
