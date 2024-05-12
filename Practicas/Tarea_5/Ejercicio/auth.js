// auth.js
import express from 'express';
import passport from 'passport';

const router = express.Router();

// Ruta para mostrar el formulario de inicio de sesión
router.get('/login', (req, res) => {
    const username = req.isAuthenticated() ? req.session.passport.user.username : null; // Obtener el username
    res.render('login.html', { username: username }); // Pasar el username a la plantilla
});

// Ruta para manejar el inicio de sesión
router.post('/login', passport.authenticate('local', {
    successRedirect: '/ver-facturas', // Redirigir a la página de facturación si la autenticación es exitosa
    failureRedirect: '/auth/login', // Redirigir al formulario de inicio de sesión si hay un error
    failureFlash: true
}));

// Ruta para cerrar sesión
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
});

// Resto de las rutas de autenticación...

export default router;
