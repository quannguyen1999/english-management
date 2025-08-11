import request from "./api-config";
import { FRIENDS_LOAD_ID } from "./api-routes";

export async function getInforFriend(friendId: string) {
  return request(
    `${FRIENDS_LOAD_ID}?${new URLSearchParams({ friendId }).toString()}`
  );
}
