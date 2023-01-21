import jwt, { decode } from 'jsonwebtoken';
// for example, if the user like the post, it needs to be checked if the user is allowed to like it. to check it, use middleware auth
const authMiddleware = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1];
        console.log('token is ' + token)
        //if token is shorter than 500, it's our  own.if it's not, it's google auth
        const isCustomAuth = token?.length < 500;

        let decodedData;
        //custom auth
        if(token && isCustomAuth) {
            decodedData = jwt.verify(token, 'test');

            req.userId = decodedData?.id;
            //google auth
        } else {
            decodedData = jwt.decode(token);

            req.userId = decodedData?.sub
            console.log(`decoded data is ${decodedData?.sub}`)
        }

        next();
    } catch (error) {
        console.log(error);
    }
}

export default authMiddleware;