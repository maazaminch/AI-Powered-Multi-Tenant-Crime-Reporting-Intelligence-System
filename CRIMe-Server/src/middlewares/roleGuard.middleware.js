import apiError from "../utils/apiError.js";

const roleGuard = ({ roles = [], flags = [] } = {}) => {
    return (req, res, next) => {
        const user = req.user;

        if (!user) {
            return next(new apiError(401, "Unauthorized User"));
        }

        if (user.isSuperAdmin) {
            return next();
        }

        if (user.status === "PENDING") {
            return next(new apiError(403, "User is pending approval"));
        }

        if (user.status === "BLOCKED") {
            return next(new apiError(403, "User is blocked"));
        }

        const roleAllowed =
            roles.length === 0 || roles.includes(user.role);

        const flagAllowed =
            flags.length === 0 || flags.some(flag => user[flag] === true);

        if (!(roleAllowed || flagAllowed)) {
            return next(new apiError(403, "Access denied"));
        }

        next();
    };
};

export default roleGuard;