import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { Alert, Button, CircularProgress, IconButton, Skeleton, TextField } from "@mui/material";
import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChatSide, Conversation, Message, User } from "../../types/dataTypes";
import { ModalConfig, ToggleModal } from "../../types/generalTypes";
import { notificationEvents } from "../../utils/notificationFeed";
import { requestSummary, shortAddress, STATUS_LABEL } from "../../utils/requestFormat";
import { RequestsAPI } from "../../utils/serviceRequests";
import { ServiceTile } from "../requests/ServiceVisuals";
import { useRequests } from "../requests/RequestsContext";

const POLL_MS = 8000;
const MAX_LENGTH = 2000;
/** Messages from the same sender within this window are visually grouped. */
const GROUP_MS = 5 * 60_000;

function dayLabel(iso: string, now = new Date()) {
  const date = new Date(iso);
  const startOf = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(date)) / 86_400_000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    ...(date.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

const timeLabel = (iso: string) => new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });

function mergeMessages(current: Message[], incoming: Message[]): Message[] {
  const byId = new Map(current.map((m) => [m.id, m]));
  incoming.forEach((m) => byId.set(m.id, m));
  return Array.from(byId.values()).sort((a, b) => {
    // Unsent messages stay at the bottom in send order.
    if (a.pending !== b.pending) return a.pending ? 1 : -1;
    return a.createdAt.localeCompare(b.createdAt);
  });
}

export default function ChatThread({
  conversationId,
  userData,
  toggleModal,
}: {
  conversationId: string;
  userData: User;
  toggleModal: ToggleModal;
}) {
  const store = useRequests();
  const mySide: ChatSide = store.role === "gardener" ? "gardener" : "organization";
  const [conversation, setConversation] = useState<Conversation | undefined>(
    store.conversations.find((c) => c.id === conversationId),
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [olderToken, setOlderToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);
  const stickToBottom = useRef(true);
  const preserveFrom = useRef<number | null>(null);
  const { markConversationRead, upsertConversation } = store;

  const request = conversation ? store.findRequest(conversation.serviceRequestId) : undefined;

  useEffect(() => {
    if (conversation) return;
    RequestsAPI.getConversation(conversationId)
      .then((c) => (c ? setConversation(c) : setError("This conversation isn’t available.")))
      .catch(() => setError("This conversation couldn’t be loaded."));
  }, [conversation, conversationId]);

  const fetchLatest = useCallback(async () => {
    const page = await RequestsAPI.listMessages(conversationId, null, 25);
    setMessages((current) => mergeMessages(current, page.items));
    return page;
  }, [conversationId]);

  useEffect(() => {
    let cancelled = false;
    RequestsAPI.listMessages(conversationId)
      .then((page) => {
        if (cancelled) return;
        setMessages(page.items);
        setOlderToken(page.nextToken);
      })
      .catch(() => !cancelled && setError("Messages couldn’t be loaded. Check your connection."))
      .finally(() => !cancelled && setLoading(false));
    markConversationRead(conversationId);

    const poll = setInterval(() => {
      if (document.visibilityState === "visible") fetchLatest().catch(() => {});
    }, POLL_MS);
    const unsubscribe = notificationEvents.subscribe((n) => {
      if (n.type === "new-message" && n.data?.conversationId === conversationId) {
        fetchLatest()
          .then(() => markConversationRead(conversationId))
          .catch(() => {});
      }
    });
    return () => {
      cancelled = true;
      clearInterval(poll);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, fetchLatest]);

  // Keep the newest message in view unless the reader has scrolled up; keep position when older pages load.
  useLayoutEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (preserveFrom.current !== null) {
      el.scrollTop = el.scrollHeight - preserveFrom.current;
      preserveFrom.current = null;
    } else if (stickToBottom.current) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, loading]);

  const onScroll = () => {
    const el = scroller.current;
    if (el) stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
  };

  async function loadOlder() {
    if (!olderToken || loadingOlder) return;
    setLoadingOlder(true);
    try {
      const page = await RequestsAPI.listMessages(conversationId, olderToken);
      preserveFrom.current = scroller.current ? scroller.current.scrollHeight - scroller.current.scrollTop : null;
      setMessages((current) => mergeMessages(current, page.items));
      setOlderToken(page.nextToken);
    } catch {
      setError("Older messages couldn’t be loaded.");
    } finally {
      setLoadingOlder(false);
    }
  }

  async function deliver(body: string, tempId: string) {
    if (!conversation) return;
    try {
      const result = await RequestsAPI.sendMessage(userData, conversation, body);
      setMessages((current) => mergeMessages(current.filter((m) => m.id !== tempId), [result.message]));
      setConversation(result.conversation);
      upsertConversation(result.conversation);
    } catch {
      setMessages((current) => current.map((m) => (m.id === tempId ? { ...m, failed: true } : m)));
    }
  }

  function send(event?: React.FormEvent) {
    event?.preventDefault();
    const body = draft.trim();
    if (!body || !conversation) return;
    const tempId = `pending-${Date.now()}`;
    stickToBottom.current = true;
    setMessages((current) =>
      mergeMessages(current, [
        {
          id: tempId,
          conversationId,
          senderId: userData.id,
          senderName: "",
          senderSide: mySide,
          body,
          createdAt: new Date().toISOString(),
          pending: true,
        },
      ]),
    );
    setDraft("");
    deliver(body, tempId);
  }

  function retry(message: Message) {
    setMessages((current) => current.map((m) => (m.id === message.id ? { ...m, failed: false } : m)));
    deliver(message.body, message.id);
  }

  const self: ModalConfig = { type: "chat", data: { conversationId } };

  const rendered: React.ReactNode[] = [];
  messages.forEach((message, index) => {
    const prev = messages[index - 1];
    const day = dayLabel(message.createdAt);
    if (!prev || dayLabel(prev.createdAt) !== day) {
      rendered.push(
        <li key={`day-${message.id}`} className="chat-day" role="separator">
          <span>{day}</span>
        </li>,
      );
    }
    if (message.senderSide === "system") {
      rendered.push(
        <li key={message.id} className="chat-system">
          {message.body}
        </li>,
      );
      return;
    }
    const mine = message.senderSide === mySide;
    const grouped =
      prev &&
      prev.senderId === message.senderId &&
      prev.senderSide !== "system" &&
      dayLabel(prev.createdAt) === day &&
      new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() < GROUP_MS;
    const showName = !grouped && (!mine || message.senderId !== userData.id) && message.senderName;
    rendered.push(
      <li
        key={message.id}
        className={`chat-msg${mine ? " chat-msg--mine" : ""}${grouped ? " chat-msg--grouped" : ""}${message.failed ? " chat-msg--failed" : ""}`}
      >
        {showName && <span className="chat-name">{message.senderName}</span>}
        <div className="chat-bubble">{message.body}</div>
        <span className="chat-meta">
          {message.failed ? (
            <button type="button" className="chat-retry" onClick={() => retry(message)}>
              <ErrorOutlineIcon fontSize="inherit" /> Not sent · Tap to retry
            </button>
          ) : message.pending ? (
            "Sending…"
          ) : (
            timeLabel(message.createdAt)
          )}
        </span>
      </li>,
    );
  });

  return (
    <>
      {request && (
        <button
          type="button"
          className="chat-context"
          onClick={() =>
            toggleModal(true, { type: "request-details", data: { requestId: request.id }, back: self })
          }
        >
          <ServiceTile services={request.services} />
          <span className="card-body">
            <span className="card-title truncate">{requestSummary(request)}</span>
            <span className="card-sub truncate">
              {STATUS_LABEL[request.status]} · {shortAddress(request.address)}
            </span>
          </span>
          <ChevronRightIcon className="card-chevron" />
        </button>
      )}

      <div className="dialog-content chat-scroll" ref={scroller} onScroll={onScroll}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError("")}>
            {error}
          </Alert>
        )}
        {loading ? (
          <div className="chat-loading" role="status" aria-label="Loading messages">
            <Skeleton variant="rounded" width="62%" height={44} />
            <Skeleton variant="rounded" width="48%" height={44} sx={{ alignSelf: "flex-end" }} />
            <Skeleton variant="rounded" width="55%" height={44} />
          </div>
        ) : (
          <>
            {olderToken && (
              <div className="chat-older">
                <Button size="small" onClick={loadOlder} disabled={loadingOlder}>
                  {loadingOlder ? <CircularProgress size={16} /> : "Load earlier messages"}
                </Button>
              </div>
            )}
            {messages.length === 0 ? (
              <p className="chat-empty">Say hello and agree on a time for the visit.</p>
            ) : (
              <ol className="chat-list" aria-live="polite" aria-label="Messages">
                {rendered}
              </ol>
            )}
          </>
        )}
      </div>

      <form className="chat-composer" onSubmit={send}>
        <TextField
          fullWidth
          multiline
          maxRows={5}
          size="small"
          placeholder="Write a message…"
          value={draft}
          disabled={!conversation}
          inputProps={{ maxLength: MAX_LENGTH, "aria-label": "Message" }}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              send();
            }
          }}
        />
        <IconButton
          type="submit"
          className="chat-send"
          aria-label="Send message"
          disabled={!draft.trim() || !conversation}
        >
          <SendRoundedIcon />
        </IconButton>
      </form>
    </>
  );
}
