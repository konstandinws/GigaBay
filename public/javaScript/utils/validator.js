export default class Validator {
  
  // Méthode statique pour valider tout le formulaire d'inscription d'un coup
  static validateRegistration(username, email, password) {
    
    // 1. Validation Username
    if (!username || username.trim().length < 3) {
      throw new Error("Le nom d'utilisateur doit contenir au moins 3 caractères.");
    }
    
    // 2. Validation Email (Regex simple)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new Error("Veuillez entrer une adresse email valide.");
    }

    // 3. Validation Mot de passe
    if (!password || password.length < 6) {
      throw new Error("Le mot de passe doit faire au moins 6 caractères.");
    }

    // Si tout va bien, on ne fait rien (ou on retourne true)
    return true;
  }
}