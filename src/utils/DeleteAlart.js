import Swal from "sweetalert2";
import client_api from "./API_FETCH";

export const DeleteAlert = async (api, token, addMessage, email) => {
  return Swal.fire({
    title: "Are you sure?",
    text: `You won't be able to revert this! ${addMessage ? addMessage : " "}`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes, delete it!",
  }).then((result) => {
    if (result.isConfirmed) {
      // if (email === process.env.NEXT_PUBLIC_VISITOR_ADMIN) {
      //   Swal.fire({
      //     icon: "error",
      //     title: "Oops...",
      //     text: "You’re not the main admin. Delete not allowed.",
      //   });
      //   return false
      // }
      return client_api.delete(api, token).then((res) => {
        return res
      })
    }
  });
};