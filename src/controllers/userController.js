const User = require("../models/User");

exports.addCars = async (req, res) => {
    try {
        const cars = req.body.cars;
        const emailValue = req.body.email;
        if (!cars || !emailValue) return res.status(400).json({msg: "Informacion incompleta"});

        const user = await User.findOne({email: emailValue});
        if (!user) {return res.status(409).json({msg: "No existe la cuenta"})};
        if (user.role != "driver") {return res.status(409).json({msg: "No se puede agregar carro a usuario no conductor"})};


        const dataUser = await User.findOneAndUpdate(
            {email: emailValue},
            {$push: {vehicles:
                {$each:cars}
            }}
        );
        res.status(201).json({msg: "Vehiculos agregados exitosamente", data: dataUser});
    } catch (error) {
        console.error("Error al actualizar agregar carros", error);
        res.status(500).json({ msg: "Error al agregar carros"});
    }
}

exports.update = async (req, res) => {
    try {
        //En el body debe de estar TODA la informacion del usuario
        const user = req.body;

        if (!user) return res.status(400).json({msg: "Informacion incompleta"});

        const userUpdated = await User.replaceOne({email: user.email}, user);

        res.status(201).json({msg:"Usuario actualizado", data: userUpdated});
    } catch(error) {
        console.error("Error al actualizar usuario", error);
        res.status(500).json({ msg: "Error al iniciar sesion"});
    }
}

exports.login = async (req, res) => {
    try {
        const {autentication, password} = req.body;

        if (!autentication || !password) {
            return res.status(400).json({msg: "Informacion incompleta"})
        }

        const user = await User.findOne({$or: [{email: autentication}, {username: autentication}]});
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
        const {firstName, secondName, firstLastname, secondLastname, username, email, password, institutionId, 
            identificationTypeId, identificationNumber, 
            birthDate, genre, photoKey, photoUrl, type, role, vehicles} = req.body;
        
        //Campos obligatorios
        console.log(firstName);
        console.log(secondName);
        console.log(firstLastname);
        console.log(secondLastname);
        console.log(username);
        console.log(email);
        console.log(password);
        console.log(institutionId);
        console.log(identificationTypeId);
        console.log(identificationNumber);
        console.log(birthDate);
        console.log(genre);
        console.log(photoKey);
        console.log(photoUrl);
        console.log(type);
        console.log(role);
        console.log(vehicles);
        if (!firstName || !firstLastname || !username || !email || !password || !institutionId || 
            !identificationTypeId || !birthDate || !type || !role) {
                return res.status(400).json({ msg: "Campos obligatorios sin llenar."});
        }

        //Si el correo es correcto
        const size = email.length;
        if (!(email.slice(size-14) === "estudiantec.cr") && !(email.slice(size-10) === "itcr.ac.cr")) {
            return res.status(400).json({ msg: "Correo electronico invalido"});
        }

        //Si llegan a haber mas datos para validar se consultan en esta query
        const query = {$or: [{email: email}, {username: username}]};
        const ans = await User.find(query);
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        console.log(ans);
        console.log("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA");
        if (ans != null) {
            for (let i in ans) {
                if (ans[i].email === email) { 
                    return res.status(409).json({ msg: "Ya existe el correo"});
                }
                if (ans[i].username === username) {
                    return res.status(409).json({ msg: "Ya existe el nombre de usuario"});
                }
            }
        }

        const newUser = new User({
            firstName, secondName, firstLastname, secondLastname, username, email, password, institutionId, 
            identificationTypeId, identificationNumber, birthDate, genre, photoKey, photoUrl, 
            type, role, vehicles
        });

        await newUser.save();

        console.log("Usuario registrado");
        res.status(201).json({msg: "Usuario registrado exitosamente.", data: newUser});
    } catch (error) {
        console.error("Error al registrar usuario", error);
        res.status(500).json({ msg: "Error al registrar usuario"});
    }
}