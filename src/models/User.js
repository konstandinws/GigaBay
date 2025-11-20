
const HASHED_PASSWORD = '$2b$10$fG5/I.tJq.fG5/I.tJq.fO1234567890abcdef1234567890abc'; 

const usersDB = [
    { 
        id: 1, 
        email: "admin@test.com", 
        password: HASHED_PASSWORD, // On stocke le hash, jamais le mot de passe clair !
        name: "Konstantinos"
    }
];

class User {
    static findByEmail(email) {
        return usersDB.find(user => user.email === email);
    }
    
    static findById(id) {
        return usersDB.find(user => user.id === id);
    }
}

export default User;