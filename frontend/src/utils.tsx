const ID_STORAGE: string = "user_id";
const TOKEN_STORAGE: string = "session_token";

export async function send_json_backend<T>(
  endpoint: string,
  body: string,
): Promise<T> {
  return fetch("http://localhost:3000" + endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: body,
  }).then((response) => {
    if (!response.ok) {
      return Promise.reject(response.text());
    }
    return response.json();
  });
}

export function get_session_token(): [number, number] | null {
  const data = sessionStorage.getItem(TOKEN_STORAGE);

  if (data == null) {
    redirect("/login/");
    return null;
  }
  return JSON.parse(data);
}

export function get_user_id(): number | null {
  const data = sessionStorage.getItem(ID_STORAGE);

  if (data == null) {
    redirect("/login/");
    return null;
  }
  return JSON.parse(data);
}

export function set_session_info(token: [number, number], user_id: number) {
  sessionStorage.setItem(TOKEN_STORAGE, JSON.stringify(token));
  sessionStorage.setItem(ID_STORAGE, JSON.stringify(user_id));
}

export function logout() {
  sessionStorage.removeItem(TOKEN_STORAGE);
}

export function redirect(pathname: string) {
  window.location.pathname = pathname;
}
