import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import * as QRCode from 'qrcode';
import { sendEmail } from '../utils/mail';
import TwoFA from "2fa-node";

const ACCESS_SECRET = process.env.ACCESS_SECRET as string;
const REFRESH_SECRET = process.env.REFRESH_SECRET as string;
const ACCESS_EXP = process.env.ACCESS_TOKEN_EXPIRES as string;
const REFRESH_EXP = process.env.REFRESH_TOKEN_EXPIRES as string;

const userRepository = AppDataSource.getRepository(User);

class UserController {
  async allUsers(req: Request, res: Response) {
    try {
      const users = await userRepository.find({
        select: ["id", "name", "email", "role", "age", "gender", "religion", "blood_group"]
      });
      return res.status(200).json({ users });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async register(req: Request, res: Response) {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    try {
      const existingUser = await userRepository.findOneBy({ email });
      if (existingUser) return res.status(400).json({ message: "Email already registered" });

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = userRepository.create({ name, email, password: hashedPassword, role: "user" });
      const savedUser = await userRepository.save(newUser);

      const accesstoken = jwt.sign(
        { id: savedUser.id, email: savedUser.email, role: savedUser.role },
        ACCESS_SECRET,
        { expiresIn: ACCESS_EXP } as SignOptions
      );
      const refreshtoken = jwt.sign(
        { id: savedUser.id, email: savedUser.email, role: savedUser.role },
        REFRESH_SECRET,
        { expiresIn: REFRESH_EXP } as SignOptions
      );

      try {
        await sendEmail(savedUser.email, "Welcome!", `<h3>Hello ${savedUser.name},</h3><p>Thanks for registering!</p>`);
      } catch (err) {
        console.error("Email failed:", err);
      }

      const { id, name: userName, email: userEmail, role } = savedUser;
      return res.status(201).json({
        message: "User registered successfully",
        accesstoken,
        refreshtoken,
        user: { id, name: userName, email: userEmail, role }
      });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });

    try {
      const user = await userRepository.findOneBy({ email });
      console.log("userrrrrr",user)
      if (!user) return res.status(404).json({ message: "User not found" });
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid password" });

      if (user.flag) {
        const isTrusted = user.trustedDevices?.some(
          (d: any) => d.deviceId === userAgent && new Date() < new Date(d.expiresAt)
        );
        if (isTrusted) {
          const accesstoken = jwt.sign({ id: user.id, email: user.email, role: user.role },  ACCESS_SECRET, { expiresIn: ACCESS_EXP } as SignOptions);
          const refreshtoken = jwt.sign({ id: user.id, email: user.email, role: user.role },  REFRESH_SECRET, { expiresIn: REFRESH_EXP } as SignOptions);

          const { password: _, twoFactorSecret: __, ...userSafe } = user;
          return res.status(200).json({ message: "Login successful (trusted device)", accesstoken, refreshtoken, user: userSafe });
        }
        if (!user.twoFactorSecret) return res.status(400).json({ message: "2FA is not enabled" });
        return res.status(200).json({ message: "2FA verification required", user: { id: user.id, email: user.email } });
      }
      console.log("asasasas",user)

      const accesstoken = jwt.sign({ id: user.id, email: user.email, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXP } as SignOptions);
      const refreshtoken = jwt.sign({ id: user.id, email: user.email, role: user.role }, REFRESH_SECRET, { expiresIn: REFRESH_EXP } as SignOptions);

      const { password: _, twoFactorSecret: __, ...userSafe } = user;
      console.log(userSafe)
      return res.status(200).json({ message: "Login successful", accesstoken, refreshtoken, user: userSafe });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async verifyTwoFA(req: Request, res: Response) {
    const { userId, code, rememberDevice } = req.body;
    const userAgent = req.headers['user-agent'];
    if (!userId || !code) return res.status(400).json({ message: "userId and code are required" });

    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user || !user.twoFactorSecret) return res.status(404).json({ message: "User not found or 2FA not enabled" });

      if (!TwoFA.verifyToken(user.twoFactorSecret, code)) return res.status(400).json({ message: "Invalid OTP code" });

      if (rememberDevice && userAgent) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.trustedDevices = user.trustedDevices || [];
        if (!user.trustedDevices.find((d: any) => d.deviceId === userAgent)) {
          user.trustedDevices.push({ deviceId: userAgent, createdAt: new Date(), expiresAt });
          await userRepository.save(user);
        }
      }

      const accesstoken = jwt.sign({ id: user.id, email: user.email, role: user.role }, ACCESS_SECRET, { expiresIn: ACCESS_EXP } as SignOptions);
      const refreshtoken = jwt.sign({ id: user.id, email: user.email, role: user.role }, REFRESH_SECRET, { expiresIn: REFRESH_EXP } as SignOptions);
      
      const { password: _, twoFactorSecret: __, ...userSafe } = user;
      return res.status(200).json({ success: true, message: "2FA verified", accesstoken, refreshtoken, user: userSafe });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async toggleTwoFA(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const { flag, code } = req.body;
    if (flag !== 0 && flag !== 1) return res.status(400).json({ message: "Flag must be 0 or 1" });

    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user) return res.status(404).json({ message: "User not found" });
      
      if (flag === 0) {
        if (!code) return res.status(400).json({ message: "OTP code is required" });
        if (!user.twoFactorSecret) return res.status(400).json({ message: "2FA not set up" });
        if (!TwoFA.verifyToken(user.twoFactorSecret, code)) return res.status(400).json({ message: "Invalid OTP" });
        user.trustedDevices = [];
        user.twoFactorSecret = undefined;
      }
      user.flag = Boolean(flag);
      await userRepository.save(user);
      return res.status(200).json({ message: "Toggle Successful", flag });
    } catch (err: any) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async switchOnTwoFA(req: Request, res: Response) {
    const { userId } = req.body;
    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user) return res.status(404).json({ message: "User not found" });

      const { secret, uri } = await TwoFA.generateSecret({ name: user.name, email: user.email } as any);
      user.twoFactorSecret = secret;
      await userRepository.save(user);

      const qr = await QRCode.toDataURL(uri);
      return res.status(200).json({ message: "Two-factor enabled", qr, otpauthUrl: uri, userId: user.id });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  async otpOnMail(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user || !user.twoFactorSecret) return res.status(404).json({ message: "User not found or 2FA not enabled" });
      
      const result = TwoFA.generateToken(user.twoFactorSecret);
      if (!result) return res.status(500).json({ message: "Failed to generate OTP" });
      
      const htmlContent = `<h3>Your OTP</h3><p>Code: <strong>${result.token}</strong></p><p>Expires in 30 seconds.</p>`;
      await sendEmail(user.email, "Your OTP Code", htmlContent);
      return res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  refresh(req: Request, res: Response) {
    const { refreshtoken } = req.body;
    if (!refreshtoken) return res.status(401).json({ message: "No refresh token provided" });
    try {
      const decoded = jwt.verify(refreshtoken, REFRESH_SECRET) as any;
      const { id, email, role } = decoded;
      
      const newAccessToken = jwt.sign({ id, email, role }, ACCESS_SECRET, { expiresIn: ACCESS_EXP } as SignOptions);
      const newRefreshToken = jwt.sign({ id, email, role }, REFRESH_SECRET, { expiresIn: REFRESH_EXP } as SignOptions);
      
      return res.status(200).json({ accesstoken: newAccessToken, refreshtoken: newRefreshToken });
    } catch {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  }

  profile(req: Request, res: Response) {
    return res.status(200).json({ message: "Hello" });
  }

  async updateProfile(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const { age, gender, religion, blood_group } = req.body;
    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user) return res.status(404).json({ message: "User not found" });
      Object.assign(user, { age, gender, religion, blood_group });
      await userRepository.save(user);
      return res.status(200).json({ message: "Profile updated successfully", user });
    } catch (err: any) {
      return res.status(500).json({ message: "Server error" });
    }
  }
}

export default UserController;