import prisma from "../lib/prisma.js";

export const addMessage = async (req, res) => {
  const { userId } = req;
  const { chatId } = req.params;
  const { text } = req.body;
  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id: chatId,
      },
    });
    if (!chat) {
      res.status(404).json({ message: "Chat not found" });
    }
    const message = await prisma.message.create({
      data: {
        text,
        chatId,
        userId,
      },
    });

    await prisma.chat.update({
      where: {
        id: chatId,
      },
      data: {
        seenBy: [userId],
        lastMessage: text,
      },
    });
    res.status(201).json(message);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to add message" });
  }
};
