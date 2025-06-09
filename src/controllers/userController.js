const User = require("../models/User");

exports.addCars = async (req, res) => {
    try {
        const cars = req.body.cars;
        const email = req.body.email;
        if (!cars || !email) return res.status(400).json({msg: "Informacion incompleta"});
        const data = User.findOneAndUpdate(
            {email: email},
            {$push: {vehicles:
                {$each:cars}
            }}
        );
        res.status(201).json({msg: "Vehiculos agregados exitosamente", data: data});
    } catch (error) {
        console.error("Error al actualizar agregar carros", error);
        res.status(500).json({ msg: "Error al agregar carros"});
    }
}

exports.update = async (req, res) => {
  try {
    const { id } = req.params;          
    const updates = req.body;

    const user = await User.findById(id);
    if (!user) {
      return res
        .status(404)
        .json({ msg: "Usuario no encontrado." });
    }

    if (updates.email && updates.email !== user.email) {
      const exists = await User.findOne({ email: updates.email });
      if (exists) {
        return res
          .status(409)
          .json({ msg: "Ese email ya está en uso." });
      }
    }
    if (updates.username && updates.username !== user.username) {
      const exists = await User.findOne({ username: updates.username });
      if (exists) {
        return res
          .status(409)
          .json({ msg: "Ese username ya está en uso." });
      }
    }

    const allowed = [
      "name", "fisrtSurname", "secondSurname", "phone",
      "username", "email", "password", "institutionId",
      "identificationTypeId", "identificationNumber",
      "birthDate", "genre", "photoKey", "photoUrl",
      "type", "role", "vehicles"
    ];
    for (let key of allowed) {
      if (updates[key] !== undefined) {
        user[key] = updates[key];
      }
    }

    await user.save();

    res
      .status(200)
      .json({ msg: "Usuario actualizado exitosamente.", data: user });
  } catch (error) {
    console.error("Error al actualizar usuario", error);
    res
      .status(500)
      .json({ msg: "Error interno al actualizar usuario." });
  }
};

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        if (!email || !password) {
            return res.status(400).json({msg: "Informacion incompleta"})
        }

        const user = await User.findOne({email: email});
        if (!user) {return res.status(409).json({msg: "No hay una cuenta asociada al correo"})}

        user.comparePassword(password, function (err, match) {
            if (err) throw err;

            if (match) {
                res.status(201).json({msg: "Sesion iniciada", data: user});
            } else {
                return res.status(400).json({msg: "contrasena incorrecta"})
            }
        });

    } catch (error) {
        console.error("Error al iniciar sesion", error);
        res.status(500).json({ msg: "Error al iniciar sesion"});
    }
}

exports.register = async (req, res) => {
  try {
    const {
      name,
      fisrtSurname,
      secondSurname,
      phone,
      username,
      email,
      password,
      institutionId,
      identificationTypeId,
      identificationNumber,
      birthDate,
      genre,
      photoKey,
      photoUrl,
      type,
      role,
      vehicles = []
    } = req.body;

    if (
      !name ||
      !fisrtSurname ||
      !secondSurname ||
      !phone ||
      !username ||
      !email ||
      !password ||
      !institutionId ||
      !birthDate ||
      !type ||
      !role
    ) {
      return res
        .status(400)
        .json({ msg: "Faltan campos obligatorios." });
    }

    const domain = email.split("@")[1] || "";
    if (!["estudiantec.cr","itcr.ac.cr"].includes(domain)) {
      return res
        .status(400)
        .json({ msg: "Correo inválido; dominio debe ser estudiantec.cr o itcr.ac.cr" });
    }

    const conflict = await User.findOne({
      $or: [
        { email },
        { username },
        ...(identificationNumber
          ? [{ identificationNumber }]
          : [])
      ]
    });
    if (conflict) {
      let field = conflict.email === email
        ? "email"
        : conflict.username === username
          ? "username"
          : "identificationNumber";
      return res
        .status(409)
        .json({ msg: `Ya existe un usuario con ese ${field}.` });
    }

    const newUser = new User({
      name,
      fisrtSurname,
      secondSurname,
      phone,
      username,
      email,
      password,
      institutionId,
      identificationTypeId,
      identificationNumber,
      birthDate,
      genre,
      photoKey,
      photoUrl,
      type,
      role,
      vehicles
    });

    await newUser.save();

    res
      .status(201)
      .json({ msg: "Usuario registrado exitosamente.", data: newUser });
  } catch (error) {
    console.error("Error al registrar usuario", error);
    res
      .status(500)
      .json({ msg: "Error interno al registrar usuario." });
  }
};

exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ msg: "ID no proporcionado" });

        const user = await User.findById(id);
        if (!user) return res.status(404).json({ msg: "Usuario no encontrado" });

        res.status(200).json({ data: user });
    } catch (error) {
        console.error("Error al obtener usuario por ID", error);
        res.status(500).json({ msg: "Error al obtener usuario por ID" });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.status(200).json({ data: users });
    } catch (error) {
        console.error("Error al obtener todos los usuarios", error);
        res.status(500).json({ msg: "Error al obtener todos los usuarios" });
    }
};

exports.addNotificationToUser = async (req, res) => {
  try {
    const { email, title, subtitle } = req.body;

    if (!email || !title || !subtitle) {
      return res.status(400).json({ msg: "Faltan campos requeridos: email, title o subtitle" });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email },
      {
        $push: {
          notifications: {
            title,
            subtitle,
            timestamp: new Date()
          }
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ msg: "Usuario no encontrado" });
    }

    res.status(200).json({
      msg: "Notificación agregada exitosamente",
      notifications: updatedUser.notifications
    });
  } catch (error) {
    console.error("Error al agregar notificación:", error);
    res.status(500).json({ msg: "Error interno al agregar notificación" });
  }
};