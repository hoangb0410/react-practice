# Hướng dẫn dựng lại Auth Module của Pink Story trên `react-code-base`

> Tài liệu này được viết bằng cách đọc **ba nơi**: base `react-code-base` hiện tại (commit `65bcb36 feat: project initiation`), frontend `pink-story-app` (đáp án để đối chiếu) và backend `pink-story-api` (hợp đồng API thật). Mọi endpoint, body, response, cookie và rule validate bên dưới đều đã đối chiếu với code của backend tại thời điểm viết.

> Bản này **thay thế hoàn toàn** bản cũ. Bản cũ giả định base còn `src/enums`, `src/pages`, `yup`, `ETypeToast`… Base bây giờ đã rút gọn hơn nhiều, nên nhiều bước đổi từ "sửa" thành "tạo mới", và một số quyết định kỹ thuật cũng đổi theo. Đọc mục 0.3 trước để biết các quyết định đó.

---

## Mục lục

- [0. Cách dùng tài liệu này](#0-cách-dùng-tài-liệu-này)
  - [0.1. Base cho sẵn những gì](#01-base-cho-sẵn-những-gì)
  - [0.2. Base KHÔNG có gì](#02-base-không-có-gì)
  - [0.3. Bốn quyết định khác với `pink-story-app`](#03-bốn-quyết-định-khác-với-pink-story-app)
- [1. Bức tranh tổng thể](#1-bức-tranh-tổng-thể)
- [2. Kiến thức nền cần nắm](#2-kiến-thức-nền-cần-nắm)
- [3. Hợp đồng với backend `pink-story-api`](#3-hợp-đồng-với-backend-pink-story-api)
- [4. Lộ trình dựng lại theo 14 bước](#4-lộ-trình-dựng-lại-theo-14-bước)
  - [Bước 1: Enum role, bảng route, interfaces](#bước-1-enum-role-bảng-route-interfaces-)
  - [Bước 2: HTTP layer (axios)](#bước-2-http-layer-axios-)
  - [Bước 3: Redux user slice + persist](#bước-3-redux-user-slice--persist-)
  - [Bước 4: React Query hooks](#bước-4-react-query-hooks-)
  - [Bước 5: Validation schema (zod)](#bước-5-validation-schema-zod-)
  - [Bước 6: UI primitives + nâng cấp toast](#bước-6-ui-primitives--nâng-cấp-toast-)
  - [Bước 7: Router, layout, guard theo role, trang Home/Profile](#bước-7-router-layout-guard-theo-role-trang-homeprofile-)
  - [Bước 8: Trang Đăng nhập](#bước-8-trang-đăng-nhập-signin-)
  - [Bước 9: Đăng ký bước 1 — form Register](#bước-9-đăng-ký-bước-1--form-register-)
  - [Bước 10: Đăng ký bước 2 — VerifyOtp](#bước-10-đăng-ký-bước-2--verifyotp-)
  - [Bước 11: Đăng xuất](#bước-11-đăng-xuất-sign-out-)
  - [Bước 12: AuthBootstrap — đồng bộ profile khi F5](#bước-12-authbootstrap--đồng-bộ-profile-khi-f5-)
  - [Bước 13: Quên mật khẩu / Đặt lại mật khẩu](#bước-13-quên-mật-khẩu--đặt-lại-mật-khẩu-)
  - [Bước 14: Kiểm thử thủ công](#bước-14-kiểm-thử-thủ-công-end-to-end-)
- [5. Giải thích sâu các điểm khó](#5-giải-thích-sâu-các-điểm-khó)
- [6. Bài tập tự luyện](#6-bài-tập-tự-luyện)
- [7. Lỗi thường gặp](#7-lỗi-thường-gặp)
- [8. Phụ lục](#8-phụ-lục)

---

## 0. Cách dùng tài liệu này

**Cách học được khuyến nghị:**

1. Làm trên `react-code-base` ở nhánh mới (ví dụ `learn/pink-story-auth`). Không sửa `pink-story-app`, đó là "đáp án" để đối chiếu khi bí.
2. Làm theo từng bước, **gõ lại chứ không copy**. Đọc phần 💡 trước khi qua bước tiếp.
3. Cuối mỗi bước có **Checkpoint**. Làm xong mới chuyển bước.
4. Chạy backend `pink-story-api` ở port 3000. Backend chỉ cho origin `http://localhost:4001`, nên FE **phải chạy port 4001**. File `.env` của base **đã đặt sẵn** đúng giá trị (xem mục 3.1), không phải sửa.
5. Dùng **Node 22** (`nvm use`, base ghim trong `.nvmrc` và `engines`) và **Git 2.32+**. Node 20 sẽ bị `yarn` từ chối chạy script ngay từ đầu.
6. Không dùng `yarn generate:module` cho auth. Generator đó dựng module dạng "danh sách có phân trang", không hợp với form đăng nhập.

**Ký hiệu:**

- 🟢 = bắt buộc cho phiên bản cơ bản.
- 🟡 = có trong `pink-story-app`, nên hiểu nhưng có thể làm sau.
- 💡 = giải thích khái niệm.
- **[M]** = file mới bạn tạo. **[S]** = file có sẵn bạn sửa. **[=]** = có sẵn, chỉ đọc.

### 0.1. Base cho sẵn những gì

| Base đã có                                          | Bước | Việc của bạn                                       |
| --------------------------------------------------- | ---- | -------------------------------------------------- |
| `src/redux/` (store, user slice, persist, hooks)    | 3    | Đọc hiểu, không sửa                                |
| `src/api/axiosInstance.ts`, `axiosService.ts`       | 2    | Sửa 2 chỗ: header ngôn ngữ và cờ `_skipAuthLogout` |
| `src/api/__tests__/axiosInstance.test.ts`           | 2    | Sửa cho khớp sau khi đổi header                    |
| `src/constants/auth.ts`                             | 2    | Đổi đường dẫn refresh, dùng lại `API_PREFIX`       |
| `src/constants/common.ts`                           | 2    | Thêm hằng `API_PREFIX`                             |
| `src/constants/routes.ts` (`ROUTES` chỉ có 2 key)   | 1    | Thêm các route auth và route theo role             |
| `src/interfaces/user.interface.ts` (`IUserInfo`)    | 1    | Sửa cho khớp user của backend                      |
| `src/interfaces/common.interface.ts`                | 1    | Đọc, dùng `IAppResponse`                           |
| `src/types/common.types.ts` (`IAppMutationOptions`) | 4    | Dùng luôn                                          |
| `src/hooks/useAppToast.tsx` (+ test)                | 6    | Thêm tham số `fallback` cho `showServerSuccessMsg` |
| `src/hooks/useAuthLogoutListener.ts`                | 11   | Đọc hiểu, không sửa                                |
| `src/components/common/AppRoute.tsx`                | 7    | Thêm `allowedRoles`                                |
| `src/components/layouts/AuthLayout.tsx`             | 7    | Redirect theo role                                 |
| `src/components/layouts/AppLayout.tsx`              | 11   | Thêm `UserMenu` và nút Đăng nhập cho khách         |
| `src/components/layouts/RootLayout.tsx`             | 12   | Bọc `<AuthBootstrap>`                              |
| `src/components/common/NotFound.tsx`                | 7    | Dùng luôn                                          |
| `AppInput`, `AppButton`, `AppLoader`, `Spinner`     | 6    | Dùng luôn                                          |
| `src/router/AppRouter.tsx`, `routes/`               | 7    | Thêm route, tách nhóm public / protected           |
| `src/utils/lazyImport.ts`, `getAPIErrorMsg.ts`      | 7    | Dùng luôn                                          |
| `src/translations/{en,vi}/validation.json`          | 5    | Thêm 3 key, xóa 1 key thừa                         |
| `src/react-query/index.ts` (file rỗng)              | 4    | Thay nội dung                                      |
| `.env` (`VITE_PORT=4001`, `VITE_API_URL`, `vi`)     | 0    | Đã đúng, giữ nguyên                                |

### 0.2. Base KHÔNG có gì

Tất cả những thứ dưới đây bạn sẽ tạo mới. Biết trước để không đi tìm.

- `src/enums/` — không tồn tại. Không có `EUserRole`, không có `ETypeToast`.
- `src/pages/`, `src/modules/` — không có trang nào. Vào `/` hiện tại chỉ thấy khung `AppLayout` rỗng.
- `src/validations/` — không có. Thư viện `yup` **cũng không được cài**; base dùng `zod` (đã có trong `package.json`).
- `src/api/auth/`, `src/react-query/auth/` — không có.
- `src/router/elements/`, `src/utils/route.ts` — không có.
- `src/components/one-offs/`, `src/components/common/UserMenu.tsx`, `src/hooks/useSignOut.ts` — không có.
- `src/translations/{en,vi}/auth.json` — không có. `common.json` cũng không có key `signIn`, `signOut`.

### 0.3. Bốn quyết định khác với `pink-story-app`

Vì base đã đổi, có bốn chỗ tài liệu này **cố ý** không copy y nguyên đáp án. Khi đối chiếu, bạn sẽ thấy khác ở đúng bốn điểm này.

| Chủ đề          | `pink-story-app` làm                      | Tài liệu này làm                                                                         | Lý do                                                                                          |
| --------------- | ----------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------- |
| Validate form   | `yup` + `yupResolver`                     | `zod` + `zodResolver`                                                                    | Base chỉ cài `zod`, README và cấu hình chunk của Vite đều ghim `zod`. Không cài thêm thư viện. |
| Đường dẫn route | enum `ERoute` trong `src/enums/route.ts`  | object `ROUTES` trong `src/constants/routes.ts` (đã có), mở rộng                         | Guard, `NotFound`, `useAuthLogoutListener` của base đều đang import `ROUTES` từ `@/constants`. |
| Kiểu toast      | enum `ETypeToast`, prop `typeToast`       | giữ `type: TypeOptions` của `react-toastify` như base                                    | Ít file phải sửa hơn, bài test có sẵn vẫn chạy.                                                |
| File interface  | `IUserInfo` nằm trong `auth.interface.ts` | `IUserInfo` giữ ở `user.interface.ts` (đã có), thêm `auth.interface.ts` cho form/request | README của base chỉ định "Adjust `src/interfaces/user.interface.ts` to your user shape".       |

Nếu bạn muốn bám đáp án 100% thì `yarn add yup` và dùng schema Yup trong `pink-story-app/src/validations`. Mọi thứ khác trong tài liệu vẫn áp dụng được.

---

## 1. Bức tranh tổng thể

### 1.1. Năm luồng nghiệp vụ

```
ĐĂNG KÝ (2 bước)
  Register.tsx ──POST /api/auth/register──► BE gửi OTP qua email, trả { hash }   (201)
       │ navigate('/verify-otp', { state: { hash, email } })
       ▼
  VerifyOtp.tsx ──POST /api/auth/verify-register { hash, otp }──► BE tạo user,  (201)
                                                                   set cookie, trả user
       │ setUserInfo(user) → navigate theo role
       ▼
  Đã đăng nhập

ĐĂNG NHẬP
  SignIn.tsx ──POST /api/auth/login { email, password }──► BE set cookie, trả user   (200)
       │ queryClient.clear() → setUserInfo(user) → navigate theo role
       ▼
  Đã đăng nhập ──(khi F5)──► AuthBootstrap gọi GET /api/users để lấy profile đầy đủ

ĐĂNG XUẤT
  Chủ động: UserMenu bấm "Đăng xuất" → useSignOut → POST /api/auth/logout → BE xóa cookie
            → resetUserInfo + queryClient.clear() → navigate('/sign-in')
  Bị động : request 401 → interceptor POST /api/auth/refresh → thất bại
            → phát event 'app:auth-logout' → useAuthLogoutListener → reset + navigate

QUÊN MẬT KHẨU (🟡, 2 trang)
  ForgotPassword.tsx ──POST /api/auth/forgot-password { email }──► BE gửi email chứa link
       │ BE dựng link: {frontendBaseUrl}/reset-password?token=...
       ▼
  Người dùng bấm link trong email → ResetPassword.tsx đọc ?token=
       ──POST /api/auth/reset-password { token, newPassword, confirmNewPassword }──► 200
       │ navigate('/sign-in')
       ▼
  Đăng nhập lại bằng mật khẩu mới
```

### 1.2. Luồng dữ liệu qua các tầng (ví dụ login)

```
SignIn.tsx            (UI — chỉ render)
   │
useSignInHooks.ts     (logic trang: useForm + gọi mutation + xử lý kết quả)
   │
useLoginMutation.ts   (React Query: isPending / onSuccess / onError)
   │
authApi.signIn()      (endpoint + kiểu request/response)
   │
axiosService.post()   (wrapper typed → Promise<IAppResponse<T>>)
   │
apiClient             (baseURL, withCredentials, interceptors)
   │  POST http://localhost:3000/api/auth/login  + header Accept-Language: vi
   ▼
pink-story-api        → Set-Cookie: access_token, refresh_token (HttpOnly)
                      → body { code: 200, success: true, message, data: { id, username, email, role } }
```

### 1.3. Điều hướng theo role

Backend có 3 role: `reader`, `creator`, `admin`. Sau login, FE gọi `getDefaultRouteByRole(user.role)`:

| Role      | Trang đích sau login | Ghi chú                                              |
| --------- | -------------------- | ---------------------------------------------------- |
| `reader`  | `/`                  | Đăng ký chỉ cho chọn reader hoặc creator             |
| `creator` | `/studio`            | Chưa có trang ở bản cơ bản → 404, đó là hành vi đúng |
| `admin`   | `/admin`             | Không đăng ký được, tạo bằng seed/DB                 |

### 1.4. Nguyên tắc phân tầng

| Tầng         | Thư mục               | Trách nhiệm                                       | KHÔNG được làm               |
| ------------ | --------------------- | ------------------------------------------------- | ---------------------------- |
| UI           | `modules/auth/pages`  | Render JSX, gắn field vào form                    | Gọi API, gọi Redux trực tiếp |
| Page logic   | `modules/auth/hooks`  | useForm, gọi mutation, toast, navigate, set Redux | Chứa URL endpoint, chứa JSX  |
| Server state | `react-query/auth`    | Bọc `useMutation` / `useQuery`                    | Biết về UI, navigate         |
| API          | `api/auth`            | URL endpoint + hàm gọi + kiểu dữ liệu             | Biết về React                |
| HTTP         | `api/axios*`          | baseURL, cookie, interceptor                      | Biết nghiệp vụ auth cụ thể   |
| Client state | `redux/user`          | Lưu user hiện tại, persist                        | Gọi API                      |
| Validation   | `validations`         | Schema zod, message là key i18n                   | Biết về UI                   |
| Kiểu dữ liệu | `interfaces`, `enums` | Hợp đồng dữ liệu dùng chung                       | Chứa logic                   |

---

## 2. Kiến thức nền cần nắm

Mỗi mục dưới đây là **bản tóm tắt một dòng**, đủ cho người đã biết React đọc được code ở bước tương ứng.

> 🧭 **Nếu bạn mới học React**, mục này quá mỏng. Mở [`react-fundamentals.md`](./react-fundamentals.md): file đó giải thích từ đầu mọi khái niệm ở đây (`useState` là gì, vì sao `useEffect` cần dependency array, `Controller` làm gì, Redux khác React Query ở đâu, cookie HttpOnly là gì…), có ví dụ lấy thẳng từ module auth, và có bảng "bước nào cần đọc mục nào" ở cuối. Đọc đúng mục cần cho bước sắp làm, rồi quay lại đây.

### 2.1. React cơ bản

- **Component & props**, **`useState`**, **`useEffect`** (side-effect: gắn/gỡ event listener, gọi API khi mount).
- **Custom hook**: hàm bắt đầu bằng `use`, gom logic tái sử dụng. Codebase gom **toàn bộ logic của một trang** vào một hook (`useSignInHooks`), trang chỉ còn JSX.
- **`forwardRef`**: cho component cha truyền `ref` xuống `<input>`. `react-hook-form` cần nó để focus vào field lỗi. `AppInput` của base đã làm sẵn.
- **`lazy` + `Suspense`**: tách mỗi trang thành chunk riêng, tải khi cần. Base có helper `lazyImport` cho named export.

### 2.2. React Router v7

- `createBrowserRouter([...])` nhận **cây route** dạng object; route cha render `<Outlet />` để hiển thị con. Route không có `path` (pathless) chỉ dùng để bọc layout.
- `<Navigate to replace />`: redirect. `replace` = không thêm vào history.
- `useNavigate()`: điều hướng bằng code, có thể kèm `state`: `navigate('/verify-otp', { state: { hash } })`.
- `useLocation().state`: đọc lại `state` ở trang đích. Đây là cách `Register` truyền `hash` cho `VerifyOtp` mà không lộ lên URL.
- `useSearchParams()`: đọc query string. `ResetPassword` dùng để lấy `?token=`.

### 2.3. react-hook-form + zod

- `useForm({ defaultValues, resolver, mode })` → `control`, `handleSubmit`, `formState.errors`, `reset`.
- `<Controller name control render />`: nối input tùy biến vào form. `field` = `{ value, onChange, onBlur, name, ref }`.
- `mode: 'onTouched'`: validate lần đầu khi blur, sau đó mỗi lần gõ.
- `zodResolver(schema)` (từ `@hookform/resolvers/zod`): chuyển schema zod thành hàm validate.
- zod **v4** (base cài `4.4.x`): tham số thứ hai dạng chuỗi là message: `z.string().min(1, 'emailRequired')`. Với `z.enum` và `.refine` dùng object `{ error: 'key' }`. Rule "hai field phải bằng nhau" viết bằng `.refine(...)` ở cấp object, kèm `path` để gắn lỗi vào đúng field.
- **Message lỗi zod là key i18n** (`'emailRequired'`), UI gọi `t(key)`.

### 2.4. TanStack React Query v5

- **Mutation** = POST/PUT/DELETE: `useMutation({ mutationFn, onSuccess, onError })` → `mutate`, `isPending`.
- **Query** = GET: `useQuery({ queryKey, queryFn, enabled })`. `enabled: false` = không tự gọi.
- `queryClient.clear()` xóa toàn bộ cache; `invalidateQueries({ queryKey })` đánh dấu cũ để fetch lại.
- Base tạo **một** `queryClient` dùng chung trong `src/constants/queryClient.ts` và cấp qua `RootLayout`.

### 2.5. Redux Toolkit + redux-persist

- `createSlice` sinh actions + reducer; bên trong được "mutate" nhờ Immer.
- `redux-persist` lưu slice vào `localStorage` (key `persist:user`) và **rehydrate** khi F5. `<PersistGate>` chờ nạp xong mới render.

### 2.6. Axios

- `withCredentials: true`: **bắt buộc** để trình duyệt gửi/nhận cookie khi FE (4001) và BE (3000) khác origin.
- **Interceptor request**: thêm header `Accept-Language` (base đang gửi `?lang=`, bạn sẽ đổi).
- **Interceptor response**: unwrap `res.data`; bắt 401 → refresh → retry. Base đã viết sẵn phần này.

### 2.7. 💡 Cookie HttpOnly và vì sao FE dựa vào Redux

Backend set 2 cookie `access_token` và `refresh_token` với `httpOnly: true`. JS **không đọc được** chúng. Vì vậy FE không thể biết "đã login chưa" bằng cookie, mà dùng **Redux user (persist)** làm cờ. Cookie lo xác thực với server; Redux lo hiển thị UI.

Chi tiết cookie từ backend (`src/utils/helpers/token.helper.ts`):

| Cookie          | httpOnly | sameSite | path                | Ghi chú                                |
| --------------- | -------- | -------- | ------------------- | -------------------------------------- |
| `access_token`  | true     | strict   | `/`                 | Hết hạn ngắn                           |
| `refresh_token` | true     | strict   | `/api/auth/refresh` | Chỉ được gửi kèm đúng endpoint refresh |

`secure` chỉ bật ở production, nên chạy `http://localhost` vẫn nhận cookie.

### 2.8. styled-components & i18next

- Prop bắt đầu bằng `$` (`$active`, `$hasError`) là transient prop, không đẩy xuống DOM.
- `t('verifyOtpSubtitle', { email })` — interpolation: JSON có `{{email}}`.
- Base gộp mọi file JSON dịch vào một namespace `translation` (xem `src/translations/en/index.ts`). Thêm file mới = thêm một dòng spread.

---

## 3. Hợp đồng với backend `pink-story-api`

### 3.1. Cấu hình `.env` của FE

File `.env` trong base **đã có sẵn** các giá trị sau. Chỉ kiểm tra, không sửa:

```env
VITE_PORT=4001                      # BẮT BUỘC 4001 — backend chỉ cho origin này
VITE_API_URL=http://localhost:3000  # phải có http://
VITE_ENV=DEVELOP
VITE_LANGUAGE=vi
```

Các biến `VITE_SOCKET_URL`, `VITE_PUBLIC_POSTHOG_*` còn sót trong `.env` không sao: `src/constants/env.ts` dùng `z.object` nên bỏ qua key lạ.

### 3.2. Endpoint auth (đọc từ `auth.controller.ts` và `users.controller.ts`)

Prefix chung là `/api`. Cột "HTTP" là status khi thành công.

| Method | Path                        | Body                                                                          | `data` trả về                      | HTTP | Cookie                   |
| ------ | --------------------------- | ----------------------------------------------------------------------------- | ---------------------------------- | ---- | ------------------------ |
| POST   | `/api/auth/register`        | `{ username, email, password, confirmPassword, role, firstName?, lastName? }` | `{ hash }`                         | 201  | —                        |
| POST   | `/api/auth/verify-register` | `{ hash, otp }`                                                               | `{ id, username, email, role }`    | 201  | **Set** access + refresh |
| POST   | `/api/auth/login`           | `{ email, password }`                                                         | `{ id, username, email, role }`    | 200  | **Set** access + refresh |
| POST   | `/api/auth/logout`          | —                                                                             | `null`, message nằm ở `message`    | 200  | **Clear** cả hai         |
| POST   | `/api/auth/refresh`         | —                                                                             | `{ id, username, email, role }`    | 200  | **Set** cả hai (xoay)    |
| GET    | `/api/users`                | —                                                                             | User đầy đủ (firstName, avatar, …) | 200  | Cần `access_token`       |
| POST   | `/api/auth/forgot-password` | `{ email }`                                                                   | `null`, message ở `message`        | 200  | —                        |
| POST   | `/api/auth/reset-password`  | `{ token, newPassword, confirmNewPassword }`                                  | `null`, message ở `message`        | 200  | —                        |

> ⚠️ **Login, verify-register và refresh chỉ trả 4 field** `id, username, email, role`. Không có `firstName`, `avatar`. Đó là lý do có `AuthBootstrap` (bước 12) gọi `GET /api/users` để lấy profile đầy đủ.

### 3.3. Hình dạng response (từ `TransformInterceptor` và `HttpExceptionFilter`)

Thành công:

```json
{
  "code": 200,
  "success": true,
  "message": "Đăng nhập thành công",
  "data": { "id": 1, "username": "hoang", "email": "a@b.com", "role": "reader" }
}
```

Thất bại (ví dụ sai mật khẩu, HTTP 400):

```json
{
  "code": 400,
  "success": false,
  "message": "Mật khẩu không đúng",
  "errors": "Mật khẩu không đúng"
}
```

`getAPIErrorMsg` của base đọc `errors` trước, rồi `message`. Message đã được backend dịch theo header `Accept-Language`.

### 3.4. Rule validate phía backend (`auth.constant.ts`, `register.dto.ts`)

| Field    | Rule backend                                                      | Rule FE (zod) trong tài liệu này          |
| -------- | ----------------------------------------------------------------- | ----------------------------------------- |
| username | 3–50 ký tự                                                        | required, max 50                          |
| email    | 5–100, đúng định dạng; backend tự lowercase + trim                | required, regex `EMAIL_REGEX`             |
| password | 6–32, có chữ thường, chữ hoa, số; chỉ cho phép `a-zA-Z0-9@$!%*?&` | 8–32, hoa, thường, số, **ký tự đặc biệt** |
| role     | chỉ `reader` hoặc `creator`                                       | `z.enum([READER, CREATOR])`               |

💡 FE chặt hơn backend (min 8 và bắt buộc ký tự đặc biệt), theo đúng `pink-story-app`. Điều này hợp lệ: FE chặt hơn thì mọi thứ qua FE đều qua BE. Nhưng nếu tài khoản seed có mật khẩu `Password123` (không ký tự đặc biệt), form login sẽ **không cho gửi**. Xem bài tập 6.1.

### 3.5. CORS & cookie phía backend (`main.ts`)

```ts
app.enableCors({
  origin: ['http://localhost:4001', 'https://app.yourdomain.com'],
  credentials: true,
});
app.use(cookieParser());
```

Origin là danh sách cụ thể, không phải `*`. Đây là điều kiện để cookie hoạt động với `withCredentials`.

### 3.6. Riêng cho quên mật khẩu (`auth.service.ts`)

- `forgot-password` có **cooldown** theo email (`tokenConfig.resetPasswordCooldown` phút). Gửi lại quá sớm → HTTP **429**, message đã dịch. FE chỉ cần `showServerErrorMsg`.
- Backend trả cùng message dù email có tồn tại hay không (chống dò tài khoản).
- Link trong email: `${applicationConfig.frontendBaseUrl}/reset-password?token=<token>`. Cấu hình `frontendBaseUrl` của backend phải trỏ về `http://localhost:4001` thì bấm link mới về đúng FE của bạn.
- `reset-password` kiểm tra `newPassword === confirmNewPassword` lần nữa ở BE, token dùng một lần.
- OTP đăng ký hết hạn sau `OTP_EXPIRATION_MINUTES` phút (mặc định 5).

---

## 4. Lộ trình dựng lại theo 14 bước

### Bước 1: Enum role, bảng route, interfaces 🟢

**Mục tiêu:** Định nghĩa "hợp đồng" dữ liệu trước; mọi tầng khác import từ đây.

**Files:**

```
src/enums/user.ts                    [M]
src/enums/index.ts                   [M]
src/constants/routes.ts              [S]
src/interfaces/user.interface.ts     [S]
src/interfaces/auth.interface.ts     [M]
src/interfaces/index.ts              [S]
```

**`src/enums/user.ts`** — role **chữ thường**, khớp enum của backend:

```ts
export enum EUserRole {
  READER = 'reader',
  CREATOR = 'creator',
  ADMIN = 'admin',
}
```

```ts
// src/enums/index.ts
export * from './user';
```

**`src/constants/routes.ts`** — base đang có 2 key `ROOT`, `SIGN_IN`. Mở rộng, giữ `as const` để `RoutePath` vẫn là union chuỗi:

```ts
/** Route paths shared by the router, guards and redirects. */
export const ROUTES = {
  ROOT: '/',
  SIGN_IN: '/sign-in',
  SIGN_UP: '/sign-up',
  VERIFY_OTP: '/verify-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PROFILE: '/profile',
  STUDIO: '/studio',
  ADMIN: '/admin',
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
```

**`src/interfaces/user.interface.ts`** — base đang có `{ id, email?, fullName?, avatar? }`. Thay bằng hình dạng của backend. `email` không còn optional; `fullName` bỏ đi vì backend tách `firstName` / `lastName`:

```ts
import { EUserRole } from '@/enums';

/** User shape returned by pink-story-api. Login only fills 4 fields; GET /api/users fills the rest. */
export interface IUserInfo {
  id: string | number;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarId?: number;
  avatar?: string;
  role?: EUserRole;
  createdAt?: string;
  updatedAt?: string;
}
```

**`src/interfaces/auth.interface.ts`** — file mới, khớp DTO backend từng field:

```ts
import { EUserRole } from '@/enums';
import { IUserInfo } from './user.interface';

// ---- Đăng nhập ----
export interface ISignInFormValues {
  email: string;
  password: string;
}

// ---- Đăng ký bước 1 ----
export interface IRegisterFormValues {
  username: string;
  email: string;
  password: string;
  confirmPassword: string; // backend có nhận field này (RegisterDto)
  role: EUserRole.READER | EUserRole.CREATOR; // đúng như RegisterDto của backend
  firstName?: string;
  lastName?: string;
}

export interface IRegisterResponse {
  hash: string; // chuỗi mã hoá chứa thông tin đăng ký + OTP + hạn
}

// ---- Đăng ký bước 2 ----
export interface IVerifyRegisterBody {
  hash: string;
  otp: string;
}

// ---- Quên mật khẩu (bước 13) ----
export interface IForgotPasswordFormValues {
  email: string;
}

export interface IResetPasswordFormValues {
  newPassword: string;
  confirmNewPassword: string;
}

export interface IResetPasswordBody extends IResetPasswordFormValues {
  token: string; // lấy từ ?token= trên URL
}

// login / verify-register / refresh đều trả về user (4 field cơ bản)
export type ISignInResponse = IUserInfo;
```

```ts
// src/interfaces/index.ts
export * from './common.interface';
export * from './user.interface';
export * from './auth.interface';
```

💡 **Quy ước đặt tên.** Ba hậu tố, ba vai trò:

| Hậu tố        | Là gì                          | Khi nào tách riêng                                     |
| ------------- | ------------------------------ | ------------------------------------------------------ |
| `FormValues`  | Đúng các ô người dùng gõ       | Luôn có, nếu màn đó dùng `useForm`                     |
| `Body`        | Đúng những gì gửi lên API      | Chỉ khi khác `FormValues` (thừa/thiếu field)           |
| `Response`    | Đúng những gì API trả về       | Khi không tái dùng được interface có sẵn               |

Ở đây `signIn` và `register` có form trùng khít body (backend **có** nhận `confirmPassword`), nên chỉ cần một `FormValues`, không tạo `Body` thừa. Ngược lại `IResetPasswordBody extends IResetPasswordFormValues` vì body có thêm `token` lấy từ URL, không phải ô gõ. Còn `IVerifyRegisterBody` mang hậu tố `Body` vì màn OTP không dùng `useForm`, và `hash` đến từ `location.state`.

💡 **Vì sao `IUserInfo` có nhiều field optional?** Vì login chỉ trả 4 field, còn `GET /api/users` trả đầy đủ. Cùng một interface phải chứa được cả hai trạng thái.

💡 **Vì sao `role` trong form là `READER | CREATOR` chứ không phải `EUserRole`?** Vì backend chỉ chấp nhận hai giá trị đó khi đăng ký. Thu hẹp kiểu ở đây làm schema zod (bước 5) khớp kiểu form mà không phải ép kiểu.

**✅ Checkpoint 1:** `yarn typecheck` sạch. Bạn giải thích được `IAppResponse<IRegisterResponse>` là object dạng `{ code, success, message, data: { hash } }`.

---

### Bước 2: HTTP layer (axios) 🟢

**Files:**

```
src/constants/auth.ts                          [S]
src/api/axiosInstance.ts                       [S]
src/api/__tests__/axiosInstance.test.ts        [S]
src/global.d.ts                                [S]
src/api/axiosService.ts                        [=]
src/api/auth/auth.endpoint.ts                  [M]
src/api/auth/authApi.ts                        [M]
src/api/auth/index.ts                          [M]
src/api/index.ts                               [S]
```

Base đã có sẵn `axiosInstance.ts` gần đầy đủ: `withCredentials`, unwrap `res.data`, hàng đợi refresh khi 401, phát sự kiện đăng xuất. Bạn không viết lại, chỉ sửa ba chỗ.

#### 2.1. Hằng `API_PREFIX` và đường dẫn refresh

Mọi endpoint của `pink-story-api` đều bắt đầu bằng `/api` (backend đặt `app.setGlobalPrefix`). Viết cứng chuỗi đó ở từng dòng thì vừa lặp vừa dễ gõ sai, nên tách ra một hằng dùng chung ngay từ đầu.

Thêm vào `src/constants/common.ts` (file đã có sẵn và đã được barrel export, nên không phải sửa `constants/index.ts`):

```ts
// src/constants/common.ts — thêm dòng này, giữ nguyên phần còn lại
export const API_PREFIX = '/api';
```

Rồi sửa `src/constants/auth.ts` cho dùng lại nó, đồng thời đổi đường dẫn refresh cho khớp backend:

```ts
// src/constants/auth.ts
import { API_PREFIX } from './common'; // KHÔNG import từ '@/constants'

export const AUTH_REFRESH_PATH = `${API_PREFIX}/auth/refresh`; // base để '/api/auth/refresh-token'
export const AUTH_PATH_PREFIX = `${API_PREFIX}/auth/`; // giữ nguyên giá trị
```

⚠️ Chú ý dòng import: phải là `'./common'`, **không** phải `'@/constants'`. `constants/index.ts` đang export chính `auth.ts`, nên trỏ ngược lại vào barrel sẽ tạo import vòng (`index → auth → index`). Trong cùng một thư mục thì luôn import thẳng vào file.

💡 Vì sao đặt ở `common.ts` chứ không tạo `constants/api.ts` mới? Chỉ để đỡ một file và đỡ một dòng barrel. Nếu sau này hằng liên quan tới HTTP nhiều lên, tách ra file riêng cũng được, nhớ thêm `export * from './api';` vào `constants/index.ts`.

#### 2.2. Gửi ngôn ngữ bằng header thay cho query

Base đẩy `?lang=` vào query vì backend cũ đọc query. `pink-story-api` đọc header `Accept-Language`. Trong `src/api/axiosInstance.ts`:

```ts
// base đang là:
apiClient.interceptors.request.use((req) => {
  const lang = i18n.language || 'en';
  req.params = { ...(req.params ?? {}), lang };
  return req;
});

// đổi thành:
apiClient.interceptors.request.use((req) => {
  const lang = i18n.language || 'en';
  req.headers.set('Accept-Language', lang);
  return req;
});
```

#### 2.3. Cờ `_skipAuthLogout`

**Cờ này là gì.** Một thuộc tính **do codebase tự đặt ra**, không phải của axios, gắn lên config của **một** request để nói: "nếu làm mới token thất bại, đừng đăng xuất người dùng, tôi tự lo."

Hành vi mặc định đang là: request nào bị 401 thì interceptor gọi `/api/auth/refresh`; refresh cũng hỏng thì coi như phiên hết thật và phát `emitAuthLogout()`, kéo theo xóa Redux và đẩy về `/sign-in`. Đúng với phần lớn request. Nhưng ở bước 12, `AuthBootstrap` gọi `GET /api/users` **mỗi lần mở app** chỉ để lấy profile đầy đủ. Đó là request thăm dò, không phải việc người dùng yêu cầu; mạng chập chờn lúc khởi động mà đá người ta ra màn hình đăng nhập thì quá tay. Nên riêng request đó xin miễn (xem thêm 5.8).

Thêm điều kiện vào nhánh `catch` của luồng refresh:

```ts
} catch (refreshError) {
  processQueue(refreshError);
  if (!originalRequest._skipAuthLogout) emitAuthLogout(); // thêm điều kiện
  return Promise.reject(refreshError);
}
```

Và khai báo cờ trong `src/global.d.ts`, cùng khối với `_retry`:

```ts
declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthLogout?: boolean; // thêm dòng này
  }
}
```

Bỏ qua bước khai báo này thì TS báo `Property '_skipAuthLogout' does not exist on type 'AxiosRequestConfig'`. Lý do và cơ chế "bổ sung kiểu cho thư viện" nằm ở [mục 1.7 của `react-fundamentals.md`](./react-fundamentals.md#17-file-dts-và-bổ-sung-kiểu-cho-thư-viện).

💡 **Cờ đi từ đâu tới đâu.** Tham số cuối của `axiosService.get/post` là config **của riêng request đó**. axios mang nguyên object config theo suốt vòng đời request, và khi lỗi thì gắn lại vào `error.config`. Interceptor lấy ra thành `originalRequest`, nên nó đọc được cờ mà bạn đã gắn từ lúc gọi. Không gắn thì giá trị là `undefined`, `!undefined` là `true`, và logout chạy như cũ. Cờ `_retry` ngay trên cũng cùng kỹ thuật nhưng khác mục đích: đánh dấu "request này đã thử lại một lần rồi" để tránh vòng refresh vô hạn. Dấu gạch dưới đầu tên là quy ước nói "của chúng ta, không phải của axios".

> ⚠️ **Sửa xong bạn sẽ thấy app không đổi gì.** Đúng vậy: chưa request nào gắn cờ nên nhánh logout vẫn chạy y như trước. Nó chỉ bắt đầu có nghĩa từ mục 2.6 (`getCurrentUserProfile` gắn `_skipAuthLogout: true`) và thực sự dùng tới ở bước 12. Guide thêm sớm ở đây vì đang sửa dở `axiosInstance.ts`, làm một lần cho xong.

#### 2.4. Sửa bài test có sẵn

`src/api/__tests__/axiosInstance.test.ts` đang kiểm tra query `lang` và chuỗi `refresh-token`. Sau khi đổi, test sẽ đỏ. Sửa ba chỗ:

1. Mock `@/constants`: `AUTH_REFRESH_PATH: '/api/auth/refresh'`.
2. Hai chỗ `'refresh-token'` (một trong adapter của test "does NOT auto-refresh", một trong `expect.stringContaining`) → `'/api/auth/refresh'`.
3. Thay test đầu tiên:

> Mock ở đây vẫn ghi chuỗi đầy đủ, **không** cần thêm `API_PREFIX`. Lý do: `vi.mock('@/constants', ...)` thay cả module bằng object bạn viết, và `axiosInstance.ts` chỉ đọc `AUTH_REFRESH_PATH`, `AUTH_PATH_PREFIX`, `config` chứ không đọc `API_PREFIX`. Chỉ khi nào bạn cho `axiosInstance.ts` import thêm hằng nào từ `@/constants` thì mới phải khai báo hằng đó trong mock, nếu không giá trị sẽ là `undefined`.

```ts
it('sends Accept-Language header from i18n', async () => {
  let capturedLang: unknown;
  setAdapter(async (cfg) => {
    capturedLang = cfg.headers.get('Accept-Language');
    return buildResponse(cfg, 200, { ok: true });
  });

  await apiClient.get('/api/ping');
  expect(capturedLang).toBe('vi');
});
```

#### 2.5. `axiosService.ts` (đọc)

Interceptor đã unwrap nên giá trị thật không còn là `AxiosResponse`. Wrapper này **ép kiểu về đúng `IAppResponse<TRes>`** cho toàn app. Mọi hàm trong `authApi` đều đi qua nó.

#### 2.6. `auth.endpoint.ts` + `authApi.ts`

```ts
// src/api/auth/auth.endpoint.ts — khớp auth.controller.ts và users.controller.ts
import { API_PREFIX } from '@/constants';

const AUTH = `${API_PREFIX}/auth`;

export enum EAuthEndpoint {
  SIGN_IN = `${AUTH}/login`,
  REGISTER = `${AUTH}/register`,
  VERIFY_REGISTER = `${AUTH}/verify-register`,
  SIGN_OUT = `${AUTH}/logout`,
  GET_NEW_TOKENS = `${AUTH}/refresh`,
  FORGOT_PASSWORD = `${AUTH}/forgot-password`,
  RESET_PASSWORD = `${AUTH}/reset-password`,
  GET_CURRENT_USER_PROFILE = `${API_PREFIX}/users`, // GET không có id = user hiện tại
}
```

💡 **Enum mà dùng được template literal?** Được, nhưng chỉ từ TypeScript 5 trở đi; dự án đang dùng TS 6 nên yên tâm. Nhiều bài viết cũ trên mạng bảo string enum bắt buộc phải là chuỗi viết cứng, đó là thông tin của các bản TS cũ. Kiểu suy ra vẫn chính xác: `EAuthEndpoint.SIGN_IN` có kiểu `'/api/auth/login'` chứ không tụt xuống `string`.

Hai tầng hằng là có chủ đích. `API_PREFIX` dùng chung cho mọi module; `AUTH` chỉ sống trong file này, gom riêng nhóm `/auth`. Dòng `GET_CURRENT_USER_PROFILE` không thuộc nhóm đó nên ghép thẳng từ `API_PREFIX`.

> Ở đây import từ `'@/constants'` được, khác với `constants/auth.ts` ở bước 2.1, vì file này nằm **ngoài** thư mục `constants` nên không tạo import vòng.

Các module sau (`category`, `story`…) làm y hệt: import `API_PREFIX`, đặt một hằng nhóm, rồi ghép. Nếu bạn dùng `yarn generate:module`, sửa `plop-templates/endpoint.hbs` cho khớp mẫu này, nếu không file sinh ra sẽ lại viết cứng `/api/`.

```ts
// src/api/auth/authApi.ts
import {
  IForgotPasswordFormValues,
  IRegisterFormValues,
  IRegisterResponse,
  IResetPasswordBody,
  ISignInFormValues,
  ISignInResponse,
  IUserInfo,
  IVerifyRegisterBody,
} from '@/interfaces';
import { axiosService } from '../axiosService';
import { EAuthEndpoint } from './auth.endpoint';

export const authApi = {
  signIn: (body: ISignInFormValues) =>
    axiosService.post<ISignInResponse, ISignInFormValues>(
      EAuthEndpoint.SIGN_IN,
      body
    ),

  register: (body: IRegisterFormValues) =>
    axiosService.post<IRegisterResponse, IRegisterFormValues>(
      EAuthEndpoint.REGISTER,
      body
    ),

  verifyRegister: (body: IVerifyRegisterBody) =>
    axiosService.post<ISignInResponse, IVerifyRegisterBody>(
      EAuthEndpoint.VERIFY_REGISTER,
      body
    ),

  signOut: () => axiosService.post<void>(EAuthEndpoint.SIGN_OUT),

  refreshToken: () => axiosService.post<void>(EAuthEndpoint.GET_NEW_TOKENS),

  forgotPassword: (body: IForgotPasswordFormValues) =>
    axiosService.post<void, IForgotPasswordFormValues>(
      EAuthEndpoint.FORGOT_PASSWORD,
      body
    ),

  resetPassword: (body: IResetPasswordBody) =>
    axiosService.post<void, IResetPasswordBody>(
      EAuthEndpoint.RESET_PASSWORD,
      body
    ),

  getCurrentUserProfile: () =>
    axiosService.get<IUserInfo>(EAuthEndpoint.GET_CURRENT_USER_PROFILE, {
      _skipAuthLogout: true, // AuthBootstrap tự xử lý khi thất bại (bước 12)
    }),
};
```

```ts
// src/api/auth/index.ts
export * from './auth.endpoint';
export * from './authApi';

// src/api/index.ts  (base có 2 dòng đầu, thêm dòng thứ 3)
export * from './axiosInstance';
export * from './axiosService';
export * from './auth';
```

**✅ Checkpoint 2**

Mục tiêu của checkpoint này: chứng minh tầng HTTP đã nối thông tới backend **trước khi** bạn dựng giao diện. Nếu đợi tới lúc có form đăng nhập mới thử, lỗi có thể nằm ở form, ở validate, ở Redux hay ở axios, và bạn sẽ không biết bắt đầu tìm từ đâu. Gọi thẳng `authApi` từ Console loại bỏ hết các tầng trên.

**Phần 1: test tự động.** Chạy `yarn test:run`, phải xanh hết, kể cả bài `axiosInstance` bạn vừa sửa ở mục 2.4.

**Phần 2: gọi thật vào backend.** Làm theo đúng thứ tự:

1. Chạy backend `pink-story-api` (port 3000) ở một cửa sổ terminal.
2. Chạy `yarn dev` ở cửa sổ khác. Terminal phải in ra `http://localhost:4001`.
3. Mở `http://localhost:4001` bằng trình duyệt. Trang trống cũng không sao, ta chỉ cần trang này để có chỗ chạy JavaScript.
4. Mở DevTools: `Cmd+Option+I` trên macOS, hoặc `F12`. Chọn tab **Console**.
5. Dán đoạn dưới rồi Enter:

```js
const { authApi } = await import('/src/api/index.ts');
authApi
  .signIn({ email: 'sai@sai.com', password: 'Abc@1234' })
  .then(console.log, console.error);
```

💡 **Đoạn này làm gì.** `await import('/src/api/index.ts')` nạp module barrel của bạn ngay trong trình duyệt; Vite dev server phục vụ file nguồn nên đường dẫn `/src/...` dùng được (alias `@/` thì **không**, vì Console không biết alias). `const { authApi } = ...` lấy ra biến `authApi` mà bạn đã export. Rồi gọi `signIn` với một email chắc chắn không tồn tại, vì ta đang muốn xem **đường đi của lỗi** chứ chưa cần đăng nhập được. `.then(console.log, console.error)` in kết quả ra: tham số một chạy khi thành công, tham số hai chạy khi thất bại.

6. Chuyển sang tab **Network** để xem request. Nếu chưa thấy dòng nào, chạy lại đoạn code trên khi tab Network đang mở.

**Kết quả đúng phải như thế này.** Trong Network, bấm vào dòng `login`:

- Tab Headers, phần Request Headers: có `Accept-Language: vi`. Đây là chỗ chứng minh mục 2.2 đã chạy.
- Status: `400 Bad Request`. Đúng, 400 là kết quả **mong muốn** ở đây.
- Tab Response: body như sau, message bằng tiếng Việt vì backend đọc header ngôn ngữ bạn vừa gửi.

```json
{
  "success": false,
  "message": "Email không tồn tại",
  "errors": {
    "message": "Email không tồn tại",
    "error": "Bad Request",
    "statusCode": 400
  },
  "code": 400
}
```

Đổi ngôn ngữ sang EN rồi chạy lại thì `message` thành `Email not found`. Đó là toàn bộ ý nghĩa của mục 2.2.

**Không thấy gì? Đối chiếu bảng này.** Cột giữa là dòng chữ đỏ trong Console.

| Console báo                                              | Nguyên nhân                                                           | Sửa                                                         |
| -------------------------------------------------------- | --------------------------------------------------------------------- | ----------------------------------------------------------- |
| `Cannot read properties of undefined (reading 'signIn')` | `authApi` là `undefined`: tên bạn export khác tên trong đoạn code này | Mở `authApi.ts`, đối chiếu từng chữ hoa thường của tên biến |
| `Cannot read properties of undefined (reading 'then')`   | `signIn` không **trả về** gì. Thân hàm `{ }` mà thiếu `return`        | Xem 💡 ngay dưới bảng                                       |
| `Failed to fetch` / `ERR_CONNECTION_REFUSED`             | Backend chưa chạy                                                     | Bật `pink-story-api` ở port 3000                            |
| Lỗi CORS                                                 | FE không chạy ở đúng `http://localhost:4001`                          | Kiểm tra `.env`, đừng mở bằng `127.0.0.1`                   |
| `Failed to resolve module specifier`                     | Gõ nhầm đường dẫn, hoặc dùng `@/api` thay vì `/src/api/index.ts`      | Dán lại đúng đoạn trên                                      |
| Console sạch nhưng Network không có dòng nào             | Barrel chưa nối: `src/api/index.ts` thiếu `export * from './auth';`   | Mục 2.6                                                     |

💡 **Bẫy hay gặp nhất: quên `return`.** Hai cách viết arrow function không giống nhau:

```ts
// Thân rút gọn: tự động trả về giá trị của biểu thức
signIn: (body: ISignInFormValues) =>
  axiosService.post<ISignInResponse, ISignInFormValues>(EAuthEndpoint.SIGN_IN, body),

// Thân khối: PHẢI tự viết return, không thì hàm trả về undefined
signIn: (body: ISignInFormValues) => {
  return axiosService.post<ISignInResponse, ISignInFormValues>(EAuthEndpoint.SIGN_IN, body);
},
```

Nếu viết thân khối `{ }` mà quên `return`, `yarn typecheck` vẫn **sạch**: TypeScript suy ra kiểu trả về là `void`, hợp lệ, không có gì mâu thuẫn để nó báo lỗi. Request vẫn được gửi đi nên Network vẫn có dòng `login`, nhưng nơi gọi nhận về `undefined` nên `.then(...)` nổ. Đây chính là loại lỗi mà checkpoint sinh ra để bắt. Mục 2.6 viết theo dạng thân rút gọn để tránh hẳn cái bẫy này, cứ bám theo đó.

---

### Bước 3: Redux user slice + persist 🟢

**Toàn bộ bước này đã có sẵn và đúng nguyên xi trong base.** Không phải gõ dòng nào. Đọc từng file, hiểu vì sao nó được viết vậy, rồi qua bước 4.

```
src/redux/storage.ts          [=]  bọc localStorage/sessionStorage thành API Promise cho redux-persist
src/redux/user/slice.ts       [=]  { user: IUserInfo | undefined }; setUserInfoToRedux / resetUserInfoFromRedux
src/redux/user/selector.ts    [=]  userSelector = createSelector(state.user, s => s.user)
src/redux/user/hooks.ts       [=]  useReduxUser() → { user, setUserInfo, resetUserInfo }
src/redux/store.ts            [=]  persistReducer key 'user' → localStorage "persist:user"; ignoredActions cho redux-persist
src/redux/index.ts            [=]  export store, persistor, RootState, AppDispatch, mọi thứ trong user/
src/index.tsx                 [=]  Provider → ThemeProvider → PersistGate → AppErrorBoundary → Suspense → AppRouter
```

Điểm cần để ý khi đọc:

- `IStateUser.user` là `undefined` khi chưa đăng nhập. Mọi guard đều kiểm tra `!user`.
- Vì `IUserInfo` đã đổi ở bước 1, slice tự động dùng hình dạng mới. Không cần sửa slice.
- `useReduxUser` trả về hàm `setUserInfo` / `resetUserInfo` mới mỗi lần render. `useAuthLogoutListener` đặt chúng vào dependency của `useEffect`, nên listener được gắn lại mỗi render. Chấp nhận được ở quy mô này; bài tập 6.10 bàn cách tối ưu.

**✅ Checkpoint 3:** Redux DevTools thấy `user.user = undefined`; Application → Local Storage có key `persist:user`.

---

### Bước 4: React Query hooks 🟢

**Files:**

```
src/types/common.types.ts                              [=]
src/react-query/auth/useLoginMutation.ts               [M]
src/react-query/auth/useRegisterMutation.ts            [M]
src/react-query/auth/useVerifyRegisterMutation.ts      [M]
src/react-query/auth/useForgotPasswordMutation.ts      [M]  🟡 dùng ở bước 13
src/react-query/auth/useResetPasswordMutation.ts       [M]  🟡 dùng ở bước 13
src/react-query/auth/useGetCurrentUserProfile.ts       [M]  🟡 dùng ở bước 12
src/react-query/auth/index.ts                          [M]
src/react-query/index.ts                               [S]
```

#### 4.1. `IAppMutationOptions` (đọc)

```ts
// src/types/common.types.ts — đã có
export type IAppMutationOptions<
  TVariables,
  TResponse = unknown,
  TError = unknown,
  TContext = unknown,
> = UseMutationOptions<IAppResponse<TResponse>, TError, TVariables, TContext>;
```

#### 4.2. Năm mutation — cùng một khuôn

```ts
// src/react-query/auth/useLoginMutation.ts
import { useMutation } from '@tanstack/react-query';
import { authApi } from '@/api';
import { ISignInFormValues, ISignInResponse } from '@/interfaces';
import { IAppMutationOptions } from '@/types';

interface IVariablesType {
  body: ISignInFormValues;
}
interface IMutationParams {
  configs?: IAppMutationOptions<IVariablesType, ISignInResponse>;
}

export const useLoginMutation = ({ configs }: IMutationParams = {}) =>
  useMutation({
    mutationFn: (v: IVariablesType) => authApi.signIn(v.body),
    ...configs, // onSuccess / onError do trang truyền vào
  });
```

Bốn hook còn lại chỉ khác kiểu `body` và kiểu response. Tự viết theo bảng:

| Hook                        | `body`                | Response kiểu       | Gọi                      |
| --------------------------- | --------------------- | ------------------- | ------------------------ |
| `useRegisterMutation`       | `IRegisterFormValues` | `IRegisterResponse` | `authApi.register`       |
| `useVerifyRegisterMutation` | `IVerifyRegisterBody` | `ISignInResponse`   | `authApi.verifyRegister` |
| `useForgotPasswordMutation` | `IForgotPasswordFormValues` | `void`              | `authApi.forgotPassword` |
| `useResetPasswordMutation`  | `IResetPasswordBody`  | `void`              | `authApi.resetPassword`  |

#### 4.3. Query lấy profile (dùng ở bước 12) 🟡

```ts
// src/react-query/auth/useGetCurrentUserProfile.ts
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { AxiosError } from 'axios';
import { useMemo } from 'react';
import { authApi } from '@/api';
import { IAppResponse, IUserInfo } from '@/interfaces';

export const QK_GET_USER_PROFILE = 'QK_GET_USER_PROFILE';

interface IQueryParams {
  configs?: Partial<UseQueryOptions<IAppResponse<IUserInfo>, AxiosError>>;
}

export const useGetCurrentUserProfile = ({ configs }: IQueryParams = {}) => {
  const { data, isFetching, isSuccess, isError, error } = useQuery<
    IAppResponse<IUserInfo>,
    AxiosError
  >({
    queryKey: [QK_GET_USER_PROFILE],
    queryFn: () => authApi.getCurrentUserProfile(),
    retry: false,
    refetchOnWindowFocus: false,
    ...configs, // ví dụ: enabled: !!user
  });

  const userInfo = useMemo(() => data?.data ?? null, [data]);
  return { userInfo, isFetching, isSuccess, isError, error };
};
```

```ts
// src/react-query/auth/index.ts
export * from './useLoginMutation';
export * from './useRegisterMutation';
export * from './useVerifyRegisterMutation';
export * from './useForgotPasswordMutation';
export * from './useResetPasswordMutation';
export * from './useGetCurrentUserProfile';

// src/react-query/index.ts  (thay `export {};` của base; giữ dòng comment cho plop)
// Modules created by `yarn generate:module` are appended here.
export * from './auth';
```

💡 **Vì sao mutation hook không tự xử lý `onSuccess`?** "Làm gì sau khi login" là việc của **trang** (set Redux, navigate, toast). Hook mutation chỉ biết "gọi API nào". Tách vậy để tái dùng ở chỗ khác với hành vi khác.

**✅ Checkpoint 4:** `yarn typecheck` sạch.

---

### Bước 5: Validation schema (zod) 🟢

**Files:**

```
src/validations/common.ts                          [M]  emailSchema, passwordSchema dùng chung
src/validations/signInValidationSchema.ts          [M]
src/validations/registerValidationSchema.ts        [M]
src/validations/forgotPasswordValidationSchema.ts  [M]  🟡
src/validations/resetPasswordValidationSchema.ts   [M]  🟡
src/validations/index.ts                           [M]
src/translations/{en,vi}/validation.json           [S]
```

Đây là chỗ khác đáp án nhiều nhất (xem 0.3). Cùng rule, khác thư viện.

```ts
// src/validations/common.ts
import { z } from 'zod';
import { EMAIL_REGEX } from '@/constants';

// Message là KEY i18n. UI gọi t(key).
export const emailSchema = z
  .string()
  .min(1, 'emailRequired')
  .regex(EMAIL_REGEX, 'emailInvalid');

export const passwordSchema = z
  .string()
  .min(1, 'passwordRequired')
  .min(8, 'passwordMin')
  .max(32, 'passwordMax')
  .regex(/[A-Z]/, 'passwordUppercase')
  .regex(/[a-z]/, 'passwordLowercase')
  .regex(/[0-9]/, 'passwordNumber')
  .regex(/[@$!%*?&]/, 'passwordSymbol');
```

```ts
// src/validations/signInValidationSchema.ts
import { z } from 'zod';
import { emailSchema, passwordSchema } from './common';

export const signInValidationSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});
```

```ts
// src/validations/registerValidationSchema.ts
import { z } from 'zod';
import { EUserRole } from '@/enums';
import { emailSchema, passwordSchema } from './common';

export const registerValidationSchema = z
  .object({
    username: z.string().min(1, 'usernameRequired').max(50, 'usernameMax'),
    email: emailSchema,
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'passwordRequired'),
    // chỉ cho chọn reader/creator (giống RegisterDto)
    role: z.enum([EUserRole.READER, EUserRole.CREATOR], {
      error: 'roleRequired',
    }),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
  })
  // rule liên field: đặt ở cấp object, gắn lỗi vào confirmPassword bằng `path`
  .refine((v) => v.password === v.confirmPassword, {
    error: 'passwordMismatch',
    path: ['confirmPassword'],
  });
```

```ts
// src/validations/forgotPasswordValidationSchema.ts
import { z } from 'zod';
import { emailSchema } from './common';

export const forgotPasswordValidationSchema = z.object({ email: emailSchema });
```

```ts
// src/validations/resetPasswordValidationSchema.ts
import { z } from 'zod';
import { passwordSchema } from './common';

export const resetPasswordValidationSchema = z
  .object({
    newPassword: passwordSchema,
    confirmNewPassword: z.string().min(1, 'passwordRequired'),
  })
  .refine((v) => v.newPassword === v.confirmNewPassword, {
    error: 'passwordMismatch',
    path: ['confirmNewPassword'],
  });
```

```ts
// src/validations/index.ts
export * from './signInValidationSchema';
export * from './registerValidationSchema';
export * from './forgotPasswordValidationSchema';
export * from './resetPasswordValidationSchema';
```

**Key i18n.** Base có sẵn 10 key về email/password. Thêm 3 key, xóa `fullNameRequired` (không còn dùng):

```json
// en/validation.json — thêm
"usernameRequired": "Username is required",
"usernameMax": "Username must be at most 50 characters",
"roleRequired": "Please select an account type"
```

```json
// vi/validation.json — thêm
"usernameRequired": "Tên đăng nhập là bắt buộc",
"usernameMax": "Tên đăng nhập không được vượt quá 50 ký tự",
"roleRequired": "Vui lòng chọn loại tài khoản"
```

💡 **`.min(1, 'emailRequired')` thay cho `required`.** zod không có `required()`; chuỗi rỗng là string hợp lệ nên phải chặn bằng `min(1)`. Gọi `.min(1, ...)` rồi `.min(8, ...)` liên tiếp là bình thường: mỗi check cho một message riêng, và zod v4 chạy hết các check trong chuỗi rồi trả về mảng lỗi. `react-hook-form` chỉ hiển thị lỗi đầu tiên của mỗi field.

💡 **`.refine` ở cấp object vẫn chạy khi field khác đang lỗi**, miễn là lỗi đó là lỗi giá trị (chuỗi rỗng, sai regex). Nó chỉ bị bỏ qua khi có lỗi **kiểu** (ví dụ `role` nhận chuỗi lạ). Vì form luôn có `role` mặc định hợp lệ, `passwordMismatch` sẽ hiện ngay khi người dùng blur khỏi ô xác nhận.

💡 **So với Yup của đáp án:** `Yup.ref('password')` ↔ `.refine` + `path`; `Yup.mixed().oneOf([...])` ↔ `z.enum([...])`; `.required('key')` ↔ `.min(1, 'key')`. Mở `pink-story-app/src/validations/registerValidationSchema.ts` đặt cạnh file của bạn để thấy ánh xạ 1-1.

**✅ Checkpoint 5:** Console trình duyệt:

```js
const { registerValidationSchema } = await import('/src/validations/index.ts');
registerValidationSchema
  .safeParse({ role: 'reader' })
  .error.issues.map((i) => [i.path.join('.'), i.message]);
```

→ mảng gồm `usernameRequired`, `emailRequired`, `passwordRequired`, … Thử thêm `password: 'Abc@1234', confirmPassword: 'x'` để thấy `confirmPassword → passwordMismatch`.

---

### Bước 6: UI primitives + nâng cấp toast 🟢

**Files:**

```
src/components/common/input/AppInput.tsx     [S]  thêm dấu * cho field bắt buộc
src/components/common/button/AppButton.tsx   [=]
src/hooks/useAppToast.tsx                    [S]
src/hooks/__tests__/useAppToast.test.tsx     [S]  thêm 1 test
```

#### 6.1. Hai component có sẵn

**`AppButton`** (chỉ đọc): `text`, `variant` (`primary | secondary | ghost | danger`), `loading` (hiện spinner + tự disable), `width`, `icon`.

**`AppInput`** (cần sửa một chỗ): `forwardRef`, nhận `label`, `errors?: string` (chuỗi **đã dịch**), `prefix`/`suffix`, và mọi prop của `<input>`.

Bản base đổ thẳng `required` xuống thẻ `<input>` qua `...rest`, nên **màn hình không hiện dấu `*` nào**. Bản thân `required` của HTML cũng không vẽ gì — nó chỉ để trình duyệt chặn submit, mà `<Form noValidate>` ở bước 8 lại tắt đúng cái đó. Kết quả: prop `required` bạn viết ở mọi trang đều vô hình.

Tách `required` ra khỏi `...rest` để vẽ dấu sao, nhưng nhớ truyền lại cho `<input>`:

```tsx
// src/components/common/input/AppInput.tsx
export const AppInput = forwardRef<HTMLInputElement, IProps>(
  // required được lôi ra riêng, KHÔNG còn nằm trong ...rest
  ({ label, errors, suffix, prefix, required, ...rest }, ref) => (
    <Wrapper>
      {label && (
        <Label>
          {label}
          {required && <RequiredMark>*</RequiredMark>}
        </Label>
      )}
      <InputBox $hasError={!!errors}>
        {prefix}
        {/* phải truyền lại thủ công, vì đã tách khỏi ...rest ở trên */}
        <StyledInput ref={ref} required={required} {...rest} />
        {suffix}
      </InputBox>
      {errors && <ErrorText>{errors}</ErrorText>}
    </Wrapper>
  )
);

// thêm styled mới, đặt ngay dưới Label
const RequiredMark = styled.span`
  margin-left: 2px;
  color: ${Colors.red_10};
`;
```

💡 **Dấu `*` chỉ là hiển thị.** Việc thật sự chặn form khi bỏ trống vẫn là của schema zod ở bước 5. Hai thứ này độc lập: bạn có thể quên `required` mà zod vẫn báo lỗi, hoặc viết `required` cho một field zod không bắt buộc. Nhớ giữ chúng khớp nhau bằng tay.

#### 6.2. `showServerSuccessMsg(res, fallback)`

Base hiện đọc `response?.data?.message`. Với `pink-story-api`, response sau unwrap là `IAppResponse`, tức `message` nằm **ở cấp trên cùng**, còn `data` là user. Ngoài ra trang cần truyền câu dự phòng khi BE không có message. Sửa trong `src/hooks/useAppToast.tsx`:

```ts
const showServerSuccessMsg = (res: unknown, fallback?: string) => {
  const response = res as {
    message?: string;
    data?: { message?: string } | null;
  };
  showAppToast({
    type: 'success',
    content:
      response?.message ?? response?.data?.message ?? fallback ?? t('success'),
  });
};
```

Hai bài test có sẵn vẫn xanh. Thêm một bài để khoá hành vi mới:

```ts
it('prefers top-level message, then fallback', () => {
  toastMock.mockReturnValue('toast-id-5');
  const { result } = renderHook(() => useAppToast());

  act(() => {
    result.current.showServerSuccessMsg({ message: 'From BE' }, 'fallback');
  });
  expect(toastMock).toHaveBeenLastCalledWith('From BE', expect.anything());

  act(() => {
    result.current.showServerSuccessMsg({}, 'fallback');
  });
  expect(toastMock).toHaveBeenLastCalledWith('fallback', expect.anything());
});
```

(Trong bài thứ hai `isActiveMock` trả `false` nên toast không bị dedupe.)

💡 Backend luôn trả `message` đã dịch. Ưu tiên nó; `fallback` chỉ dùng khi BE không có. Lỗi thì đã đúng sẵn: `showServerErrorMsg` đọc `err.response.data` qua `getAPIErrorMsg` và bỏ qua 401 (vì 401 đã do interceptor xử lý).

**✅ Checkpoint 6:** `yarn test:run` xanh. Đọc xong `AppInput.tsx`, giải thích được vì sao `$hasError` có dấu `$`. Sau bước 8, field nào có `required` sẽ thấy dấu `*` đỏ cạnh label.

---

### Bước 7: Router, layout, guard theo role, trang Home/Profile 🟢

**Mục tiêu:** cây route với vùng **public auth** (`/sign-in`, `/sign-up`, `/verify-otp`), vùng **public app** (`/`), vùng **protected** (`/profile`), và điều hướng theo role.

**Files:**

```
src/utils/route.ts                          [M]  getDefaultRouteByRole
src/utils/index.ts                          [S]
src/components/common/AppRoute.tsx          [S]  thêm allowedRoles
src/components/layouts/AuthLayout.tsx       [S]  redirect theo role
src/pages/Home.tsx                          [M]
src/pages/Profile.tsx                       [M]
src/pages/index.ts                          [M]
src/router/elements/authElements.tsx        [M]
src/router/elements/appElements.tsx         [M]
src/router/elements/index.ts                [M]
src/router/routes/authRoutes.tsx            [S]  thêm children
src/router/routes/readerRoutes.tsx          [M]  tách từ appRoutes
src/router/routes/accountRoutes.tsx         [M]  tách từ appRoutes
src/router/routes/appRoutes.tsx             [X]  xóa
src/router/routes/index.ts                  [S]
src/router/AppRouter.tsx                    [S]
src/components/layouts/RootLayout.tsx       [=]
src/components/layouts/AppLayout.tsx        [=]  sửa ở bước 11
```

#### 7.1. `lazyImport.ts` (đọc)

`React.lazy` chỉ hiểu `default export`. Helper này lazy một **named export**: `const { SignIn } = lazyImport(() => import('@/modules/auth'), 'SignIn')`.

#### 7.2. `utils/route.ts` — điều hướng theo role

```ts
import { ROUTES, RoutePath } from '@/constants';
import { EUserRole } from '@/enums';

export const getDefaultRouteByRole = (role?: EUserRole): RoutePath => {
  switch (role) {
    case EUserRole.ADMIN:
      return ROUTES.ADMIN;
    case EUserRole.CREATOR:
      return ROUTES.STUDIO;
    default:
      return ROUTES.ROOT; // reader hoặc không rõ
  }
};
```

```ts
// src/utils/index.ts
export * from './lazyImport';
export * from './getAPIErrorMsg';
export * from './route';
```

#### 7.3. `AppRoute.tsx` — guard có kiểm tra role

Base mới chỉ chặn khi chưa đăng nhập. Thêm prop `allowedRoles` và vế thứ hai:

```tsx
import { FC, ReactNode } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { EUserRole } from '@/enums';
import { useReduxUser } from '@/redux';
import { getDefaultRouteByRole } from '@/utils';

interface IProps {
  allowedRoles?: EUserRole[]; // không truyền = chỉ cần đăng nhập
  children?: ReactNode;
}

export const AppRoute: FC<IProps> = ({ allowedRoles, children }) => {
  const { user } = useReduxUser();

  // 1) Chưa đăng nhập → login
  if (!user) return <Navigate to={ROUTES.SIGN_IN} replace />;

  // 2) Đăng nhập nhưng sai role → về trang mặc định của role đó
  if (allowedRoles && (!user.role || !allowedRoles.includes(user.role))) {
    return <Navigate to={getDefaultRouteByRole(user.role)} replace />;
  }

  return <>{children ?? <Outlet />}</>;
};
```

> 🟡 Bản gốc `pink-story-app` bọc thêm `<SocketProvider>` ở đây. Bỏ ở bản cơ bản.

#### 7.4. `AuthLayout.tsx` — đá user đã login ra theo role

Đổi đúng một dòng và thêm một import. Phần styled giữ nguyên:

```tsx
import { getDefaultRouteByRole } from '@/utils';
// ...
if (user) return <Navigate to={getDefaultRouteByRole(user.role)} replace />;
```

#### 7.5. Hai trang placeholder

Base không có trang nào. Tạo hai trang tối giản để có chỗ điều hướng tới; bạn có thể làm đẹp sau.

```tsx
// src/pages/Home.tsx
import { useTranslation } from 'react-i18next';
import { useReduxUser } from '@/redux';

export const Home = () => {
  const { t } = useTranslation();
  const { user } = useReduxUser();
  return (
    <h2>
      {user
        ? `${t('welcomeBack')}, ${user.username ?? user.email}`
        : t('appName')}
    </h2>
  );
};
```

```tsx
// src/pages/Profile.tsx
import { useReduxUser } from '@/redux';

export const Profile = () => {
  const { user } = useReduxUser();
  return <pre>{JSON.stringify(user, null, 2)}</pre>;
};
```

```ts
// src/pages/index.ts
export * from './Home';
export * from './Profile';
```

#### 7.6. `router/elements/`

```tsx
// src/router/elements/authElements.tsx — các trang này sẽ tồn tại từ bước 8 đến 13
import { lazyImport } from '@/utils';

export const { SignIn } = lazyImport(() => import('@/modules/auth'), 'SignIn');
export const { Register } = lazyImport(
  () => import('@/modules/auth'),
  'Register'
);
export const { VerifyOtp } = lazyImport(
  () => import('@/modules/auth'),
  'VerifyOtp'
);
```

```tsx
// src/router/elements/appElements.tsx
import { lazyImport } from '@/utils';

export const { Home } = lazyImport(() => import('@/pages'), 'Home');
export const { Profile } = lazyImport(() => import('@/pages'), 'Profile');
```

```ts
// src/router/elements/index.ts
export * from './authElements';
export * from './appElements';
```

⚠️ **`@/modules/auth` chưa tồn tại ở thời điểm này**, nó được dựng ở bước 8. Nên `yarn typecheck` sẽ đỏ. Cách gọn nhất là tạo trước ba trang rỗng để bước 7 chạy được ngay, rồi bước 8 chỉ việc thay ruột:

```tsx
// src/modules/auth/pages/SignIn.tsx
export const SignIn = () => <div>SignIn</div>;

// src/modules/auth/pages/Register.tsx
export const Register = () => <div>Register</div>;

// src/modules/auth/pages/VerifyOtp.tsx
export const VerifyOtp = () => <div>VerifyOtp</div>;
```

```ts
// src/modules/auth/pages/index.ts
export * from './SignIn';
export * from './Register';
export * from './VerifyOtp';

// src/modules/auth/index.ts
export * from './pages';
```

Làm vậy bạn kiểm tra được điều hướng ở Checkpoint 7 một cách thật sự: vào `/sign-in` phải thấy chữ "SignIn", chứ không phải nhìn code rồi đoán. Bước 8 sẽ thêm `hooks/`, `styled/` và viết lại nội dung ba trang này.

#### 7.7. Cây route

```tsx
// routes/authRoutes.tsx
import { RouteObject } from 'react-router-dom';
import { AuthLayout } from '@/components';
import { ROUTES } from '@/constants';
import { Register, SignIn, VerifyOtp } from '../elements';

/** Public auth routes, rendered inside `AuthLayout`. */
export const authRoutes: RouteObject = {
  element: <AuthLayout />,
  children: [
    { path: ROUTES.SIGN_IN, element: <SignIn /> },
    { path: ROUTES.SIGN_UP, element: <Register /> },
    { path: ROUTES.VERIFY_OTP, element: <VerifyOtp /> },
  ],
};
```

Base gộp `/` (public) và các trang cần login vào một file `appRoutes.tsx`. Tách thành hai file dưới đây rồi **xóa `appRoutes.tsx`**:

```tsx
// routes/readerRoutes.tsx — PUBLIC: khách chưa login vẫn xem được trang chủ
import { RouteObject } from 'react-router-dom';
import { AppLayout } from '@/components';
import { Home } from '../elements';

export const readerRoutes: RouteObject = {
  element: <AppLayout />,
  children: [{ index: true, element: <Home /> }],
};
```

```tsx
// routes/accountRoutes.tsx — PROTECTED: cần đăng nhập
import { RouteObject } from 'react-router-dom';
import { AppLayout, AppRoute } from '@/components';
import { ROUTES } from '@/constants';
import { Profile } from '../elements';

export const accountRoutes: RouteObject = {
  element: (
    <AppRoute>
      <AppLayout />
    </AppRoute>
  ),
  children: [{ path: ROUTES.PROFILE, element: <Profile /> }],
};
```

```ts
// routes/index.ts
export * from './authRoutes';
export * from './readerRoutes';
export * from './accountRoutes';
```

```tsx
// src/router/AppRouter.tsx
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { NotFound, RootLayout } from '@/components';
import { accountRoutes, authRoutes, readerRoutes } from './routes';

const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      authRoutes,
      readerRoutes,
      accountRoutes,
      { path: '*', element: <NotFound /> },
    ],
  },
]);

export const AppRouter = () => <RouterProvider router={router} />;
```

Cây kết quả:

```
<RootLayout>                          QueryClientProvider, Toast, logout listener
 ├─ <AuthLayout>                      public; có user → redirect theo role
 │   ├─ /sign-in     → <SignIn>
 │   ├─ /sign-up     → <Register>
 │   └─ /verify-otp  → <VerifyOtp>
 ├─ <AppLayout>                       public
 │   └─ /            → <Home>
 ├─ <AppRoute><AppLayout/></AppRoute> protected
 │   └─ /profile     → <Profile>
 └─ *                → <NotFound>
```

💡 Ở Pink Story trang chủ `/` là **public** (khách đọc truyện được), chỉ các trang tài khoản mới cần login. Vì vậy có 2 nhóm route dùng cùng `AppLayout` nhưng một nhóm có `AppRoute`, một nhóm không.

💡 `useAuthLogoutListener` dùng `useNavigate()`, chỉ hoạt động **bên trong** `<RouterProvider>`. `RootLayout` là component đầu tiên nằm trong router, nên base đặt nó ở đó chứ không phải `index.tsx`.

**✅ Checkpoint 7:** `yarn dev`. Vào `/` thấy trang chủ. Vào `/profile` → bị đẩy về `/sign-in` (chưa có trang, thấy 404 hoặc trang trắng là đúng). Từ Redux DevTools dispatch `user/setUserInfoToRedux` với payload `{ id: 1, email: 'a@b.com', role: 'reader' }` → vào `/sign-in` bị đẩy về `/`, vào `/profile` thấy JSON.

---

### Bước 8: Trang Đăng nhập (SignIn) 🟢

**Files:**

```
src/translations/{en,vi}/auth.json          [M]
src/translations/{en,vi}/index.ts           [S]
src/modules/auth/styled/StyledSignIn.ts     [M]
src/modules/auth/styled/index.ts            [M]
src/modules/auth/hooks/useSignInHooks.ts    [M]
src/modules/auth/hooks/index.ts             [M]
src/modules/auth/pages/SignIn.tsx           [M]
src/modules/auth/pages/index.ts             [M]
src/modules/auth/index.ts                   [M]
```

#### 8.0. File dịch cho auth

Tạo một lần đủ key cho cả 5 trang auth để các bước sau không phải quay lại. Bản tiếng Anh:

```json
// src/translations/en/auth.json
{
  "signIn": "Sign In",
  "signUp": "Sign Up",
  "signOut": "Sign Out",
  "profileTitle": "Profile",
  "welcomeBack": "Welcome back",
  "signInToContinue": "Sign in to continue to your account",
  "emailAddress": "Email Address",
  "enterYourEmail": "Enter your email",
  "password": "Password",
  "enterYourPassword": "Enter your password",
  "confirmPassword": "Confirm Password",
  "forgotPassword": "Forgot password?",
  "dontHaveAccount": "Don't have an account?",
  "alreadyHaveAccount": "Already have an account?",
  "signInSuccess": "Signed in successfully",
  "createAccount": "Create account",
  "registerSubtitle": "Sign up to start reading",
  "username": "Username",
  "enterUsername": "Enter your username",
  "firstName": "First Name",
  "lastName": "Last Name",
  "enterFirstName": "Enter your first name",
  "enterLastName": "Enter your last name",
  "accountType": "Account Type",
  "roleReader": "Reader",
  "roleCreator": "Creator",
  "otpSentToEmail": "We've sent a verification code to your email",
  "verifyOtpTitle": "Verify your email",
  "verifyOtpSubtitle": "Enter the code we sent to {{email}}",
  "otp": "Verification Code",
  "enterOtp": "Enter the code",
  "verify": "Verify",
  "verifyRegisterSuccess": "Account verified successfully",
  "forgotPasswordTitle": "Forgot password",
  "forgotPasswordSubtitle": "Enter your email and we'll send you a link to reset your password",
  "sendResetLink": "Send Reset Link",
  "forgotPasswordSentTitle": "Check your email",
  "forgotPasswordSentSubtitle": "We've sent a password reset link to {{email}}. Click the button in the email to set a new password.",
  "forgotPasswordSuccess": "We've sent a password reset link to your email",
  "resendLink": "Resend link",
  "requestNewLink": "Request a new link",
  "backToSignIn": "Back to sign in",
  "resetPasswordTitle": "Reset password",
  "resetPasswordSubtitle": "Enter your new password",
  "newPassword": "New Password",
  "enterNewPassword": "Enter new password",
  "confirmNewPassword": "Confirm New Password",
  "enterConfirmNewPassword": "Re-enter new password",
  "resetPasswordAction": "Reset Password",
  "resetPasswordSuccess": "Password reset successfully"
}
```

Bản tiếng Việt `src/translations/vi/auth.json` cùng bộ key, dịch tương ứng (có thể chép từ `pink-story-app/src/translations/vi/auth.json`, thêm `"profileTitle": "Hồ sơ"`). Rồi nối vào cả hai barrel:

```ts
// src/translations/{en,vi}/index.ts  (thêm dòng auth)
import common from './common.json';
import auth from './auth.json';
import validation from './validation.json';

export const TRANSLATIONS_EN = { ...common, ...auth, ...validation };
```

#### 8.1. Styled dùng chung cho cả 5 trang auth

```ts
// src/modules/auth/styled/StyledSignIn.ts
import styled from 'styled-components';
import { Colors } from '@/constants';

export const Title = styled.h1`
  margin: 0 0 8px;
  font-size: 26px;
  font-weight: 700;
  color: ${Colors.pink_70};
  text-align: center;
`;
export const Subtitle = styled.p`
  margin: 0 0 24px;
  font-size: 14px;
  color: ${Colors.gray_50};
  text-align: center;
`;
export const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
export const FooterText = styled.p`
  margin-top: 16px;
  font-size: 13px;
  color: ${Colors.gray_60};
  text-align: center;
  a {
    color: ${Colors.pink_60};
    font-weight: 600;
    text-decoration: none;
    &:hover {
      color: ${Colors.pink_70};
    }
  }
`;
export const ForgotLink = styled.a`
  align-self: flex-end;
  font-size: 13px;
  color: ${Colors.pink_60};
  text-decoration: none;
  font-weight: 500;
  &:hover {
    color: ${Colors.pink_70};
    text-decoration: underline;
  }
`;

// --- dùng cho form Register (bước 9) ---
export const Row = styled.div`
  display: flex;
  gap: 12px;
  & > * {
    flex: 1;
    min-width: 0;
  }
`;
export const FieldRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;
export const FieldLabel = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: ${Colors.gray_70};
`;
export const RequiredMark = styled.span`
  margin-left: 2px;
  color: ${Colors.red_10};
`;
export const ErrorText = styled.span`
  font-size: 12px;
  color: ${Colors.red_10};
`;
export const RoleGroup = styled.div`
  display: flex;
  gap: 12px;
`;
export const RoleCard = styled.label<{ $active: boolean }>`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px;
  border-radius: 10px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid
    ${({ $active }) => ($active ? Colors.pink_60 : Colors.pink_30)};
  background: ${({ $active }) => ($active ? Colors.pink_10 : Colors.white_10)};
  color: ${({ $active }) => ($active ? Colors.pink_70 : Colors.gray_70)};
  input {
    display: none;
  } /* ẩn radio gốc, RoleCard chính là "radio" nhìn thấy */
`;
```

#### 8.2. `useSignInHooks.ts`

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAppToast } from '@/hooks';
import { ISignInFormValues } from '@/interfaces';
import { useLoginMutation } from '@/react-query';
import { useReduxUser } from '@/redux';
import { getDefaultRouteByRole } from '@/utils';
import { signInValidationSchema } from '@/validations';

export const useSignInHooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { setUserInfo } = useReduxUser();
  const { showServerErrorMsg, showServerSuccessMsg } = useAppToast();

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<ISignInFormValues>({
    mode: 'onTouched',
    defaultValues: { email: '', password: '' },
    resolver: zodResolver(signInValidationSchema),
  });

  const { mutate: login, isPending } = useLoginMutation({
    configs: {
      onSuccess: (res) => {
        const user = res.data;
        if (!user) return;
        queryClient.clear(); // xóa cache của user trước (nếu có) TRƯỚC khi set user mới
        setUserInfo(user); // Redux → AuthLayout sẽ tự redirect
        showServerSuccessMsg(res, t('signInSuccess')); // ưu tiên message BE, fallback key FE
        reset();
        navigate(getDefaultRouteByRole(user.role), { replace: true });
      },
      onError: (err) => showServerErrorMsg(err),
    },
  });

  const onSubmit = handleSubmit((values) => login({ body: values }));

  return { t, control, errors, isValid, isPending, onSubmit };
};
```

> 🟡 Bản gốc còn `posthog.capture(...)`. Bỏ ở bản cơ bản; base cũng đã gỡ PostHog.

💡 Không cần ép kiểu `as Resolver<...>` như đáp án làm với Yup: kiểu suy ra từ schema zod đã khớp `ISignInFormValues` (đã kiểm chứng bằng `tsc` trên base). Nếu bạn đổi schema mà TS kêu ở `resolver`, đó là dấu hiệu schema và interface lệch nhau, sửa một trong hai chứ đừng ép kiểu.

#### 8.3. `SignIn.tsx`

```tsx
import { Controller, FieldError } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AppButton, AppInput } from '@/components';
import { ROUTES } from '@/constants';
import { useSignInHooks } from '../hooks';
import { FooterText, ForgotLink, Form, Subtitle, Title } from '../styled';

export const SignIn = () => {
  const { t, control, errors, isPending, onSubmit } = useSignInHooks();

  // FieldError.message = key i18n → chuỗi đã dịch
  const errMsg = (e?: FieldError) => (e?.message ? t(e.message) : undefined);

  return (
    <>
      <Title>{t('welcomeBack')}</Title>
      <Subtitle>{t('signInToContinue')}</Subtitle>

      <Form onSubmit={onSubmit} noValidate>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              type="email"
              label={t('emailAddress')}
              placeholder={t('enterYourEmail')}
              onBlur={(e) => {
                field.onBlur(); // báo RHF: đã touched
                field.onChange(e.target.value.trim()); // trim khi rời field
              }}
              errors={errMsg(errors.email)}
            />
          )}
        />

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              type="password"
              label={t('password')}
              placeholder={t('enterYourPassword')}
              errors={errMsg(errors.password)}
            />
          )}
        />

        {/* Trang đích có ở bước 13; trước đó bấm vào sẽ ra 404, đó là bình thường */}
        <ForgotLink as={Link} to={ROUTES.FORGOT_PASSWORD}>
          {t('forgotPassword')}
        </ForgotLink>

        <AppButton type="submit" text={t('signIn')} loading={isPending} />
      </Form>

      <FooterText>
        {t('dontHaveAccount')} <Link to={ROUTES.SIGN_UP}>{t('signUp')}</Link>
      </FooterText>
    </>
  );
};
```

Barrel:

```ts
// pages/index.ts
export * from './SignIn';
// hooks/index.ts
export * from './useSignInHooks';
// styled/index.ts
export * from './StyledSignIn';
// modules/auth/index.ts
export * from './hooks';
export * from './pages';
export * from './styled';
```

**✅ Checkpoint 8:**

1. Để trống bấm Đăng nhập → lỗi dưới field, **không** có request.
2. Sai mật khẩu → toast đỏ hiện message tiếng Việt từ BE (nhờ `Accept-Language: vi`).
3. Đúng → response `Set-Cookie: access_token=...; HttpOnly; SameSite=Strict` và `refresh_token=...; Path=/api/auth/refresh`, Redux có `{ id, username, email, role }`, toast xanh, chuyển về `/` (reader).
4. F5 vẫn ở lại và vẫn là đã login.

---

### Bước 9: Đăng ký bước 1 — form Register 🟢

**Mục tiêu:** Form 7 field → `POST /api/auth/register` → nhận `hash` → chuyển sang `/verify-otp` kèm `hash` và `email` qua `location.state`.

**Files:**

```
src/modules/auth/hooks/useRegisterHooks.ts   [M]
src/modules/auth/pages/Register.tsx          [M]
```

#### 9.1. `useRegisterHooks.ts`

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { EUserRole } from '@/enums';
import { useAppToast } from '@/hooks';
import { IRegisterFormValues } from '@/interfaces';
import { useRegisterMutation } from '@/react-query';
import { registerValidationSchema } from '@/validations';

export const useRegisterHooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showServerErrorMsg, showServerSuccessMsg } = useAppToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IRegisterFormValues>({
    mode: 'onTouched',
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: EUserRole.READER, // mặc định là người đọc
      firstName: '',
      lastName: '',
    },
    resolver: zodResolver(registerValidationSchema),
  });

  const { mutate: register, isPending } = useRegisterMutation({
    configs: {
      // variables = { body } mà ta đã truyền vào mutate() → lấy lại email để hiển thị ở trang OTP
      onSuccess: (res, variables) => {
        const hash = res.data?.hash;
        if (!hash) return;
        showServerSuccessMsg(res, t('otpSentToEmail'));
        navigate(ROUTES.VERIFY_OTP, {
          state: { hash, email: variables.body.email }, // truyền qua state, KHÔNG lộ trên URL
        });
      },
      onError: (err) => showServerErrorMsg(err),
    },
  });

  const onSubmit = handleSubmit((values) =>
    register({
      body: {
        ...values,
        // '' → undefined để backend (IsOptional) không validate chuỗi rỗng
        firstName: values.firstName || undefined,
        lastName: values.lastName || undefined,
      },
    })
  );

  return { t, control, errors, isValid, isPending, onSubmit };
};
```

💡 **Chưa `setUserInfo` ở bước này**. Backend **chưa tạo user**, chỉ gửi OTP và trả `hash`. `hash` là chuỗi mã hoá chứa toàn bộ thông tin đăng ký + OTP + thời hạn. Backend không lưu gì cả, trạng thái nằm trong `hash`. Đây là mẫu "stateless OTP".

#### 9.2. `Register.tsx`

```tsx
import { Controller, FieldError } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { AppButton, AppInput } from '@/components';
import { ROUTES } from '@/constants';
import { EUserRole } from '@/enums';
import { useRegisterHooks } from '../hooks';
import {
  ErrorText,
  FieldLabel,
  FieldRow,
  FooterText,
  Form,
  RequiredMark,
  RoleCard,
  RoleGroup,
  Row,
  Subtitle,
  Title,
} from '../styled';

// label là key i18n
const ROLES = [
  { value: EUserRole.READER, label: 'roleReader' },
  { value: EUserRole.CREATOR, label: 'roleCreator' },
] as const;

export const Register = () => {
  const { t, control, errors, isPending, onSubmit } = useRegisterHooks();
  const errMsg = (e?: FieldError) => (e?.message ? t(e.message) : undefined);

  return (
    <>
      <Title>{t('createAccount')}</Title>
      <Subtitle>{t('registerSubtitle')}</Subtitle>

      <Form onSubmit={onSubmit} noValidate>
        <Controller
          name="username"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              label={t('username')}
              placeholder={t('enterUsername')}
              errors={errMsg(errors.username)}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              type="email"
              label={t('emailAddress')}
              placeholder={t('enterYourEmail')}
              onBlur={(e) => {
                field.onBlur();
                field.onChange(e.target.value.trim());
              }}
              errors={errMsg(errors.email)}
            />
          )}
        />

        {/* 2 field optional nằm cùng hàng */}
        <Row>
          <Controller
            name="firstName"
            control={control}
            render={({ field }) => (
              // value ?? '' : field optional có thể undefined → input controlled cần string
              <AppInput
                {...field}
                value={field.value ?? ''}
                label={t('firstName')}
                placeholder={t('enterFirstName')}
              />
            )}
          />
          <Controller
            name="lastName"
            control={control}
            render={({ field }) => (
              <AppInput
                {...field}
                value={field.value ?? ''}
                label={t('lastName')}
                placeholder={t('enterLastName')}
              />
            )}
          />
        </Row>

        <Controller
          name="password"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              type="password"
              label={t('password')}
              placeholder={t('enterYourPassword')}
              errors={errMsg(errors.password)}
            />
          )}
        />

        <Controller
          name="confirmPassword"
          control={control}
          render={({ field }) => (
            <AppInput
              {...field}
              required
              type="password"
              label={t('confirmPassword')}
              placeholder={t('enterYourPassword')}
              errors={errMsg(errors.confirmPassword)}
            />
          )}
        />

        {/* Chọn role bằng 2 "card" — thực chất là radio group */}
        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <FieldRow>
              <FieldLabel>
                {t('accountType')}
                <RequiredMark>*</RequiredMark>
              </FieldLabel>
              <RoleGroup>
                {ROLES.map((role) => (
                  <RoleCard
                    key={role.value}
                    $active={field.value === role.value}
                  >
                    <input
                      type="radio"
                      value={role.value}
                      checked={field.value === role.value}
                      onChange={() => field.onChange(role.value)}
                    />
                    {t(role.label)}
                  </RoleCard>
                ))}
              </RoleGroup>
              {errors.role && <ErrorText>{errMsg(errors.role)}</ErrorText>}
            </FieldRow>
          )}
        />

        <AppButton type="submit" text={t('signUp')} loading={isPending} />
      </Form>

      <FooterText>
        {t('alreadyHaveAccount')} <Link to={ROUTES.SIGN_IN}>{t('signIn')}</Link>
      </FooterText>
    </>
  );
};
```

💡 **`RoleCard` là `styled.label`**. Bấm vào label = bấm vào radio bên trong (HTML mặc định), nên không cần `onClick` riêng. Radio thật bị ẩn bằng `input { display: none }`, còn viền/màu của card đổi theo `$active`.

Barrel: thêm `export * from './Register';` vào `pages/index.ts` và `export * from './useRegisterHooks';` vào `hooks/index.ts`.

**✅ Checkpoint 9:**

1. Bỏ trống → lỗi ở username, email, password, confirmPassword. Role mặc định reader nên không lỗi.
2. Mật khẩu và xác nhận khác → `passwordMismatch` ngay dưới ô xác nhận.
3. Username/email đã tồn tại → toast đỏ message từ BE.
4. Hợp lệ → `POST /api/auth/register` trả `201 { data: { hash } }`, URL đổi thành `/verify-otp`, email thật nhận được mã OTP.

---

### Bước 10: Đăng ký bước 2 — VerifyOtp 🟢

**Mục tiêu:** Nhận `hash` + `email` từ `location.state`, cho nhập OTP → `POST /api/auth/verify-register` → backend tạo user, set cookie, trả user → set Redux → điều hướng theo role.

**Files:**

```
src/modules/auth/hooks/useVerifyOtpHooks.ts   [M]
src/modules/auth/pages/VerifyOtp.tsx          [M]
```

#### 10.1. `useVerifyOtpHooks.ts`

Form chỉ có 1 field nên codebase **không dùng react-hook-form**, dùng `useState` thuần. Bài học: không phải lúc nào cũng cần thư viện.

```ts
import { useQueryClient } from '@tanstack/react-query';
import { FormEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppToast } from '@/hooks';
import { QK_GET_USER_PROFILE, useVerifyRegisterMutation } from '@/react-query';
import { useReduxUser } from '@/redux';
import { getDefaultRouteByRole } from '@/utils';

interface ILocationState {
  hash?: string;
  email?: string;
}

export const useVerifyOtpHooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { state } = useLocation();
  const { hash, email } = (state ?? {}) as ILocationState; // do Register truyền sang
  const { setUserInfo } = useReduxUser();
  const { showServerErrorMsg, showServerSuccessMsg } = useAppToast();

  const [otp, setOtp] = useState('');

  const { mutate: verify, isPending } = useVerifyRegisterMutation({
    configs: {
      onSuccess: (res) => {
        const user = res.data;
        if (!user) return;
        setUserInfo(user);
        // Đánh dấu query profile là cũ để AuthBootstrap (bước 12) fetch lại profile đầy đủ
        queryClient.invalidateQueries({ queryKey: [QK_GET_USER_PROFILE] });
        showServerSuccessMsg(res, t('verifyRegisterSuccess'));
        navigate(getDefaultRouteByRole(user.role), { replace: true });
      },
      onError: showServerErrorMsg,
    },
  });

  const onSubmit = (e?: FormEvent) => {
    e?.preventDefault(); // form thuần → tự chặn reload trang
    if (!hash || !otp.trim()) return;
    verify({ body: { hash, otp: otp.trim() } });
  };

  return { t, email, otp, setOtp, isPending, onSubmit, missingHash: !hash };
};
```

#### 10.2. `VerifyOtp.tsx`

```tsx
import { Link, Navigate } from 'react-router-dom';
import { AppButton, AppInput } from '@/components';
import { ROUTES } from '@/constants';
import { useVerifyOtpHooks } from '../hooks';
import { FooterText, Form, Subtitle, Title } from '../styled';

export const VerifyOtp = () => {
  const { t, email, otp, setOtp, isPending, onSubmit, missingHash } =
    useVerifyOtpHooks();

  // Vào thẳng /verify-otp bằng URL (không có state) → quay về đăng ký
  if (missingHash) return <Navigate to={ROUTES.SIGN_UP} replace />;

  return (
    <>
      <Title>{t('verifyOtpTitle')}</Title>
      {/* interpolation {{email}} */}
      <Subtitle>{t('verifyOtpSubtitle', { email })}</Subtitle>

      <Form onSubmit={onSubmit} noValidate>
        <AppInput
          required
          autoFocus
          label={t('otp')}
          placeholder={t('enterOtp')}
          value={otp}
          inputMode="numeric" // mobile hiện bàn phím số
          onChange={(e) => setOtp(e.target.value)}
        />
        <AppButton
          type="submit"
          text={t('verify')}
          loading={isPending}
          disabled={isPending || !otp.trim()}
        />
      </Form>

      <FooterText>
        {t('alreadyHaveAccount')} <Link to={ROUTES.SIGN_IN}>{t('signIn')}</Link>
      </FooterText>
    </>
  );
};
```

Barrel: thêm `VerifyOtp` và `useVerifyOtpHooks` vào hai file index.

💡 **Vì sao dùng `location.state` thay vì query string `?hash=...`?** `hash` chứa dữ liệu đăng ký đã mã hoá. Để trên URL sẽ lưu vào history, log của proxy, có thể bị chia sẻ nhầm. `state` chỉ tồn tại trong bộ nhớ của tab. Nhược điểm: F5 ở `/verify-otp` sẽ mất `state` → `missingHash` → quay về đăng ký. Đây là trade-off có chủ đích.

**✅ Checkpoint 10:**

1. Gõ tay `/verify-otp` → bị đẩy về `/sign-up`.
2. Từ Register thành công → thấy "Nhập mã chúng tôi đã gửi tới a@b.com".
3. Nhập sai OTP → toast đỏ "OTP không đúng" (từ BE).
4. Nhập đúng → `201`, `Set-Cookie`, Redux có user, về `/`.
5. Đợi quá 5 phút (mặc định `OTP_EXPIRATION_MINUTES`) → toast "OTP hết hạn".

---

### Bước 11: Đăng xuất (Sign out) 🟢

| Kiểu     | Kích hoạt                                   | Xử lý ở                 |
| -------- | ------------------------------------------- | ----------------------- |
| Chủ động | Người dùng bấm "Đăng xuất" trong `UserMenu` | `useSignOut`            |
| Bị động  | Request 401, refresh thất bại               | `useAuthLogoutListener` |

**Files:**

```
src/hooks/useSignOut.ts                     [M]
src/hooks/index.ts                          [S]
src/hooks/useAuthLogoutListener.ts          [=]
src/components/common/UserMenu.tsx          [M]
src/components/common/index.ts              [S]
src/components/layouts/AppLayout.tsx        [S]
```

#### 11.1. `useSignOut.ts`

```ts
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api';
import { ROUTES } from '@/constants';
import { useReduxUser } from '@/redux';

export const useSignOut = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { resetUserInfo } = useReduxUser();

  return async () => {
    try {
      await authApi.signOut(); // BE: blacklist access token trong Redis + xóa cookie
    } finally {
      // finally: dù API lỗi (mất mạng, cookie đã hết hạn) vẫn dọn phía FE
      resetUserInfo(); // Redux → AppRoute đá khỏi trang protected
      queryClient.clear(); // user sau không thấy cache của user trước
      navigate(ROUTES.SIGN_IN, { replace: true });
    }
  };
};
```

> 🟡 Bản gốc còn `resetUnread()` cho slice notification. Bỏ ở bản cơ bản.

```ts
// src/hooks/index.ts
export * from './useAppToast';
export * from './useAuthLogoutListener';
export * from './useDebounce';
export * from './useLanguage';
export * from './useSignOut';
```

#### 11.2. `useAuthLogoutListener.ts` (đọc)

File này đã nằm trong base và đã được gọi trong `RootLayout`. Nó lắng nghe `AUTH_LOGOUT_EVENT` từ `axiosInstance`, gọi `resetUserInfo()` và `navigate(ROUTES.SIGN_IN)`.

💡 `axiosInstance.ts` là module TS thuần, nằm **ngoài** React tree, không dùng được hook. Nó phát `CustomEvent` trên `window`; hook bên trong React lắng nghe và xử lý. Đây là mẫu **decoupling qua event**.

#### 11.3. `UserMenu.tsx` — avatar + dropdown

```tsx
import { FC, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { Colors, ROUTES } from '@/constants';
import { useSignOut } from '@/hooks';
import { useReduxUser } from '@/redux';

export const UserMenu: FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user } = useReduxUser();
  const handleSignOut = useSignOut();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  if (!user) return null; // khách → không hiện menu

  const initial = (user.firstName || user.username || user.email || '?')
    .charAt(0)
    .toUpperCase();
  const name =
    [user.firstName, user.lastName].filter(Boolean).join(' ') ||
    user.username ||
    user.email;

  return (
    <Wrapper ref={ref}>
      <AvatarButton onClick={() => setOpen((o) => !o)} aria-label="user menu">
        {user.avatar ? (
          <Avatar src={user.avatar} alt="avatar" />
        ) : (
          <Initial>{initial}</Initial>
        )}
      </AvatarButton>

      {open && (
        <Dropdown>
          <Header>
            <Name>{name}</Name>
            <Email>{user.email}</Email>
          </Header>
          <Item
            onClick={() => {
              setOpen(false);
              navigate(ROUTES.PROFILE);
            }}
          >
            {t('profileTitle')}
          </Item>
          <Item
            $danger
            onClick={() => {
              setOpen(false);
              handleSignOut();
            }}
          >
            {t('signOut')}
          </Item>
        </Dropdown>
      )}
    </Wrapper>
  );
};

const Wrapper = styled.div`
  position: relative;
`;
const AvatarButton = styled.button`
  width: 38px;
  height: 38px;
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid ${Colors.pink_30};
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  &:hover {
    border-color: ${Colors.pink_60};
  }
`;
const Avatar = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;
const Initial = styled.span`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${Colors.pink_10};
  color: ${Colors.pink_60};
  font-weight: 600;
  font-size: 16px;
`;
const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 220px;
  z-index: 100;
  background: ${Colors.white_10};
  border: 1px solid ${Colors.pink_20};
  border-radius: 12px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
  overflow: hidden;
`;
const Header = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${Colors.white_20};
`;
const Name = styled.div`
  font-weight: 600;
  color: ${Colors.black_20};
  font-size: 14px;
`;
const Email = styled.div`
  margin-top: 2px;
  color: ${Colors.gray_50};
  font-size: 12px;
  word-break: break-all;
`;
const Item = styled.button<{ $danger?: boolean }>`
  width: 100%;
  padding: 12px 16px;
  border: none;
  background: transparent;
  text-align: left;
  cursor: pointer;
  font-size: 14px;
  color: ${({ $danger }) => ($danger ? Colors.red_10 : Colors.gray_70)};
  &:hover {
    background: ${Colors.pink_10};
  }
`;
```

Thêm `export * from './UserMenu';` vào `src/components/common/index.ts`.

#### 11.4. `AppLayout.tsx` — topbar có UserMenu hoặc nút Đăng nhập

Base đang có `<Sidebar>Sidebar</Sidebar>` và topbar chỉ có `LanguageSwitcher`. Sửa phần JSX (styled giữ nguyên, thêm hai styled mới):

```tsx
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { LanguageSwitcher, UserMenu } from '@/components';
import { Colors, ROUTES } from '@/constants';
import { useReduxUser } from '@/redux';

export const AppLayout: FC = () => {
  const { t } = useTranslation();
  const { user } = useReduxUser();

  return (
    <Wrapper>
      <Sidebar>
        <Brand to={ROUTES.ROOT}>{t('appName')}</Brand>
      </Sidebar>
      <Main>
        <TopBar>
          <TopBarSpacer />
          <LanguageSwitcher />
          {user ? (
            <UserMenu />
          ) : (
            <SignInLink to={ROUTES.SIGN_IN}>{t('signIn')}</SignInLink>
          )}
        </TopBar>
        <Content>
          <Outlet />
        </Content>
      </Main>
    </Wrapper>
  );
};

const Brand = styled(Link)`
  font-weight: 700;
  color: ${Colors.pink_70};
  text-decoration: none;
`;
const SignInLink = styled(Link)`
  padding: 8px 18px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;
  color: ${Colors.white_10};
  background: ${Colors.pink_60};
  &:hover {
    background: ${Colors.pink_70};
  }
`;
// ... TopBarSpacer, Wrapper, Sidebar, Main, TopBar, Content giữ nguyên của base;
// thêm `gap: 12px;` vào TopBar để các nút không dính nhau.
```

**✅ Checkpoint 11:**

1. Khách vào `/` thấy nút Đăng nhập; bấm → `/sign-in`.
2. Đã login: bấm avatar → dropdown; click ra ngoài → đóng.
3. Bấm Đăng xuất → `POST /api/auth/logout` 200, response `Set-Cookie` xóa 2 cookie, Redux `user = undefined`, URL `/sign-in`, `persist:user` không còn user.
4. Sau logout gõ `/profile` → về `/sign-in`.
5. Test bị động: login xong, xóa **cả 2** cookie trong DevTools → Application → Cookies, F5, vào `/profile`. Chưa có AuthBootstrap nên chưa có request nào → vẫn thấy `/profile` với dữ liệu cũ trong Redux. Đây chính là vấn đề bước 12 giải quyết.

---

### Bước 12: AuthBootstrap — đồng bộ profile khi F5 🟡

**Vấn đề:** login chỉ trả `{ id, username, email, role }`. Redux (persist) sẽ giữ đúng 4 field đó mãi, dù user đã đổi avatar/tên. Ngoài ra Redux có thể "tưởng" đang login trong khi cookie đã hết hạn.

**Giải pháp:** khi app khởi động và Redux có user, gọi `GET /api/users` một lần. Thành công → cập nhật Redux bằng profile đầy đủ. Thất bại 401 → interceptor refresh; nếu refresh cũng thất bại → `emitAuthLogout()`… nhưng request này có `_skipAuthLogout: true` nên **không** đá logout, tránh trường hợp mạng lỗi tạm mà user bị đăng xuất.

**Files:**

```
src/components/one-offs/AuthBootstrap.tsx   [M]
src/components/one-offs/index.ts            [M]
src/components/layouts/RootLayout.tsx       [S]
```

```tsx
// src/components/one-offs/AuthBootstrap.tsx
import { FC, PropsWithChildren, useEffect } from 'react';
import { useGetCurrentUserProfile } from '@/react-query';
import { useReduxUser } from '@/redux';
import { AppLoader } from '../common';

export const AuthBootstrap: FC<PropsWithChildren> = ({ children }) => {
  const { user, setUserInfo } = useReduxUser();
  const hasSession = !!user;

  // enabled: chỉ gọi khi Redux có user; khách thì không gọi gì
  const { userInfo, isFetching, isSuccess, isError } = useGetCurrentUserProfile(
    {
      configs: { enabled: hasSession },
    }
  );

  useEffect(() => {
    if (isSuccess && userInfo) setUserInfo(userInfo); // ghi đè bằng profile đầy đủ
  }, [isSuccess, userInfo, setUserInfo]);

  // Đang fetch lần đầu → hiện loader thay vì render app với dữ liệu cũ
  const isBootstrapping = hasSession && isFetching && !isSuccess && !isError;
  if (isBootstrapping) return <AppLoader />;

  return <>{children}</>;
};
```

```ts
// one-offs/index.ts
export * from './AuthBootstrap';
```

Trong `RootLayout.tsx` của base, bọc `Suspense` + `Outlet` (phải nằm **bên trong** `QueryClientProvider` vì `AuthBootstrap` dùng `useQuery`):

```tsx
import { AuthBootstrap } from '../one-offs';
// ...
<QueryClientProvider client={queryClient}>
  <AuthBootstrap>
    <Suspense fallback={<AppLoader />}>
      <Outlet />
    </Suspense>
  </AuthBootstrap>
  <ReactQueryDevtools initialIsOpen={false} />
  <ToastContainer closeButton={false} position="bottom-left" />
</QueryClientProvider>;
```

💡 Kết hợp với `queryClient.invalidateQueries({ queryKey: [QK_GET_USER_PROFILE] })` ở bước 10: sau verify OTP, query này bị đánh dấu cũ → `AuthBootstrap` fetch lại → Redux có profile đầy đủ ngay, không cần F5.

**✅ Checkpoint 12:**

1. Login xong F5 → thấy `GET /api/users` trong Network, Redux user có thêm `firstName`, `avatar`, `createdAt`. Trang `/profile` hiện JSON đầy đủ.
2. Xóa cookie `access_token` (giữ `refresh_token`), F5 → `GET /api/users` 401 → interceptor gọi `POST /api/auth/refresh` → thành công → retry OK, vẫn đăng nhập.
3. Xóa **cả 2** cookie, F5 → refresh 401 → vì `_skipAuthLogout`, không bị đá; nhưng request có dữ liệu tiếp theo (ví dụ vào một trang gọi API) sẽ đá về `/sign-in`. Bài tập 6.5 bàn có nên đá ngay ở đây không.

---

### Bước 13: Quên mật khẩu / Đặt lại mật khẩu 🟡

Hai trang này tồn tại trong `pink-story-app` (commit `a71f435`), dùng luồng "link qua email" chứ không phải OTP. Schema (bước 5), mutation (bước 4), endpoint (bước 2), interface (bước 1) đã có sẵn; bước này chỉ thêm hook, trang, route.

**Files:**

```
src/modules/auth/hooks/useForgotPasswordHooks.ts   [M]
src/modules/auth/hooks/useResetPasswordHooks.ts    [M]
src/modules/auth/pages/ForgotPassword.tsx          [M]
src/modules/auth/pages/ResetPassword.tsx           [M]
src/router/elements/authElements.tsx               [S]  thêm 2 export
src/router/routes/authRoutes.tsx                   [S]  thêm 2 route
```

#### 13.1. `useForgotPasswordHooks.ts`

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAppToast } from '@/hooks';
import { IForgotPasswordFormValues } from '@/interfaces';
import { useForgotPasswordMutation } from '@/react-query';
import { forgotPasswordValidationSchema } from '@/validations';

export const useForgotPasswordHooks = () => {
  const { t } = useTranslation();
  const { showServerErrorMsg, showServerSuccessMsg } = useAppToast();

  // null = chưa gửi; có giá trị = đã gửi, hiện màn "kiểm tra email"
  const [sentToEmail, setSentToEmail] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IForgotPasswordFormValues>({
    mode: 'onTouched',
    defaultValues: { email: '' },
    resolver: zodResolver(forgotPasswordValidationSchema),
  });

  const { mutate: forgotPassword, isPending } = useForgotPasswordMutation({
    configs: {
      onSuccess: (res, variables) => {
        showServerSuccessMsg(res, t('forgotPasswordSuccess'));
        setSentToEmail(variables.body.email);
      },
      onError: showServerErrorMsg, // 429 khi gửi lại quá sớm → message từ BE
    },
  });

  const send = (email: string) => {
    if (isPending) return;
    forgotPassword({ body: { email } });
  };

  const onSubmit = handleSubmit((values) => send(values.email));
  const onResend = () => {
    if (sentToEmail) send(sentToEmail);
  };

  return {
    t,
    control,
    errors,
    isValid,
    isPending,
    onSubmit,
    onResend,
    sentToEmail,
  };
};
```

#### 13.2. `useResetPasswordHooks.ts`

```ts
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ROUTES } from '@/constants';
import { useAppToast } from '@/hooks';
import { IResetPasswordFormValues } from '@/interfaces';
import { useResetPasswordMutation } from '@/react-query';
import { resetPasswordValidationSchema } from '@/validations';

export const useResetPasswordHooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // BE dựng link .../reset-password?token=...
  const { showServerErrorMsg, showServerSuccessMsg } = useAppToast();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<IResetPasswordFormValues>({
    mode: 'onTouched',
    defaultValues: { newPassword: '', confirmNewPassword: '' },
    resolver: zodResolver(resetPasswordValidationSchema),
  });

  const { mutate: resetPassword, isPending } = useResetPasswordMutation({
    configs: {
      onSuccess: (res) => {
        showServerSuccessMsg(res, t('resetPasswordSuccess'));
        navigate(ROUTES.SIGN_IN, { replace: true });
      },
      onError: showServerErrorMsg,
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!token) return;
    resetPassword({ body: { token, ...values } });
  });

  return {
    t,
    control,
    errors,
    isValid,
    isPending,
    onSubmit,
    missingToken: !token,
  };
};
```

#### 13.3. Hai trang

`ForgotPassword.tsx`: nếu `sentToEmail` có giá trị → hiện `forgotPasswordSentTitle`, `forgotPasswordSentSubtitle` (interpolate `email`), nút `resendLink` (variant `secondary`, gọi `onResend`) và link `backToSignIn`. Ngược lại → form một ô email (dùng `Controller` + `AppInput` như SignIn) với nút `sendResetLink`.

`ResetPassword.tsx`: nếu `missingToken` → `<Navigate to={ROUTES.FORGOT_PASSWORD} replace />`. Ngược lại → hai ô `newPassword`, `confirmNewPassword` (type `password`), nút `resetPasswordAction`, footer có hai link `requestNewLink` và `backToSignIn`.

Cả hai đều dùng `Title`, `Subtitle`, `Form`, `FooterText` từ `../styled`. Đối chiếu `pink-story-app/src/modules/auth/pages/{ForgotPassword,ResetPassword}.tsx` nếu cần, chúng dùng đúng bộ styled và key i18n này.

#### 13.4. Route

```tsx
// elements/authElements.tsx — thêm
export const { ForgotPassword } = lazyImport(() => import('@/modules/auth'), 'ForgotPassword');
export const { ResetPassword } = lazyImport(() => import('@/modules/auth'), 'ResetPassword');

// routes/authRoutes.tsx — thêm vào children
{ path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
{ path: ROUTES.RESET_PASSWORD, element: <ResetPassword /> },
```

💡 **Vì sao token đi trên URL ở đây, còn `hash` đăng ký thì không?** Vì token này phải đi qua email: người dùng bấm link, trình duyệt mở tab mới, không có `location.state` nào tồn tại. Backend bù lại bằng cách băm token trước khi lưu Redis, dùng một lần, và có hạn.

**✅ Checkpoint 13:**

1. `/forgot-password`, nhập email → 200, màn "kiểm tra email" hiện đúng email.
2. Bấm "Gửi lại" ngay → toast đỏ 429 với message cooldown từ BE.
3. Gõ tay `/reset-password` (không `token`) → về `/forgot-password`.
4. Bấm link trong email → form đặt lại; mật khẩu không khớp → `passwordMismatch`; hợp lệ → 200, về `/sign-in`, đăng nhập được bằng mật khẩu mới.
5. Dùng lại link cũ → toast đỏ "token không hợp lệ".

---

### Bước 14: Kiểm thử thủ công end-to-end 🟢

**Đăng ký**

- [ ] Bỏ trống → lỗi ở 4 field bắt buộc, role mặc định reader.
- [ ] Mật khẩu `abc` → lỗi min 8.
- [ ] Xác nhận khác mật khẩu → `passwordMismatch`.
- [ ] Email/username đã tồn tại → toast đỏ message BE (tiếng Việt khi `Accept-Language: vi`).
- [ ] Hợp lệ → về `/verify-otp` kèm email hiển thị; email nhận OTP.
- [ ] Gõ tay `/verify-otp` → về `/sign-up`.
- [ ] OTP sai → toast đỏ. OTP đúng → cookie set, Redux có user, về `/`.

**Đăng nhập**

- [ ] Sai mật khẩu → toast đỏ, **không** set Redux.
- [ ] Đúng → toast xanh, Redux `{ id, username, email, role }`, reader về `/`.
- [ ] `isPending` → nút spinner, không bấm được 2 lần.
- [ ] F5 → vẫn login; `GET /api/users` chạy và Redux có profile đầy đủ.
- [ ] Đã login gõ `/sign-in` → về `/`.

**Đăng xuất**

- [ ] Bấm Đăng xuất → về `/sign-in`, 2 cookie bị xóa, `persist:user` rỗng, React Query cache rỗng.
- [ ] Gõ `/profile` sau logout → về `/sign-in`.
- [ ] Xóa `access_token` thủ công + F5 → refresh tự chạy, vẫn đăng nhập.

**Quên mật khẩu (🟡)**

- [ ] Gửi link, gửi lại ngay → 429.
- [ ] Đặt lại thành công → đăng nhập được bằng mật khẩu mới; link cũ không dùng lại được.

**Chất lượng**

- [ ] `yarn lint`, `yarn typecheck`, `yarn test:run` sạch (nhớ `nvm use`).

---

## 5. Giải thích sâu các điểm khó

### 5.1. Interceptor 401 → refresh → hàng đợi

Trang mount gọi **3 request song song**, access token hết hạn → **cả 3 đều 401**. Không có hàng đợi: 3 lần gọi refresh → backend **xoay refresh token** (blacklist token cũ trong Redis) → 2 lần sau thất bại → user bị logout oan.

```
A 401 → isRefreshing=false → đặt true, gọi POST /api/auth/refresh
B 401 → isRefreshing=true  → push vào listFailedRequest, chờ
C 401 → isRefreshing=true  → push, chờ
refresh OK → processQueue(null) → B, C resolve → tự chạy lại → return apiClient(A)
finally → isRefreshing=false
```

Ba điều kiện bảo vệ trong base: `_retry` (mỗi request retry 1 lần), loại trừ `AUTH_PATH_PREFIX` (login sai cũng 401, không được refresh), và gọi refresh bằng `axios` gốc để không đi qua chính interceptor này.

Điểm riêng của Pink Story: refresh cookie có `path: '/api/auth/refresh'` → trình duyệt **chỉ gửi nó** khi gọi đúng endpoint đó. Các request khác không mang refresh token → giảm bề mặt tấn công.

### 5.2. Đăng ký "stateless OTP" bằng `hash`

Backend không lưu "đơn đăng ký chờ xác thực" vào DB. Nó gom `{ email, username, password đã hash, role, otp, exp }` thành JSON, mã hoá thành `hash`, trả cho FE. FE cầm `hash` đó gửi lại cùng OTP. Backend giải mã, so OTP, kiểm hạn, rồi mới `INSERT` user.

Hệ quả cho FE: `hash` là **thứ duy nhất** nối 2 bước. Mất `hash` (F5 ở trang OTP) = phải đăng ký lại. Đó là lý do `VerifyOtp` có `missingHash → Navigate to /sign-up`.

### 5.3. Guard dựa vào Redux, không dựa vào cookie

Cookie HttpOnly → JS không đọc. Redux user là "bản sao hiển thị". Hai trạng thái **có thể lệch** (Redux có user, cookie đã hết hạn). Sự lệch tự sửa theo 2 cách:

- Request đầu tiên 401 → refresh → thất bại → `emitAuthLogout` → Redux reset.
- `AuthBootstrap` gọi `GET /api/users` ngay khi khởi động để phát hiện sớm.

### 5.4. `queryClient.clear()` ở cả login và logout

- **Logout**: xóa cache để user sau không thấy dữ liệu user trước.
- **Login**: phòng trường hợp user A logout không sạch (mất mạng lúc logout) rồi user B login trên cùng tab. Clear **trước** `setUserInfo` để không có khoảnh khắc nào user B thấy cache của A.

### 5.5. `PersistGate` và nhấp nháy

Không có `PersistGate`: F5 → Redux `user = undefined` → `AppRoute` đẩy về `/sign-in` → vài ms sau rehydrate xong → `AuthLayout` đẩy về `/`. URL đổi 2 lần, màn hình nháy. `PersistGate` (đã có trong `index.tsx` của base) giữ loader tới khi rehydrate xong.

### 5.6. `Controller` vs `useState` thuần

`Register` có 7 field, rule phức tạp → `react-hook-form` + zod. `VerifyOtp` có 1 field, rule "không rỗng" → `useState`. Bài học: chọn công cụ theo độ phức tạp, không theo thói quen.

### 5.7. Message lỗi: FE hay BE?

- **Lỗi validate form** (trước khi gửi): zod trả key → FE `t(key)`.
- **Lỗi nghiệp vụ** (email tồn tại, OTP sai, cooldown): BE trả message **đã dịch** theo `Accept-Language` → FE hiện thẳng qua `getAPIErrorMsg`.
- **Thành công**: BE trả `message` → `showServerSuccessMsg(res, fallback)` ưu tiên BE.

Hai nguồn, một ngôn ngữ: vì FE gửi `Accept-Language` chính là `i18n.language`.

### 5.8. `_skipAuthLogout`

Không phải mọi 401 đều nên đá user ra. `AuthBootstrap` là request "thăm dò" chạy mỗi lần mở app; nếu nó thất bại vì mạng chập chờn lúc khởi động mà đá logout thì rất khó chịu, trong khi phiên có thể vẫn còn tốt. Cờ này cho từng request quyền nói "tôi tự xử lý thất bại của mình".

Đường đi của cờ, đọc từ nơi gắn tới nơi dùng:

```
authApi.getCurrentUserProfile()           gắn { _skipAuthLogout: true } vào config
   │
axios giữ nguyên object config đó suốt vòng đời request
   │  GET /api/users → 401
   ▼
interceptor: error.config chính là object cũ → originalRequest
   │  refresh cũng 401
   ▼
if (!originalRequest._skipAuthLogout) emitAuthLogout();   ← true nên BỎ QUA logout
```

Hai hệ quả cần nhớ:

- Request **không** gắn cờ thì giá trị là `undefined`, `!undefined` là `true`, nên logout chạy bình thường. Đây là mặc định an toàn: quên gắn thì mất tính năng "bỏ qua", không phải mất tính năng bảo vệ.
- Vì `AuthBootstrap` không tự đăng xuất, trạng thái lệch (Redux có user, cookie đã chết) vẫn còn sau khi nó thất bại. App tiếp tục chạy với dữ liệu persist hơi cũ, và request thật tiếp theo sẽ đá logout đúng lúc. Bài tập 6.5 bàn có nên phân biệt 401 thật với lỗi mạng để xử lý khéo hơn không.

### 5.9. zod thay Yup: khác ở đâu, giống ở đâu

| Việc                | Yup (`pink-story-app`)                 | zod v4 (tài liệu này)                                  |
| ------------------- | -------------------------------------- | ------------------------------------------------------ |
| Bắt buộc            | `.required('key')`                     | `.min(1, 'key')`                                       |
| Regex               | `.matches(re, 'key')`                  | `.regex(re, 'key')`                                    |
| Chỉ cho vài giá trị | `Yup.mixed().oneOf([...], 'key')`      | `z.enum([...], { error: 'key' })`                      |
| Hai field bằng nhau | `.oneOf([Yup.ref('password')], 'key')` | `.refine(v => ..., { error: 'key', path: ['field'] })` |
| Nối vào RHF         | `yupResolver(schema) as Resolver<T>`   | `zodResolver(schema)` (không cần ép kiểu)              |
| Suy kiểu từ schema  | `Yup.InferType<typeof s>`              | `z.infer<typeof s>`                                    |

Giống nhau: message là key i18n, UI gọi `t(key)`; `mode: 'onTouched'`; `Controller` + `AppInput`.

---

## 6. Bài tập tự luyện

1. **Đồng bộ rule mật khẩu với backend** — backend chỉ cần 6+ ký tự, hoa, thường, số (không bắt ký tự đặc biệt) và chỉ cho phép `a-zA-Z0-9@$!%*?&`. Sửa `passwordSchema` và quyết định: FE nên chặt hơn BE hay bằng BE? Viết lý do 2 dòng vào comment.
2. **Show/hide password** — component `PasswordInput` dùng prop `suffix` của `AppInput`, toggle `type`.
3. **Nút Đăng ký cho khách** — thêm `SignUpLink` bên cạnh `SignInLink` trong `AppLayout` (đáp án có).
4. **Đếm ngược gửi lại OTP** — thêm nút "Gửi lại mã" ở `VerifyOtp`, gọi lại `authApi.register` với dữ liệu cũ (cần truyền thêm form values qua `state`), disable 60 giây.
5. **AuthBootstrap thất bại thì sao?** — hiện tại `isError` chỉ bỏ loader. Thử: nếu lỗi là 401 (cookie hết hạn thật) thì `resetUserInfo()` ngay; nếu lỗi mạng thì giữ Redux. Phân biệt bằng `error.response?.status`.
6. **Redirect về trang trước** — `AppRoute` lưu `location.pathname` vào `state.from`; `useSignInHooks` ưu tiên `from` hơn `getDefaultRouteByRole`.
7. **Trang `/studio` và `/admin` placeholder** với `AppRoute allowedRoles` — login bằng creator/admin và kiểm tra reader gõ `/admin` bị đẩy về `/`.
8. **Test `useSignInHooks`** — sao chép `pink-story-app/src/modules/auth/hooks/__tests__/useSignInHooks.test.tsx`, **bỏ mock `posthog-js/react`**, sửa import store về `@/redux`. Rồi viết thêm test cho `useRegisterHooks`: mock `authApi.register` trả `{ data: { hash: 'x' } }`, kiểm tra `navigate` được gọi với `/verify-otp` và `state.hash === 'x'`.
9. **Đọc `HttpExceptionFilter` của backend** rồi viết test cho `getAPIErrorMsg` với 3 hình dạng lỗi thật: validation (`errors` là object), nghiệp vụ (`errors` là string), 503 (`message` mặc định).
10. **Ổn định `useReduxUser`** — bọc `setUserInfo` / `resetUserInfo` bằng `useCallback` để `useAuthLogoutListener` không gắn lại listener mỗi render. Kiểm tra bằng `console.count` trong `useEffect`.
11. **Đổi sang Yup** — `yarn add yup`, viết lại 4 schema theo đáp án, so sánh kiểu suy ra. Bạn sẽ hiểu vì sao đáp án phải ép kiểu `as Resolver<...>`.

---

## 7. Lỗi thường gặp

| Triệu chứng                                                              | Nguyên nhân                                                             | Cách sửa                                                |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------- |
| `yarn` báo `The engine "node" is incompatible ... Got "20.x"`            | Chưa `nvm use`                                                          | `nvm use` (base ghim Node 22 trong `.nvmrc`)            |
| CORS: `Access-Control-Allow-Origin` không khớp                           | FE không chạy ở `http://localhost:4001`                                 | Kiểm tra `.env` có `VITE_PORT=4001`, restart `yarn dev` |
| Bấm Đăng nhập, Network không có request                                  | `VITE_API_URL` thiếu `http://` (env.ts sẽ throw lúc boot)               | Sửa `.env`, restart                                     |
| Login 200 nhưng request sau 401, không thấy cookie                       | Thiếu `withCredentials: true`                                           | Kiểm tra `axiosInstance`                                |
| Cookie có nhưng request `/api/users` vẫn 401                             | Cookie `SameSite=Strict` + mở FE bằng `127.0.0.1` thay `localhost`      | Dùng đúng `http://localhost:4001`                       |
| Form login không cho gửi với tài khoản seed `Password123`                | zod bắt ký tự đặc biệt, BE không bắt                                    | Bài tập 6.1                                             |
| Refresh luôn thất bại                                                    | `AUTH_REFRESH_PATH` còn là `/api/auth/refresh-token`                    | Sửa `src/constants/auth.ts` (bước 2.1)                  |
| BE trả message tiếng Anh dù đang chọn VI                                 | Còn gửi `?lang=` thay header `Accept-Language`                          | Bước 2.2                                                |
| Bài test `axiosInstance` đỏ                                              | Đã đổi header/path nhưng chưa sửa test                                  | Bước 2.4                                                |
| Toast thành công hiện "Success" thay câu tiếng Việt                      | `showServerSuccessMsg` còn đọc `data.message`                           | Bước 6.2                                                |
| `Property '_skipAuthLogout' does not exist on type 'AxiosRequestConfig'` | Đã sửa `axiosInstance.ts` nhưng chưa khai báo cờ trong `global.d.ts`    | Bước 2.3, nửa sau                                       |
| Sửa `global.d.ts` rồi mà VS Code vẫn gạch đỏ                             | TS server trong editor còn giữ cache file khai báo cũ                   | Command Palette → "TypeScript: Restart TS Server"       |
| TS báo lỗi ở `resolver: zodResolver(...)`                                | Schema và interface form lệch nhau (ví dụ `role` là `EUserRole` đầy đủ) | Sửa interface về `READER \| CREATOR` hoặc sửa schema    |
| `passwordMismatch` không hiện                                            | `.refine` đặt trên field thay vì trên object, hoặc thiếu `path`         | Xem `registerValidationSchema` bước 5                   |
| Vào `/verify-otp` bị đẩy về `/sign-up` sau khi F5                        | `location.state` mất khi reload                                         | Hành vi có chủ đích, xem 5.2                            |
| `useNavigate() may be used only in the context of a <Router>`            | Hook dùng `useNavigate` nằm ngoài `RouterProvider`                      | Đặt vào `RootLayout` hoặc component con của nó          |
| `No QueryClient set` khi mount `AuthBootstrap`                           | Đặt `AuthBootstrap` ngoài `QueryClientProvider`                         | Bước 12: bọc bên trong provider                         |
| Register gửi `firstName: ""` bị BE từ chối                               | `IsOptional` không bỏ qua chuỗi rỗng                                    | Chuyển chuỗi rỗng thành `undefined` như bước 9.1        |
| `Register` không lazy load được / trắng trang                            | Chưa export từ `modules/auth/index.ts`                                  | Kiểm tra barrel                                         |
| `yarn typecheck` đỏ ở `authElements.tsx` sau bước 7                      | `@/modules/auth` chưa tồn tại                                           | Bình thường tới hết bước 8                              |
| Commit báo `lint-staged requires Git 2.32.0`                             | Git trên máy quá cũ                                                     | Cài Git mới                                             |
| Link trong email reset trỏ sai host                                      | `frontendBaseUrl` của backend không phải `http://localhost:4001`        | Sửa `.env` của backend                                  |
| Gửi lại link reset → 429                                                 | Cooldown của BE                                                         | Hành vi đúng, chờ hết cooldown                          |

---

## 8. Phụ lục

### 8.1. Cây file sau 14 bước

**[M]** = file mới bạn tạo, **[S]** = file có sẵn bạn sửa, **[=]** = có sẵn, giữ nguyên, **[X]** = xóa.

```
src/
├── api/
│   ├── auth/{auth.endpoint,authApi,index}.ts              [M]
│   ├── axiosInstance.ts              [S] Accept-Language + _skipAuthLogout
│   ├── __tests__/axiosInstance.test.ts                    [S] header + path refresh
│   ├── axiosService.ts               [=]
│   └── index.ts                      [S] export './auth'
├── components/
│   ├── common/AppRoute.tsx           [S] thêm allowedRoles
│   ├── common/UserMenu.tsx           [M] menu đăng xuất
│   ├── common/index.ts               [S]
│   ├── layouts/AuthLayout.tsx        [S] redirect theo role
│   ├── layouts/AppLayout.tsx         [S] UserMenu / nút Đăng nhập
│   ├── layouts/RootLayout.tsx        [S] bọc AuthBootstrap
│   └── one-offs/{AuthBootstrap.tsx,index.ts}              [M] 🟡
├── constants/common.ts               [S] thêm API_PREFIX
├── constants/auth.ts                 [S] đổi path refresh, dùng API_PREFIX
├── constants/routes.ts               [S] thêm 7 route
├── enums/{user,index}.ts             [M] EUserRole
├── hooks/useAppToast.tsx             [S] fallback cho success
├── hooks/__tests__/useAppToast.test.tsx                   [S] thêm 1 test
├── hooks/useSignOut.ts               [M]
├── hooks/index.ts                    [S]
├── interfaces/user.interface.ts      [S] khớp backend
├── interfaces/auth.interface.ts      [M]
├── interfaces/index.ts               [S]
├── modules/auth/
│   ├── hooks/{useSignInHooks,useRegisterHooks,useVerifyOtpHooks}.ts        [M]
│   ├── hooks/{useForgotPasswordHooks,useResetPasswordHooks}.ts             [M] 🟡
│   ├── pages/{SignIn,Register,VerifyOtp}.tsx                               [M]
│   ├── pages/{ForgotPassword,ResetPassword}.tsx                            [M] 🟡
│   └── styled/StyledSignIn.ts                                              [M]
├── pages/{Home,Profile,index}.ts(x)  [M] placeholder
├── react-query/auth/*.ts             [M] 5 mutation + 1 query
├── react-query/index.ts              [S]
├── redux/                            [=]
├── router/elements/{authElements,appElements,index}.ts(x) [M]
├── router/routes/appRoutes.tsx       [X]
├── router/routes/{readerRoutes,accountRoutes}.tsx         [M]
├── router/routes/{authRoutes,index}.ts(x)                 [S]
├── router/AppRouter.tsx              [S]
├── translations/{en,vi}/auth.json    [M]
├── translations/{en,vi}/index.ts     [S]
├── translations/{en,vi}/validation.json                   [S] +3 key, -1 key
├── utils/route.ts                    [M] getDefaultRouteByRole
├── utils/index.ts                    [S]
├── validations/{common,signIn...,register...,forgotPassword...,resetPassword...,index}.ts  [M]
├── global.d.ts                       [S] thêm _skipAuthLogout
└── index.tsx                         [=]
```

### 8.2. Khác biệt `pink-story-app` so với base

Cột giữa là điểm xuất phát của bạn, cột phải là đích đến.

| Chủ đề           | Base (điểm xuất phát)                               | `pink-story-app` (đích đến)                                |
| ---------------- | --------------------------------------------------- | ---------------------------------------------------------- |
| Màn hình auth    | không có                                            | SignIn, Register, VerifyOtp, ForgotPassword, ResetPassword |
| Tầng API auth    | không có                                            | `api/auth/` đầy đủ                                         |
| Đăng ký          | —                                                   | 2 bước `register` → `{hash}` → `verify-register` → user    |
| Refresh endpoint | `/api/auth/refresh-token` trong `constants/auth.ts` | `/api/auth/refresh`                                        |
| Profile endpoint | —                                                   | `GET /api/users`                                           |
| Ngôn ngữ gửi BE  | query `?lang=`                                      | header `Accept-Language`                                   |
| Role             | không có enum                                       | `admin/creator/reader` (chữ thường)                        |
| Route paths      | `ROUTES` object, 2 key                              | `ERoute` enum, ~20 key                                     |
| Sau login        | —                                                   | `getDefaultRouteByRole(role)`                              |
| Guard            | chỉ kiểm tra có user                                | có user **và** đúng `allowedRoles`                         |
| Nhóm route       | `authRoutes` rỗng, `appRoutes` rỗng                 | auth / reader / account / studio / admin                   |
| Validate         | zod (chưa có schema)                                | yup, 12 schema                                             |
| Toast success    | đọc `data.message`                                  | đọc `message`, có `fallback`                               |
| Cờ axios         | `_retry`                                            | `_retry`, `_skipAuthLogout`                                |
| Đồng bộ profile  | không                                               | `AuthBootstrap` gọi `GET /api/users` khi khởi động         |
| Logout           | chỉ có listener tự động                             | thêm `useSignOut` + `queryClient.clear()`                  |
| PostHog / Socket | không có                                            | có, mount trong `RootLayout` / guard                       |

### 8.3. Thứ tự phụ thuộc giữa các tầng

```
enums, constants(routes, auth), interfaces
        ▲
api ────┤
redux ──┤
validations
react-query
        ▲
utils/route, hooks (useAppToast, useSignOut, useAuthLogoutListener)
        ▲
modules/auth (hooks → pages)
        ▲
router/elements → router/routes → components/layouts → one-offs/AuthBootstrap
```

Xong 14 bước và ít nhất 3 bài tập mục 6, bạn đã nắm trọn "xương sống" của Pink Story: HTTP layer có refresh, server state, client state persist, routing có guard theo role, form có validation, luồng đăng ký OTP stateless và luồng đặt lại mật khẩu qua email.
