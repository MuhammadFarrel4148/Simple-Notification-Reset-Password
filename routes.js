const { DaftarUser, CheckInputForgotPassword, CheckOtpForgotPassword } = require('./handler')

const routes = [
    {
        method: 'POST',
        path: '/daftaruser',
        handler: DaftarUser
    },

    {
        method: 'POST',
        path: '/checkinputforgotpassword',
        handler: CheckInputForgotPassword
    },

    {
        method: 'POST',
        path: '/checkotpforgotpassword',
        handler: CheckOtpForgotPassword
    }
]

module.exports = routes