import apiError from "../utils/apiError.js";
import { Roles, UserFlags } from "../constants/roles.js"


const roleGuard = ({ roles = [], flags = [] } = {}) => {
  return (req, res, next) => {
    const user = req.user;

    if (!user) {
      return next(new apiError(401, "Unauthorized User"));
    }

    // Status checks
    if (user.status === "PENDING") {
      return next(new apiError(403, "User is pending approval"));
    }

    if (user.status === "BLOCKED") {
      return next(new apiError(403, "User is blocked"));
    }

    // ✅ Role check
    const roleAllowed = roles.length === 0 || roles.includes(user.role);

    // ✅ Flag check (dynamic)
    const flagAllowed =
      flags.length === 0 ||
      flags.some((flag) => user[flag] === true);

    // ✅ Final decision
    if (!roleAllowed && !flagAllowed) {
      return next(new apiError(403, "Access denied"));
    }

    next();
  };
};


// const roleGuard = (...allowedRoles) => {
//   return (req, res, next) => {
//     const user = req.user;

//     // SuperAdmin override for all routes
//     if (user.isSuperAdmin) {
//       return next();
//     }

//     // Normal role check
//     if (!allowedRoles.includes(user.role)) {
//       return res.status(403).json({ message: "Access denied" });
//     }

//     if(user.status === 'PENDING') {
//       return res.status(403).json({ message: "User is pending approval" });
//     }
//     if(user.status === 'BLOCKED') {
//       return res.status(403).json({ message: "User is blocked" });
//     }

//     next();
//   };
// };

export default roleGuard;