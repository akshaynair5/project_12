import { db } from "../config/firebase.config.js"; 
import { asyncHandler } from "../utils/asyncHandler.js";
import { doc, setDoc, getDoc, getDocs, collection } from "firebase/firestore";

const createOrUpdateDeliveryStatus = asyncHandler(async (req, res) => {
    const { groupId, messageId } = req.params;
    const { delivered, read, channel } = req.body;
    const userId = req.user._id;

    const deliveryRef = doc(db, `groups/${groupId}/messages/${messageId}/deliveryStatus`, userId);

    await setDoc(deliveryRef, {
        userId,
        delivered: delivered ?? false,
        read: read ?? false,
        lastAttempt: new Date().toISOString(),
        channel: channel || "websocket"
    }, { merge: true });

    res.status(200).json({ success: true, message: "Delivery status updated" });
});

const listDeliveryStatusForMessage = asyncHandler(async (req, res) => {
    const { groupId, messageId } = req.params;
    const deliveryStatusRef = collection(db, `groups/${groupId}/messages/${messageId}/deliveryStatus`);
    const snapshot = await getDocs(deliveryStatusRef);

    const statuses = [];
    snapshot.forEach(doc => statuses.push({ _id: doc.id, ...doc.data() }));

    res.status(200).json({ success: true, statuses });
});

const getDeliveryStatusForUser = asyncHandler(async (req, res) => {
    const { groupId, messageId, userId } = req.params;
    const deliveryRef = doc(db, `groups/${groupId}/messages/${messageId}/deliveryStatus`, userId);
    const statusDoc = await getDoc(deliveryRef);

    if (!statusDoc.exists()) {
        return res.status(404).json({ success: false, message: "Delivery status not found" });
    }

    res.status(200).json({ success: true, status: statusDoc.data() });
});

export {
    createOrUpdateDeliveryStatus,
    listDeliveryStatusForMessage,
    getDeliveryStatusForUser
};
