import wrapAsync from "../../utils/wrapAsync.js";
import User from '../../models/user.model.js'
import apiError from "../../utils/apiError.js";
import apiResponse from '../../utils/apiResponse.js'
import escapeRegex from '../../utils/escapeRegex.js'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import NotificationService from '../../services/notification.service.js'
import crypto from "crypto";
import Invite from "../../models/invite.model.js";

class authController {

    //this controller generates link for admin and police registration
    static createInviteLinkController = wrapAsync(async (req, res) => {

    const { email, role, tenantId: inviteTenantId } = req.body;

    const currentUser = req.user;

    // ─────────────────────────────
    // Validation
    // ─────────────────────────────

    if (!email || !role) {
        throw new apiError(400, "Email and role are required");
    }

    // ─────────────────────────────
    // Authorization
    // ─────────────────────────────

    if (role === "ADMIN") {

        if (!currentUser.isSuperAdmin) {
            throw new apiError(
                403,
                "Only SuperAdmin can invite ADMIN"
            );
        }

    } else if (role === "POLICE") {

        if (currentUser.role !== "ADMIN") {
            throw new apiError(
                403,
                "Only ADMIN can invite POLICE"
            );
        }

        if (!currentUser.tenantId && !currentUser.isSuperAdmin) {
            throw new apiError(
                400,
                "Admin tenant missing"
            );
        }

    } else {
        throw new apiError(400, "Invalid role");
    }

    // ─────────────────────────────
    // Existing User Check
    // ─────────────────────────────

    const existingUser = await User.findOne({ email });

    if (existingUser && existingUser.status !== "REJECTED") {
        throw new apiError(
            400,
            "User already exists"
        );
    }

    // ─────────────────────────────
    // Existing Invite Check
    // ─────────────────────────────

    const existingInvite = await Invite.findOne({
        email,
        role,
        isUsed: false,
        expiresAt: { $gt: new Date() }
    });

    if (existingInvite) {
        throw new apiError(
            400,
            "Active invite already exists"
        );
    }

    // ─────────────────────────────
    // Generate Token
    // ─────────────────────────────

    const rawToken = crypto
        .randomBytes(32)
        .toString("hex");

    const hashedToken = crypto
        .createHash("sha256")
        .update(rawToken)
        .digest("hex");

    // ─────────────────────────────
    // Expiry
    // ─────────────────────────────

    const expiresAt = new Date(
        Date.now() + 24 * 60 * 60 * 1000
    );

    // ─────────────────────────────
    // Tenant Logic
    // ─────────────────────────────

    let tenantId = null;

    if (role === "POLICE") {
        tenantId = currentUser.tenantId;
    } else if (role === "ADMIN" && inviteTenantId) {
        tenantId = inviteTenantId;
    }

    // ─────────────────────────────
    // Create Invite
    // ─────────────────────────────

    const invite = await Invite.create({
        email,
        role,
        tenantId,
        token: hashedToken,
        createdBy: currentUser._id,
        expiresAt
    });

    if (!invite) {
        throw new apiError(
            500,
            "Failed to create invite"
        );
    }

    // ─────────────────────────────
    // Invite Link
    // ─────────────────────────────

    const frontendUrl = process.env.FRONTEND_URL || process.env.CLIENT_ORIGIN || 'http://localhost:3000';
    const inviteLink = `${frontendUrl.replace(/\/$/, '')}/register/invite?token=${rawToken}&role=${role}`;

    // ─────────────────────────────
    // Send Email
    // ─────────────────────────────

        const messageText = `You are invited as ${role}\n\nClick below to register:\n\n${inviteLink}`;
        const messageHtml = `
            <div style="font-family:Arial,sans-serif">

            <h2>Crime Reporting System</h2>

            <p>Salam,</p>

            <p>
            You have been invited to join the Crime Reporting System as an ${role}.
            </p>

            <p>
            Use the following link to complete your account registration:
            </p>

            <p>
                <a href="${inviteLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Register Now</a>
            </p>

            <p>
            This invitation link will expire in 24 hours.
            </p>

            <p>
            If you did not request this invitation, please ignore this email.
            </p>

            </div>
            `;
        // const messageHtml = `
        //     <div style="font-family: Arial, sans-serif; line-height:1.4;">
        //         <p>You are invited as <strong>${role}</strong></p>
        //         <p>
        //             <a href="${inviteLink}" style="display:inline-block;padding:10px 16px;background:#2563eb;color:#fff;text-decoration:none;border-radius:6px;">Register Now</a>
        //         </p>
        //         <p style="font-size:12px;color:#666;margin-top:12px;">Or open this link in your browser:</p>
        //         <p style="word-break:break-all;"><a href="${inviteLink}">${inviteLink}</a></p>
        //     </div>
        // `;
        

        await NotificationService.send({
        tenantId:
            role === "POLICE"
                ? currentUser.tenantId
                : null,

        userId: currentUser._id,

        type: "INVITE",

        title: `Invitation as ${role}`,

                message: messageText,
                html: messageHtml,

        email,

        channels: ["email"]
    });

    // ─────────────────────────────
    // Response
    // ─────────────────────────────

    return res.status(201).json(
        new apiResponse(
            201,
            {
                inviteLink,
                expiresAt
            },
            "Invite created successfully"
        )
    );
    });

    static registerWithInviteController = wrapAsync(async (req, res) => {

    const {
        token,
        fullName,
        password,
        confirmPassword,
        phone,
        gender,
        dateOfBirth,
        address,
        idType,
        nationalIdHash,
        profilePictureStorageKey,
        badgeNumber
    } = req.body;

    // ─────────────────────────────
    // Validation
    // ─────────────────────────────

    if (!token) {
        throw new apiError(
            400,
            "Invite token required"
        );
    }

    if (
        !fullName ||
        !password ||
        !confirmPassword
    ) {
        throw new apiError(
            400,
            "Required fields missing"
        );
    }

    if (password !== confirmPassword) {
        throw new apiError(
            400,
            "Password mismatch"
        );
    }

    // ─────────────────────────────
    // Hash Token
    // ─────────────────────────────

    const hashedToken = crypto
        .createHash("sha256")
        .update(token)
        .digest("hex");

    // ─────────────────────────────
    // Find Invite
    // ─────────────────────────────

    const invite = await Invite.findOne({
        token: hashedToken
    });

    if (!invite) {
        throw new apiError(
            400,
            "Invalid invite token"
        );
    }

    if (invite.isUsed) {
        throw new apiError(
            400,
            "Invite already used"
        );
    }

    if (invite.expiresAt < new Date()) {
        throw new apiError(
            400,
            "Invite expired"
        );
    }

    // ─────────────────────────────
    // Existing User Check
    // ─────────────────────────────

    const existingUser = await User.findOne({
        email: invite.email
    });

    if (existingUser) {
        throw new apiError(
            400,
            "User already exists"
        );
    }

    // ─────────────────────────────
    // Role Data
    // ─────────────────────────────

    const role = invite.role;
    const email = invite.email;
    const tenantId = invite.tenantId;

    // ─────────────────────────────
    // Police Validation
    // ─────────────────────────────

    if (
        role === "POLICE" &&
        !badgeNumber
    ) {
        throw new apiError(
            400,
            "Badge number required for police"
        );
    }

    // ─────────────────────────────
    // Hash Sensitive Data
    // ─────────────────────────────

    const hashedPassword =
        await bcrypt.hash(password, 10);

    const hashedNationalId =
        await bcrypt.hash(nationalIdHash, 10);

    // ─────────────────────────────
    // Create User Object
    // ─────────────────────────────

    const userData = {
        fullName,
        email,
        password: hashedPassword,
        phone,
        gender,
        role,
        dateOfBirth,
        address,
        idType,
        nationalIdHash: hashedNationalId,

        profilePictureUrl:
            profilePictureStorageKey || null,

        tenantId: tenantId || undefined,

        badgeNumber:
            role === "POLICE"
                ? badgeNumber
                : undefined,

        status: "PENDING",

        invitedBy: invite.createdBy,
        invitedAt: invite.createdAt,
    };

    // ─────────────────────────────
    // Create User
    // ─────────────────────────────

    const user = await User.create(userData);

    if (!user) {
        throw new apiError(
            500,
            "User creation failed"
        );
    }

    // ─────────────────────────────
    // Mark Invite Used
    // ─────────────────────────────

    invite.isUsed = true;
    invite.usedAt = new Date();

    await invite.save();

    // ─────────────────────────────
    // Notifications
    // ─────────────────────────────

    if (role === "POLICE") {

        const admins = await User.find({
            tenantId,
            role: "ADMIN",
            status: "APPROVED"
        });

        for (const admin of admins) {

            await NotificationService.send({
                tenantId,
                userId: admin._id,
                type: "POLICE_REGISTERED",
                title: "New Police Registration",
                message:
                    `${fullName} registered as police officer`,
                channels: ["inapp"]
            });
        }
    }

    if (role === "ADMIN") {

        const superAdmin = await User.findOne({
            isSuperAdmin: true
        });

        if (superAdmin) {

            await NotificationService.send({
                tenantId: null,
                userId: superAdmin._id,
                type: "ADMIN_REGISTERED",
                title: "New Admin Registration",
                message:
                    `${fullName} registered as admin`,
                channels: ["inapp"]
            });
        }
    }

    // ─────────────────────────────
    // Response
    // ─────────────────────────────

    return res.status(201).json(
        new apiResponse(
            201,
            {
                userId: user._id,
                email: user.email,
                role: user.role
            },
            "Registration successful"
        )
    );
    });

    static registerCitizenController = wrapAsync(async (req, res) => {

    const {
        fullName,
        email,
        password,
        confirmPassword,
        profilePictureStorageKey,
        phone,
        gender,
        dateOfBirth,
        address,
        idType,
        nationalIdHash
    } = req.body;

    // ─────────────────────────────
    // 1. Validate input
    // ─────────────────────────────
    if (!fullName || !email || !password || !confirmPassword) {
        throw new apiError(400, "Required fields missing");
    }

    if (password !== confirmPassword) {
        throw new apiError(400, "Password mismatch");
    }

    // ─────────────────────────────
    // 2. Prevent role injection (IMPORTANT SECURITY FIX)
    // ─────────────────────────────
    const role = "CITIZEN";

    // ─────────────────────────────
    // 3. Check existing user
    // ─────────────────────────────
    const existUser = await User.findOne({ email });
    if (existUser) {
        throw new apiError(400, "Email already exists");
    }

    const existUserByPhone = await User.findOne({ phone });
    if (existUserByPhone) {
        throw new apiError(400, "Phone number already exists");
    }

    // ─────────────────────────────
    // 4. Hash sensitive data
    // ─────────────────────────────
    const hashPassword = await bcrypt.hash(password, 10);
    const idNoHash = await bcrypt.hash(nationalIdHash, 10);

    // ─────────────────────────────
    // 5. Build user object
    // ─────────────────────────────
    const userData = {
        fullName,
        email,
        password: hashPassword,
        profilePictureUrl: profilePictureStorageKey || null,
        gender,
        phone,
        role, // always CITIZEN
        dateOfBirth,
        address,
        idType,
        nationalIdHash: idNoHash,

        tenantId: null, // optional (citizens are global in your system)

        status: "APPROVED",
    };

    // ─────────────────────────────
    // 6. Create user
    // ─────────────────────────────
    const user = await User.create(userData);

    if (!user) {
        throw new apiError(500, "User creation failed");
    }

    const createdUser = await User.findById(user._id).select("-password");

    // ─────────────────────────────
    // 7. Notification
    // ─────────────────────────────
    await NotificationService.send({
        tenantId: null,
        userId: user._id,
        type: "WELCOME",
        title: "Welcome to Crime Reporting System",
        message: `Hi ${fullName}, your account is active!`,
        channels: ["inapp", 
            //"email"
        ]
    });

    // ─────────────────────────────
    // 8. Response
    // ─────────────────────────────
    return res.status(201).json(
        new apiResponse(201, createdUser, "Citizen registered successfully")
    );
    });

    static updateUserDetailsController = wrapAsync(async (req, res)=> {
    
    const targetUserId = req.user._id;
    const requester = req.user;
    const tenantId = req.user.tenantId;


    const targetUser = await User.findOne({
        _id: targetUserId,
        tenantId,
    });
    if(!targetUser) throw new apiError(400, 'User not found');

    const isSelf = targetUser._id.equals(requester._id);
    if(!isSelf) throw new apiError(400, 'You are not authorized to update this user');

    const allowedFields = ['fullName', 'email', 'password', 'profilePictureUrl',
        'gender', 'dateOfBirth', 'address']
    for(const field of allowedFields){
        if(req.body[field] !==undefined) targetUser[field] = req.body[field] 
    }  

    if (req.body.password) {
    if (req.body.password !== req.body.confirmPassword) {
        throw new apiError(400, 'Password mismatch');
    }

    const hashPassword = await bcrypt.hash(req.body.password, 10);
    targetUser.password = hashPassword;
}
    
    const updatedUser = await targetUser.save();
    if(!updatedUser) throw new apiError(400, 'User not updated')

    //Notification Service 
    const updatedUserSafe = await User.findById(updatedUser._id).select('-password -nationalIdHash');
    if(!updatedUserSafe) throw new apiError(400, 'updatedUser not found')
    await NotificationService.send({
        tenantId,
        userId: targetUser._id,
        type: "PROFILE_UPDATED",
        title: "Profile Updated",
        message: "Your profile has been updated successfully",
        channels: ["inapp"]
    })
    
    const admins = await User.find({tenantId, role: 'ADMIN', status: 'APPROVED', isApproved: true})
    if(!admins) throw new apiError(400, 'No admin found')
    for(const admin of admins){
        await NotificationService.send({
        tenantId,
        userId: targetUser._id,
        type: "USER_PROFILE_UPDATED",
        title: "User Profile Updated",
        message: `${targetUser.fullName} has been updated successfully`,
        channels: ["inapp"]
    })
    } 
    return res.status(200).json(new apiResponse(200, updatedUserSafe, 'User updated successfully'))
    })



    static loginController = wrapAsync(async(req, res) => {

    const {email, password} = req.body;

    const user = await User.findOne({email});
     if(!user) throw new apiError(400, 'Email not registered')

    const comparePassword = await bcrypt.compare(password, user.password)
    if(!comparePassword) throw new apiError(400, 'Wrong Password')

        if(user.status !== "APPROVED") {
            throw new apiError(403, 'Account not approved');
        }        
    

    const accessToken = jwt.sign(
        {
            id: user._id,
            tenantId: user.tenantId
        },
        process.env.JWT_SECRET,
        { expiresIn: '1d' })

        if(user.status !== "APPROVED") {
            throw new apiError(403, 'Account not approved');
        }        

    //cookies - options here used so no one can change cookies from the frontend
    const options = {
        httpOnly: true,
        secure: false, //for localhost is false for prod its true
        sameSite: "lax"
    };

    const userSafe = await User.findById(user._id).select('-password -nationalIdHash');

    return res.status(200)
    .cookie("accessToken", accessToken, options)
    .json(new apiResponse(
        200,
        {
            user: userSafe,
        },
        'User loggedin successfully'
    ))
    })

    static logoutController = wrapAsync(async (req, res) => {

    const options = {
        httpOnly: true,
        secure: false,
        sameSite: "lax"
    };

    return res
        .status(200)
        .clearCookie("accessToken", options)
        .json(
            new apiResponse(
                200,
                null,
                "Logged out successfully"
            )
        );
});

    static getCurrentUserController = wrapAsync(async(req, res) => {
    const currentUser = req.user;

    if (!currentUser) {
        throw new apiError(401, "User not authenticated");
    }

    // Get fresh user data from database
    const user = await User.findById(currentUser._id)
        .select('-password -nationalIdHash')
        .populate('tenantId', 'name code region')
        .populate('policeStationId', 'stationName');

    if (!user) {
        throw new apiError(404, "User not found");
    }

    // Check if user is still approved
    if (user.status !== "APPROVED") {
        throw new apiError(403, "Account not approved");
    }

    return res.status(200).json(
        new apiResponse(200, {
            user: {
                id: user._id,
                fullName: user.fullName,
                email: user.email,
                role: user.role,
                tenantId: user.tenantId,
                policeStationId: user.policeStationId,
                isStationHead: user.isStationHead || false,
                isSuperAdmin: user.isSuperAdmin || false,
                status: user.status,
                isApproved: user.isApproved,
                phone: user.phone,
                profilePictureUrl: user.profilePictureUrl
            }
        }, "Current user fetched successfully"))

    });

}

export default authController;

