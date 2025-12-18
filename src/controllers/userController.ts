import { Request, Response } from "express";
import { AppDataSource } from "../dataSource";
import { User } from "../entity/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import * as QRCode from 'qrcode';

import { sendEmail } from '../utils/mail';
import TwoFA from "2fa-node";
const ACCESS_SECRET = process.env.ACCESS_SECRET || "abcde";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "abcde";

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
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepository.create({ name, email, password: hashedPassword, role: "user" });
    const savedUser = await userRepository.save(newUser);

    const accesstoken = jwt.sign({ id: savedUser.id, email: savedUser.email, role: savedUser.role }, ACCESS_SECRET, { expiresIn: "15m" });
    const refreshtoken = jwt.sign({ id: savedUser.id, email: savedUser.email, role: savedUser.role }, REFRESH_SECRET, { expiresIn: "1d" });

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
    console.error(err);
    return res.status(500).json({ message: "Server error" });
  }
}


  async login(req: Request, res: Response) {
    console.log(req.headers);
    console.log("user-agent", req.headers['user-agent'])
    const { email, password } = req.body;
    const userAgent = req.headers['user-agent'];
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }
    try {
      const user = await userRepository.findOneBy({ email });
      if (!user) return res.status(404).json({ message: "User not found" });
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return res.status(401).json({ message: "Invalid password" });
      if (user.flag) {
        const isTrusted = user.trustedDevices?.some(
          (d: any) => d.deviceId === userAgent && new Date() < new Date(d.expiresAt)
        );
        if (isTrusted) {
          const accesstoken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            ACCESS_SECRET,
            { expiresIn: "2m" }
          );

          const refreshtoken = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            REFRESH_SECRET,
            { expiresIn: "1d" }
          );

          return res.status(200).json({
            message: "Login successful (trusted device)",
            accesstoken,
            refreshtoken,
            user
          });
        }
        if (!user.twoFactorSecret) {
          return res.status(400).json({
            message: "2FA is not enabled "
          })
        }
        return res.status(200).json({
          message: "2FA verification required",
          user: { id: user.id, email: user.email }
        });
      }
      const accesstoken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        ACCESS_SECRET,
        { expiresIn: "2m" }
      );

      const refreshtoken = jwt.sign(
        { id: user.id, email: user.email, role: user.role },
        REFRESH_SECRET,
        { expiresIn: "1d" }
      );

      return res.status(200).json({
        message: "Login successful",
        accesstoken,
        refreshtoken,
        user
      });
    } catch (err) {
      console.error("Login error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }


  async verifyTwoFA(req: Request, res: Response) {
    const { userId, code, rememberDevice } = req.body;

    const userAgent = req.headers['user-agent'];
    if (!userId || !code) {
      return res.status(400).json({ message: "userId and code are required" });
    }
    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user || !user.twoFactorSecret) {
        return res.status(404).json({ message: "User not found or 2FA not enabled" });
      }
      const isValid = TwoFA.verifyToken(user.twoFactorSecret, code);
      if (!isValid) {
        return res.status(400).json({ message: "Invalid OTP code" });
      }
      if (rememberDevice && userAgent) {
        const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        user.trustedDevices = user.trustedDevices || [];
        const exists = user.trustedDevices.find((d: any) => d.deviceId === userAgent);
        if (!exists) {
          user.trustedDevices.push({ deviceId: userAgent, createdAt: new Date(), expiresAt });
          await userRepository.save(user);
        }
      }
      const accesstoken = jwt.sign({ id: user.id }, ACCESS_SECRET, { expiresIn: "2m" });
      const refreshtoken = jwt.sign({ id: user.id }, REFRESH_SECRET, { expiresIn: "1d" });
      return res.status(200).json({
        success: true,
        message: "2FA verified",
        accesstoken,
        refreshtoken,
        user
      });
    } catch (err) {
      console.error("2FA error:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }



  async toggleTwoFA(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const { flag, code } = req.body;
    if (flag !== 0 && flag !== 1) {
      return res.status(400).json({ message: "Flag must be 0 or 1" });
    }
    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (flag === 0) {
        if (!code) return res.status(400).json({ message: "OTP code is required to disable 2FA" });
        if (!user.twoFactorSecret) return res.status(400).json({ message: "2FA not set up" });
        const isValid = TwoFA.verifyToken(user.twoFactorSecret, code);
        if (!isValid) return res.status(400).json({ message: "Invalid OTP code" });
        user.trustedDevices = [];
        user.twoFactorSecret = undefined;
      }
      user.flag = Boolean(flag);
      await userRepository.save(user);
      return res.status(200).json({
        message: "Toggle Successful",
        flag: flag,
      });
    }
    catch (err: any) {
      console.error("Error updating 2FA:", err);
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  }
  async switchOnTwoFA(req: Request, res: Response) {
    const { userId } = req.body;
    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user) return res.status(404).json({ message: "User not found" });

      const payload = { name: user.name, email: user.email };
      const { secret, uri } = await TwoFA.generateSecret(payload as any);
      user.twoFactorSecret = secret;
      await userRepository.save(user);

      const qr = await QRCode.toDataURL(uri);
      return res.status(200).json({ message: "Two-factor authentication enabled successfully",qr, otpauthUrl: uri, userId: user.id });
    } catch (err) {
      console.error("Error initiating 2FA:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
  async otpOnMail(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user || !user.twoFactorSecret) {
        return res.status(404).json({ message: "User not found or 2FA not enabled" });
      }
      const result = TwoFA.generateToken(user.twoFactorSecret);
      if (!result) {
        return res.status(500).json({ message: "Failed to generate OTP" });
      }
      const { token } = result;
      const htmlContent = `
      <h3>Your One-Time Password (OTP)</h3>
      <p>Use this code to complete your login: <strong>${token}</strong></p>
      <p>This code will expire in 30 seconds.</p>
    `;
      await sendEmail(user.email, "Your OTP Code", htmlContent);
      return res.status(200).json({ message: "OTP sent to email" });
    } catch (err) {
      console.error("Error sending OTP email:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }






  refresh(req: Request, res: Response) {
    const { refreshtoken } = req.body;
    if (!refreshtoken) return res.status(401).json({ message: "No refresh token provided" });
    try {
      const decoded = jwt.verify(refreshtoken, REFRESH_SECRET) as { id: number; email: string };
      const newAccessToken = jwt.sign({ id: decoded.id, email: decoded.email }, ACCESS_SECRET, { expiresIn: "2m" });
      console.log(newAccessToken)
      return res.status(200).json({ accesstoken: newAccessToken });
    }
    catch {
      return res.status(403).json({ message: "Invalid or expired refresh token" });
    }
  }

  profile(req: Request, res: Response) {
    return res.status(200).json({ message: "Hello" });
  }
  async updateProfile(req: Request, res: Response) {
    const userId = Number(req.params.userId);
    const { age, gender, religion, blood_group } = req.body;
    if (!age || !gender || !religion || !blood_group) return res.status(400).json({ message: "All fields are required" });
    try {
      const user = await userRepository.findOneBy({ id: userId });
      if (!user) return res.status(404).json({ message: "User not found" });
      user.age = age;
      user.gender = gender;
      user.religion = religion;
      user.blood_group = blood_group;
      await userRepository.save(user);
      return res.status(200).json({ message: "User profile updated successfully", user });
    }
    catch (err: any) {
      return res.status(500).json({ message: "Server error", error: err.message });
    }
  }
}

export default UserController;
