import prisma from "../lib/prisma.js";
export const getChats = async (req, res) => {
  const { userId } = req;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        userIDs: {
          has: userId,
        },
      },
    });
    for (const chat of chats) {
      const receiverId = chat.userIDs.find((id) => id !== userId);

      const receiver = await prisma.user.findUnique({
        where: {
          id: receiverId,
        },
        select: {
          id: true,
          username: true,
          avatar: true,
        },
      });
      chat.receiver = receiver;
    }
    res.status(200).json(chats);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get chats" });
  }
};

export const getChat = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;
  try {
    const chat = await prisma.chat.findUnique({
      where: {
        id,
        userIDs: {
          has: userId,
        },
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    await prisma.chat.update({
      where: {
        id,
      },
      data: {
        seenBy: {
          push: [userId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to get chat" });
  }
};

export const addChat = async (req, res) => {
  const { userId } = req;
  const { receiverId } = req.body;
  try {
    const chat = await prisma.chat.create({
      data: {
        userIDs: [userId, receiverId],
      },
    });

    await prisma.chat.update({
      where: {
        id: chat.id,
      },
      data: {
        seenBy: {
          push: receiverId,
        },
      },
    });
    res.status(201).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to create chat" });
  }
};

export const readChat = async (req, res) => {
  const { id } = req.params;
  const { userId } = req;
  try {
    const chat = await prisma.chat.update({
      where: {
        id,
        userIDs: {
          has: userId,
        },
      },
      data: {
        seenBy: {
          set: [userId],
        },
      },
    });
    res.status(200).json(chat);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Failed to read chat" });
  }
};
