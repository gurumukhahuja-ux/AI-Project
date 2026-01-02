import { atom } from "recoil"

export const setUserData = (data) => {
  localStorage.setItem("user", JSON.stringify(data))
}
export const getUserData = () => {
  const data = JSON.parse(localStorage.getItem('user'))
  return data
}
export const clearUser = () => {
  localStorage.clear()
}
const getUser = () => {
  const user = JSON.parse(localStorage.getItem('user'))
  if (user) {
    return user
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