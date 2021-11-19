import { API_URL } from "../config.js";
import { multiFetch, showAlertPanel, hideAlertPanel } from "../helper.js";
import { state } from "../state.js";

export const getUserData = () => {
    return state.user;
}

export const editProfile = async (data) => {

    hideAlertPanel("#edit-profil-form-alert");

    const isValid = await multiFetch(`${API_URL}/users/control`, "POST", { password: data.currPassword, email: state.user.email });

    if (!isValid.data.status) {
        showAlertPanel(
            "#edit-profil-form-alert",
            "danger",
            "HIBA!",
            ` ${isValid.data.message}`,
            0
        );
        return {
            status: isValid.data.status,
        };
    }

    const file = data.avatar.files[0];

    if (file) {
        const formData = new FormData();
        formData.append('profile', file);
        const resp = await multiFetch(`${API_URL}/users/avatar`, "POST", formData, true);
        // if (!resp.ok) {
        //     showAlertPanel(
        //         "#edit-profil-form-alert",
        //         "danger",
        //         "Hiba!",
        //         ` ${resp.data.message}`,
        //         0
        //     );
        //     return {
        //         status: resp.data.status,
        //     };
        // }
    }

    const resp = await multiFetch(`${API_URL}/users/patch`, "PATCH", {
        name: data.name,
        email: data.email,
        password: data.password,
        passwordconfirm: data.passwordconfirm,
        isNew: data.password.length > 0 ? true : false
    });
    if (!resp.data.status) {
        showAlertPanel(
            "#edit-profil-form-alert",
            "danger",
            "HIBA!",
            ` ${resp.data.message}`,
            0
        );
        return {
            status: resp.data.status,
        };
    } else {
        showAlertPanel(
            "#edit-profil-form-alert",
            "success",
            "KÉSZ!",
            ` ${resp.data.message}`,
            0
        );
        return {
            status: resp.data.status,
        };
    }

}


export const setAvatarPreview = async (file) => {

    const res = await multiFetch(`${API_URL}/users/avatar/preview`, "POST", file, true);
    return res;

}

export const deleteCurrentAvatar = async () => {

    const res = await multiFetch(`${API_URL}/users/avatar`, "DELETE");
    return res;

}