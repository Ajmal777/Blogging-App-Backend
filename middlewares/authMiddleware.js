const jwt = require('jsonwebtoken');

const isAuth = (req, res, next) => {
    const token = req.headers['x-acciojob'];
    let verified;

    try{
        verified = jwt.verify(token, process.env.JWT_SECRET);
    }
    catch(err){
        return res.status(401).send({
            status: 401,
            message: 'JWT not provided',
            data: err,
        })
    }

    if(verified){
        req.locals = verified;
        next();
    }
    else{
        res.status(401).send({
            status: 401,
            message: 'User not authenticted. Please login'
        });
    }
}

module.exports = {isAuth};