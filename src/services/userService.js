import db from "../models/index";
import bcrypt from 'bcryptjs';

const salt = bcrypt.genSaltSync(10);

let handleLogin = (email, password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let userData = {};

            let isExit = await checkUserEmail(email);
            if (isExit) {

                //user alredy exist
                //compare password
                let user = await db.User.findOne({
                    where: { email: email },
                    attributes: ['email', 'roleId', 'password'],
                    raw: true
                });
                if (user) {
                    let check = await bcrypt.compareSync(password, user.password);
                    if (check) {
                        userData.errCode = 0;
                        userData.errMessage = "Ok";
                        delete user.password
                        userData.user = user;
                    } else {
                        userData.errCode = 3;
                        userData.errMessage = "Wrong password";
                    }


                }
                else {
                    userData.errCode = 2;
                    userData.errMessage = "User's not found"
                }

            }
            else {
                //return error
                userData.errCode = 1;
                userData.errMessage = 'Youremail isnot exist in your system'

            }
            resolve(userData)
        } catch (e) {
            reject(e);
        }
    })
}

let checkUserEmail = (userEmail) => {
    return new Promise(async (resolve, reject) => {
        try {
            let user = await db.User.findOne({
                where: { email: userEmail }

            })
            if (user) {
                resolve(true)
            }
            else {
                resolve(false)
            }
        } catch (e) {
            reject(e);
        }
    })
}

let getAllUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            let users = '';
            if (userId === 'ALL') {
                users = await db.User.findAll({
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            if (userId && userId !== 'ALL') {
                users = await db.User.findOne({
                    where: { id: userId },
                    attributes: {
                        exclude: ['password']
                    }
                })
            }
            resolve(users)

        } catch (e) {
            reject(e);
        }

    })
}

let hashUserPassword = (password) => {
    return new Promise(async (resolve, reject) => {
        try {
            let hashPassword = await bcrypt.hashSync(password, salt);
            resolve(hashPassword);
        } catch (e) {
            reject(e);
        }

    })
}
let creteNewUser = (data) => {
    return new Promise(async (resolve, reject) => {
        try {

            //check email is exist ???
            let check = await checkUserEmail(data.email);
            if (check === true) {
                resolve({
                    errCode: 1,
                    message: 'Your email is already in used ,plz try another email '
                })
            }
            let hashPasswordFromBcrypt = await hashUserPassword(data.password);
            await db.User.create({
                email: data.email,
                password: hashPasswordFromBcrypt,
                firstName: data.firstName,
                lastName: data.lastName,
                address: data.address,
                phonenumber: data.phonenumber,
                gender: data.gender === "1" ? true : false,
                roleId: data.roleId

            })

            resolve({
                errCode: 0,
                message: 'Ok'
            })

        } catch (e) {
            reject(e);
        }
    })
}

let deleteUsers = (userId) => {
    return new Promise(async (resolve, reject) => {
        let user = await db.User.findOne({
            where: { id: userId }
        })
        if (!user) {
            resolve({
                errCode: 2,
                errMessage: `The user isn't exist`
            })
        }
        await db.User.destroy({
            where: { id: userId }
        })

        resolve({
            errCode: 0,
            errMessage: `The user isn delete`
        })
    })
}
let updateUserData = (data) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (!data.id) {
                resolve({
                    errCode: 2,
                    errMessage: 'Missing req parameters'
                })
            }
            let user = await db.User.findOne({
                where: { id: data.id },
                raw: false
            })
            if (user) {
                user.firstName = data.firstName;
                user.lastName = data.lastName;
                user.address = data.address;

                await user.save();
                resolve({
                    errCode: 0,
                    message: 'Update the user succeeds'
                })
            } else {
                resolve({
                    errCode: 1,
                    message: `User's not found!`
                });
            }

        } catch (e) {
            reject(e);
        }
    })
}
module.exports = {
    handleLogin: handleLogin,
    getAllUsers: getAllUsers,
    creteNewUser: creteNewUser,
    deleteUsers: deleteUsers,
    updateUserData: updateUserData,
}