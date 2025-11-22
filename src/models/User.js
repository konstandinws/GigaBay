import bcrypt from 'bcrypt';

const passwordAdmin = "123456";
const hashAdmin = bcrypt.hashSync(passwordAdmin, 10);

// fausse base de données
const usersDB = [
    { 
        id: 1, 
        email: "admin@test.com", 
        password: hashAdmin, // Le vrai hash généré ci-dessus
        username: "Konstantinos" 
    }
];

class User {
    

    static async findByEmail(email) {
        return usersDB.find(user => user.email === email);
    }
    

    static async findById(id) {
        return usersDB.find(user => user.id === parseInt(id));
    }


    static async create(username, email, password) {
        const newUser = {
            id: usersDB.length + 1, // Auto-incrément manuel
            username: username,
            email: email,
            password: password // On stocke le hash reçu du Service
        };

        usersDB.push(newUser);
        // console.log(usersDB);
        return newUser;
    }
}

export default User;