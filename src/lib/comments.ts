export type CommentDTO = {
  id: string;
  parentId: string | null;
  authorName: string;
  body: string;
  createdAt: string;
  editedAt: string | null;
  deleted: boolean;
  status: "visible" | "pending" | "hidden";
  mine: boolean;
};

/** Maps Postgres trigger exceptions to friendly messages. */
export function dbErrorMessage(message: string) {
  if (message.includes("RATE_LIMIT:")) return message.split("RATE_LIMIT:")[1].trim();
  if (message.includes("DUPLICATE:")) return message.split("DUPLICATE:")[1].trim();
  if (message.includes("Authentication required")) return "Please sign in to comment.";
  if (message.includes("Invalid parent")) return "The comment you replied to no longer exists.";
  return "Something went wrong. Please try again.";
}
