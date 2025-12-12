import { atom } from "recoil"

export const setUserData = (data) => {
  localStorage.setItem("user", JSON.stringify(data))
}
export const getUserData = (name) => {
  const data = JSON.parse(localStorage.getItem(name))
  return data
}
export const toggleState = atom({
  key: "toggle",
  default: { subscriptionTg: false }
})