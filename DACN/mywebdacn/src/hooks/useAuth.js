import { useState, useEffect, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';

/**
 * Custom hook để quản lý trạng thái xác thực và thông tin người dùng từ JWT token.
 * @returns {object} - Trả về một object chứa:
 *  - `user`: Thông tin người dùng (ví dụ: { email, role }) hoặc null.
 *  - `isAuthenticated`: Boolean cho biết người dùng đã đăng nhập hay chưa.
 *  - `isAdmin`: Boolean cho biết người dùng có phải là ADMIN không.
 *  - `isLoading`: Boolean cho biết có đang trong quá trình kiểm tra token hay không.
 *  - `token`: JWT token.
 *  - `login`: Hàm để xử lý đăng nhập.
 *  - `logout`: Hàm để xử lý đăng xuất.
 */

const initialState = {
    user: null,
    isAuthenticated: false,
    isAdmin: false,
    isLoading: true, // Bắt đầu với trạng thái loading
    token: null,
};

export const useAuth = () => {
    const [auth, setAuth] = useState(initialState);

    // Hàm này sẽ là nguồn chân lý duy nhất để cập nhật state từ token
    const syncAuthState = useCallback(() => {
        const token = localStorage.getItem('jwtToken');
        try {
            if (token) {
                const decodedToken = jwtDecode(token);
                if (decodedToken.exp * 1000 < Date.now()) {
                    // Token hết hạn
                    localStorage.removeItem('jwtToken');
                    setAuth({ ...initialState, isLoading: false });
                } else {
                    // Token hợp lệ
                    const userRole = decodedToken.role;
                    setAuth({
                        user: { email: decodedToken.sub, role: userRole },
                        isAuthenticated: true,
                        isAdmin: userRole === 'ADMIN',
                        isLoading: false,
                        token: token,
                    });
                }
            } else {
                // Không có token
                setAuth({ ...initialState, isLoading: false });
            }
        } catch (error) { // Token không hợp lệ
            console.error("Lỗi giải mã token, tiến hành đăng xuất:", error);
            localStorage.removeItem('jwtToken');
            setAuth({ ...initialState, isLoading: false });
        }
    }, []); 

    // Effect để đồng bộ hóa trạng thái khi tải trang và khi storage thay đổi
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        syncAuthState(); // Kiểm tra lần đầu khi hook được sử dụng
        window.addEventListener('storage', syncAuthState); // Lắng nghe sự kiện từ các tab khác

        return () => {
            window.removeEventListener('storage', syncAuthState); // Dọn dẹp khi component unmount
        };
    }, [syncAuthState]);

    const login = useCallback((token) => {
        localStorage.setItem('jwtToken', token);
        syncAuthState(); // Gọi hàm đồng bộ để cập nhật state
    }, [syncAuthState]);

    const logout = useCallback(() => {
        localStorage.removeItem('jwtToken');
        syncAuthState(); // Gọi hàm đồng bộ để cập nhật state
    }, [syncAuthState]);

    return { ...auth, login, logout };
};