import db from "../models/index";
import bcrypt from 'bcryptjs';

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

module.exports = {
    handleLogin: handleLogin,
}