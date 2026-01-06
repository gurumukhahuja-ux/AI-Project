import { atom } from "recoil"

const getAvatarUrl = (user) => {
  if (!user || !user.email) return "";
  const encodedName = encodeURIComponent(user.name || "User");
  const fallbackUrl = `https://ui-avatars.com/api/?name=${encodedName}&background=random&color=fff`;
  return `https://unavatar.io/${user.email}?fallback=${encodeURIComponent(fallbackUrl)}`;
};

const processUser = (user) => {
  if (user) {
    // Always attempt to set a better avatar if one isn't explicitly set, is the default, or is a relative path
    if (!user.avatar || user.avatar.includes('gravatar.com') || user.avatar === '/User.jpeg' || user.avatar.startsWith('/')) {
      user.avatar = getAvatarUrl(user);
    }
  }
  return user;
};

export const setUserData = (data) => {
  const processedData = processUser(data);
  localStorage.setItem("user", JSON.stringify(processedData))
}
export const getUserData = () => {
  const data = JSON.parse(localStorage.getItem('user'))
  return processUser(data);
}
export const clearUser = () => {
  localStorage.clear()
}
const getUser = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    return processUser(user)
  } else {
    return null
  }
}
export const toggleState = atom({
  key: "toggle",
  default: { subscripPgTgl: false, notify: false }
})

export const userData = atom({
  key: 'userData',
  default: { user: getUser() }
})