import { useEffect } from "react";
import { Notification, User } from "../types/dataTypes";
import { SetUserData } from "../types/generalTypes";
import { DB, parseJson } from "./database";

export interface LiveNotification {
    id: string;
    type: Notification.Any["type"];
    data: Record<string, any>;
}

type Listener = (notification: LiveNotification) => void;
const listeners = new Set<Listener>();

/** In-app fan-out of notifications pushed over the AppSync socket. */
export const notificationEvents = {
    emit(notification: LiveNotification) {
        listeners.forEach((listener) => listener(notification));
    },
    subscribe(listener: Listener) {
        listeners.add(listener);
        return () => {
            listeners.delete(listener);
        };
    },
};

const RECONNECT_MS = 5000;

/**
 * Keeps one notification socket open for the signed-in user: refreshes user data
 * (badges, activity feed) and re-emits each notification for feature listeners.
 */
export function useNotificationSocket(setUserData: SetUserData) {
    useEffect(() => {
        let socket: WebSocket | undefined;
        let disposed = false;
        let retry: ReturnType<typeof setTimeout> | undefined;

        const connect = () => {
            DB.subscribeToNotification((raw: any) => {
                if (raw?.type) {
                    notificationEvents.emit({
                        id: raw.id,
                        type: raw.type,
                        data: parseJson(raw.data) ?? {},
                    });
                }
                DB.getUser()
                    .then((user: User | void) => {
                        if (user && !disposed) setUserData(user);
                    })
                    .catch(() => {});
            })
                .then((sock) => {
                    if (disposed) return sock.close();
                    socket = sock;
                    sock.addEventListener("close", () => {
                        if (!disposed) retry = setTimeout(connect, RECONNECT_MS);
                    });
                })
                .catch(() => {
                    if (!disposed) retry = setTimeout(connect, RECONNECT_MS * 6);
                });
        };

        connect();
        return () => {
            disposed = true;
            clearTimeout(retry);
            socket?.close();
        };
    }, [setUserData]);
}
