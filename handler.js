require('dotenv').config()
const sequelize = require('./databaseconfig')
const { nanoid } = require('nanoid')
const nodemailer = require('nodemailer')

const DaftarUser = async(request, h) => {
    const { email, password } = request.payload

    try {
        const [existinguser] = await sequelize.query('SELECT id FROM users WHERE email = ?', {
            replacements: [email],
            type: sequelize.QueryTypes.SELECT
        })

        if(existinguser) {
            const response = h.response({
                status: 'fail',
                message: 'email sudah terdaftar, silahkan gunakan email yang lain'
            })
            response.code(400)
            return response
        }

        const result = await sequelize.query('INSERT INTO users (email, password) VALUES (?, ?)', {
            replacements: [email, password],
            type: sequelize.QueryTypes.INSERT
        })
        
        if(result) {
            const response = h.response({
                status: 'success',
                message: 'user berhasil ditambahkan',
                email: email
            })
            response.code(201)
            return response
        }

    } catch(error) {
        console.log(`Error : ${error.message}`)
        const response = h.response({
            status: 'fail',
            message: 'user gagal ditambahkan'
        })
        response.code(500)
        return response
    }
}

const CheckInputForgotPassword = async(request, h) => {
    const { email } = request.payload

    try {
        const [user] = await sequelize.query('SELECT id FROM users WHERE email = ?', {
            replacements: [email],
            type: sequelize.QueryTypes.SELECT
        })

        if(!user) {
            const response = h.respopnse({
                status: 'fail',
                message: 'akun tidak ditemukan'
            })
            response.code(404)
            return response
        }

        const CodeOtp = nanoid(8)

        await sequelize.query('INSERT INTO otp (email, CodeOtp) VALUES(?, ?)', {
            replacements: [email, CodeOtp],
            type: sequelize.QueryTypes.INSERT
        })

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            },
            tls: {
                rejectUnauthorized: false
            }
        })

        await transporter.sendMail({
            from: 'Authentication',
            to: email,
            subject: 'Code Otp Verification',
            text: `This is your code otp : ${CodeOtp}`
        })

        const response = h.response({
            status: 'success',
            message: 'Periksa email anda untuk mereset kata sandi'
        })
        response.code(200)
        return response

    } catch(error) {
        console.log(`Error : ${error.message}`)
        const response = h.response({
            status: 'fail',
            messsage: 'Gagal reset password'
        })
        response.code(400)
        return response
    }
}

const CheckOtpForgotPassword = async(request, h) => {
    const { CodeOtp, NewPassword } = request.payload

    try {
        const [otp_user] = await sequelize.query('SELECT email FROM otp WHERE CodeOtp = ?', {
            replacements: [CodeOtp],
            type: sequelize.QueryTypes.SELECT
        })

        if(otp_user) {
            const email = otp_user.email
            await sequelize.query('UPDATE users SET password = ? WHERE email = ?', {
                replacements: [NewPassword, email],
                type: sequelize.QueryTypes.UPDATE
            })
            await sequelize.query('DELETE FROM otp WHERE CodeOtp = ?', {
                replacements: [CodeOtp],
                type: sequelize.QueryTypes.DELETE
            })
        }

        const response = h.response({
            status: 'success',
            message: 'Kata sandi berhasil diubah'
        })

        response.code(200)
        return response

    } catch(error) {
        console.log(`Error : ${error.message}`)
        const response = h.response({
            status: 'success',
            message: 'Gagal mereset kata sandi'
        })
        response.code(400)
        return response
    }
}

module.exports = { DaftarUser, CheckInputForgotPassword, CheckOtpForgotPassword }