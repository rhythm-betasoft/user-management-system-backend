import { Request, Response } from "express";
import { createEvent } from "ics";
import { sendEmail } from "../utils/mail";

export class mailController {
  public async sendInviteController(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { to, subject, htmlContent, eventData } = req.body;
      console.log(req.body)
      const { error, value } = createEvent(eventData);
      if (error) {
        res.status(400).json({ error: "Invalid event data", details: error });
        return;
      }
      await sendEmail(to, subject, htmlContent, [
        { filename: "event.ics", content: value, contentType: "text/calendar" },
      ]);
      res.status(200).json({ message: "Invite sent successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to send invite" });
    }
  }
}
