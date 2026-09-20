# Kiến thức nền cho người mới — đọc kèm `auth-module-guide.md`

> File này giải thích **từ đầu** mọi khái niệm mà `auth-module-guide.md` dùng. Guide chính chỉ tóm tắt mỗi thứ một dòng; file này dành cho bạn khi câu tóm tắt đó chưa đủ. Mỗi mục có ba phần: **Nó là gì**, **Ví dụ nhỏ**, và **Gặp ở đâu trong guide**. Ví dụ lấy thẳng từ module auth để bạn thấy khái niệm đó dùng vào việc gì, không phải ví dụ đếm số trừu tượng.

> Cách đọc hiệu quả: **không đọc hết một lượt**. Mở bảng ở mục 11, xem bước bạn sắp làm cần mục nào, đọc đúng mục đó, rồi quay lại guide. Khái niệm chỉ dính khi bạn dùng nó ngay sau khi đọc.

---

## Mục lục

- [1. TypeScript tối thiểu](#1-typescript-tối-thiểu)
- [2. React cơ bản](#2-react-cơ-bản)
- [3. React Router](#3-react-router)
- [4. Form: react-hook-form + zod](#4-form-react-hook-form--zod)
- [5. Gọi API: Promise, axios, React Query](#5-gọi-api-promise-axios-react-query)
- [6. Redux Toolkit + redux-persist](#6-redux-toolkit--redux-persist)
- [7. Khái niệm về xác thực](#7-khái-niệm-về-xác-thực)
- [8. styled-components](#8-styled-components)
- [9. i18next](#9-i18next)
- [10. Công cụ: Vite, alias, barrel, test](#10-công-cụ-vite-alias-barrel-test)
- [11. Bước nào cần đọc mục nào](#11-bước-nào-cần-đọc-mục-nào)

---

## 1. TypeScript tối thiểu

Base viết bằng TypeScript. Bạn không cần giỏi TS, nhưng cần đọc được bảy thứ sau vì chúng xuất hiện ở mọi file.

### 1.1. `interface` — mô tả hình dạng một object

**Nó là gì.** Một bản mô tả "object này có những field nào, mỗi field kiểu gì". Không sinh ra code khi chạy; chỉ để trình biên dịch kiểm tra và editor gợi ý.

```ts
interface ISignInFormValues {
  email: string;
  password: string;
}

const values: ISignInFormValues = { email: 'a@b.com', password: 'x' }; // OK
const wrong: ISignInFormValues = { email: 'a@b.com' }; // lỗi: thiếu password
```

Dấu `?` sau tên field = **không bắt buộc** (có thể thiếu hoặc `undefined`):

```ts
interface IUserInfo {
  id: string | number; // "hoặc": id là string HOẶC number
  email: string;
  firstName?: string; // có thể không có
}
```

**Gặp ở đâu.** Bước 1: `IUserInfo`, `IRegisterFormValues`. Chữ `I` đầu tên là quy ước của codebase cho interface, không phải luật của TS.

### 1.2. `type` và union `|`

`type` đặt tên cho một kiểu bất kỳ. Dấu `|` nghĩa là "một trong các giá trị này":

```ts
type RoutePath = '/' | '/sign-in' | '/profile';
let p: RoutePath = '/sign-in'; // OK
p = '/abc'; // lỗi: không nằm trong danh sách
```

**Gặp ở đâu.** `RoutePath` trong `src/constants/routes.ts`; `ISignInResponse = IUserInfo` (đặt tên khác cho cùng một kiểu).

### 1.3. `enum` — tập giá trị có tên

```ts
enum EUserRole {
  READER = 'reader',
  CREATOR = 'creator',
  ADMIN = 'admin',
}

EUserRole.READER; // 'reader'
```

Dùng enum thay chuỗi trần để tránh gõ sai `'raeder'` mà TS không bắt được. `EUserRole.READER | EUserRole.CREATOR` là union chỉ gồm hai thành viên của enum.

**Gặp ở đâu.** Bước 1 `src/enums/user.ts`, bước 5 `z.enum([EUserRole.READER, EUserRole.CREATOR])`.

### 1.4. `as const` và `keyof typeof`

```ts
export const ROUTES = {
  ROOT: '/',
  SIGN_IN: '/sign-in',
} as const;
```

Không có `as const`, TS hiểu `ROUTES.ROOT` có kiểu `string` (bất kỳ chuỗi nào). Có `as const`, nó hiểu là kiểu **đúng chuỗi** `'/'`. Nhờ vậy dòng dưới sinh ra union của tất cả giá trị:

```ts
type RoutePath = (typeof ROUTES)[keyof typeof ROUTES]; // '/' | '/sign-in'
```

Đọc từ trong ra: `typeof ROUTES` = kiểu của object; `keyof` = các key (`'ROOT' | 'SIGN_IN'`); `[...]` = lấy kiểu của các giá trị tại các key đó.

**Gặp ở đâu.** Bước 1 `src/constants/routes.ts`. Đây là cách base làm "enum" mà không dùng `enum`.

### 1.5. Generic `<T>` — kiểu có tham số

**Nó là gì.** Một kiểu "để trống một chỗ" cho người dùng điền sau. Giống hàm nhận tham số, nhưng ở cấp kiểu.

```ts
interface IAppResponse<T> {
  data?: T; // T là gì do người dùng quyết
  success: boolean;
  code: number;
  message?: string;
}

// điền T = IUserInfo
const res: IAppResponse<IUserInfo> = {
  success: true,
  code: 200,
  data: { id: 1, email: 'a@b.com' },
};
// điền T = { hash: string }
const res2: IAppResponse<{ hash: string }> = {
  success: true,
  code: 201,
  data: { hash: 'abc' },
};
```

Hàm cũng có generic. `axiosService.post<TRes, TReq>(url, body)`: `TRes` là kiểu `data` trả về, `TReq` là kiểu body gửi đi. Khi gọi `axiosService.post<ISignInResponse, ISignInFormValues>(...)`, kết quả có kiểu `Promise<IAppResponse<ISignInResponse>>`, và ở nơi gọi bạn gõ `res.data.` là editor gợi ý ngay `email`, `role`.

**Gặp ở đâu.** Bước 1 `IAppResponse<T>`, bước 2 `axiosService`, bước 4 `IAppMutationOptions<TVariables, TResponse>`.

### 1.6. `as` — ép kiểu, và vì sao nên tránh

```ts
const { hash, email } = (state ?? {}) as ILocationState;
```

`as` bảo TS "tin tôi, cái này có kiểu X". TS không kiểm tra gì cả. Dùng khi dữ liệu đến từ chỗ TS không biết (như `location.state`, kiểu `unknown`). Nếu bạn phải `as` để **tắt** một lỗi TS trong code của mình, thường là dấu hiệu hai kiểu đang lệch nhau, nên sửa gốc.

`??` là "nếu bên trái là `null`/`undefined` thì lấy bên phải". Khác `||` ở chỗ `||` còn coi `''`, `0`, `false` là "rỗng".

**Gặp ở đâu.** Bước 10 `useVerifyOtpHooks`; bước 2 `axiosService` ép kiểu về `IAppResponse<TRes>`.

### 1.7. File `.d.ts` và "bổ sung kiểu cho thư viện"

**Nó là gì.** File đuôi `.d.ts` (declaration) chỉ chứa **khai báo kiểu**, không có code chạy. Trình duyệt không bao giờ thấy nó; chỉ trình biên dịch TS đọc. Dự án có một file như vậy: `src/global.d.ts`.

Bạn không cần `import` nó ở đâu cả. `tsconfig.app.json` có `"include": ["src"]`, nên TS tự nạp mọi file trong `src/`, kể cả file khai báo. Chữ "global" chỉ là quy ước tên, ý nói nội dung áp dụng cho toàn dự án.

**Vấn đề nó giải.** Interface `AxiosRequestConfig` nằm trong thư viện axios, bên trong `node_modules`. Bạn muốn gắn thêm hai field riêng (`_retry`, `_skipAuthLogout`) lên config của request, nhưng không được sửa file trong `node_modules`. Giải pháp của TS: khai báo lại interface **cùng tên** trong khối `declare module 'axios'`, và TS sẽ **gộp** hai khai báo thành một.

```ts
// src/global.d.ts
import 'axios'; // ← quan trọng, xem bên dưới

declare module 'axios' {
  export interface AxiosRequestConfig {
    _retry?: boolean;
    _skipAuthLogout?: boolean;
  }
}
```

Kết quả: `AxiosRequestConfig` giờ có cả field gốc của axios (`url`, `headers`, `timeout`…) lẫn hai cờ của bạn. Kỹ thuật này gọi là **module augmentation** (bổ sung module), một dạng của **declaration merging** (gộp khai báo).

**Điều kiện dễ vấp: file phải là một module.** TS coi một file là module khi nó có ít nhất một `import` hoặc `export` ở cấp cao nhất. Nếu không có dòng nào, TS hiểu `declare module 'axios'` là "tôi định nghĩa **mới** module axios" và **thay thế** toàn bộ kiểu gốc:

```
File .d.ts không có import nào:
  error TS2353: 'url' does not exist in type 'AxiosRequestConfig'
  → kiểu gốc của axios bị thay mất, chỉ còn _retry

Có ít nhất một dòng import:
  không lỗi → gộp đúng, có cả url lẫn _retry
```

Đó là lý do ba dòng `import` ở đầu `global.d.ts` trông như thừa nhưng không phải.

**Các nhóm khác trong cùng file:**

- `declare module '*.svg'`, `'*.png'`, … Vite cho phép `import logo from './logo.png'` và biến nó thành đường dẫn ảnh. TS mặc định không biết và sẽ báo "không tìm thấy module". Mấy dòng này bảo nó rằng import file ảnh là hợp lệ.
- `declare module 'styled-components'` với `DefaultTheme extends AppTheme`. Nhờ nó, gõ `theme.colors.` trong styled-components là editor gợi ý đúng các màu của `lightTheme`.

💡 Nhớ rằng đây **chỉ là chuyện của TypeScript**. Lúc chạy thật, `_skipAuthLogout` chỉ là một thuộc tính JavaScript bình thường trên object config. Khai báo trong `.d.ts` không tạo ra nó; nó chỉ cho phép bạn viết `originalRequest._skipAuthLogout` mà TS không báo đỏ.

**Gặp ở đâu.** Bước 2.3 khi thêm `_skipAuthLogout`. Nếu bạn sửa `axiosInstance.ts` mà quên sửa `global.d.ts`, lỗi sẽ là `Property '_skipAuthLogout' does not exist on type 'AxiosRequestConfig'`.

---

## 2. React cơ bản

### 2.1. Component và JSX

**Nó là gì.** Component là **một hàm trả về giao diện**. Giao diện viết bằng JSX: cú pháp giống HTML nhưng nằm trong file JS/TS, và có thể nhúng biểu thức JS trong `{}`.

```tsx
export const Profile = () => {
  const name = 'Hoàng';
  return <h2>Xin chào, {name}</h2>; // JSX
};
```

Ba khác biệt với HTML hay gặp: `class` → `className`, `for` → `htmlFor`, và sự kiện viết camelCase `onClick`, `onChange`, `onSubmit`. Component phải trả **một** phần tử gốc. Khi không muốn thêm `<div>` thừa, dùng Fragment `<>...</>`:

```tsx
return (
  <>
    <Title>...</Title>
    <Form>...</Form>
  </>
);
```

**Props** là tham số của component, truyền như attribute HTML và nhận vào dưới dạng một object:

```tsx
interface IProps {
  label?: string;
  errors?: string;
}
export const AppInput = ({ label, errors }: IProps) => (/* ... */);

<AppInput label="Email" errors="Email là bắt buộc" />
```

`children` là prop đặc biệt: những gì nằm giữa tag mở và tag đóng.

```tsx
<AppRoute>
  <AppLayout /> {/* ← đây là children của AppRoute */}
</AppRoute>
```

**Gặp ở đâu.** Mọi file `.tsx`. Bước 7 `AppRoute` nhận `children`; bước 8 `SignIn` dùng Fragment.

### 2.2. Render, re-render và state

**Nó là gì.** React gọi hàm component để **render** ra giao diện. Khi dữ liệu thay đổi, React gọi lại hàm đó (**re-render**) và chỉ cập nhật phần DOM khác đi. Câu hỏi là: dữ liệu nào thay đổi thì React biết mà gọi lại? Chỉ có hai: **props** từ cha đổi, hoặc **state** của chính component đổi.

Biến `let` bình thường trong component **không** phải state. Đổi nó React không biết, và lần render sau nó bị tạo lại từ đầu.

```tsx
// SAI: bấm nút, count tăng trong bộ nhớ nhưng màn hình không đổi
let count = 0;
return <button onClick={() => count++}>{count}</button>;
```

### 2.3. `useState`

**Nó là gì.** Hook cho component một ô nhớ **sống qua các lần render** và **báo React render lại khi đổi**.

```tsx
const [otp, setOtp] = useState(''); // '' là giá trị ban đầu
//     │     └── hàm để đổi giá trị. Gọi nó → React render lại component
//     └── giá trị hiện tại
```

Ví dụ thật từ `VerifyOtp`:

```tsx
const [otp, setOtp] = useState('');

<AppInput value={otp} onChange={(e) => setOtp(e.target.value)} />
<AppButton disabled={!otp.trim()} />
```

Người dùng gõ một chữ → `onChange` chạy → `setOtp('1')` → React render lại → `otp` giờ là `'1'` → input hiện `'1'`, nút hết disabled. Mỗi phím là một vòng như vậy.

Hai lưu ý hay vấp:

- `setOtp` **không đổi `otp` ngay lập tức** trong cùng hàm. Nó xếp lịch render lại; `otp` mới chỉ có ở lần render sau.
- Khi giá trị mới phụ thuộc giá trị cũ, truyền hàm: `setOpen((o) => !o)` an toàn hơn `setOpen(!open)`.

`useState<string | null>(null)`: chỉ định kiểu khi giá trị ban đầu không đủ để TS suy ra (`null` thì TS không biết sau này sẽ là string).

**Gặp ở đâu.** Bước 10 `otp`; bước 11 `open` của `UserMenu`; bước 13 `sentToEmail`.

### 2.4. `useEffect`

**Nó là gì.** Hook để chạy một đoạn code **sau khi render**, thường là việc "nói chuyện với thế giới bên ngoài React": gắn event listener lên `window`, gọi API, đổi `document.title`. Những việc này gọi là side-effect.

```tsx
useEffect(() => {
  // chạy SAU khi render
  return () => {
    // (tuỳ chọn) cleanup: chạy trước lần effect kế tiếp và khi component bị gỡ
  };
}, [dep1, dep2]); // dependency array
```

**Dependency array** quyết định effect chạy lại khi nào:

| Viết         | Chạy khi                                        |
| ------------ | ----------------------------------------------- |
| không truyền | sau **mỗi** render (hầu như không bao giờ muốn) |
| `[]`         | **một lần** sau render đầu                      |
| `[a, b]`     | sau render đầu, và mỗi khi `a` hoặc `b` đổi     |

Ví dụ thật từ `UserMenu`, đóng dropdown khi click ra ngoài:

```tsx
useEffect(() => {
  const onClickOutside = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
  };
  document.addEventListener('mousedown', onClickOutside);
  return () => document.removeEventListener('mousedown', onClickOutside); // cleanup
}, []); // gắn 1 lần
```

Vì sao cần cleanup? Không gỡ listener thì mỗi lần component mount lại (chuyển trang rồi quay về) là thêm một listener, chồng lên nhau, và listener cũ còn trỏ vào `setOpen` của component đã chết.

Ví dụ thứ hai, `AuthBootstrap` đồng bộ dữ liệu vào Redux khi query xong:

```tsx
useEffect(() => {
  if (isSuccess && userInfo) setUserInfo(userInfo);
}, [isSuccess, userInfo, setUserInfo]);
```

Quy tắc: **mọi biến từ bên ngoài effect mà effect dùng** phải nằm trong mảng. ESLint của base (`react-hooks/exhaustive-deps`) sẽ cảnh báo nếu bạn quên.

**Gặp ở đâu.** Bước 11 `UserMenu`, `useAuthLogoutListener` (đọc); bước 12 `AuthBootstrap`.

### 2.5. `useRef`

**Nó là gì.** Một ô nhớ giống `useState` nhưng **đổi giá trị không gây render lại**. Có hai công dụng:

1. **Trỏ vào phần tử DOM** để đo, focus, kiểm tra "click có nằm trong đây không":

```tsx
const ref = useRef<HTMLDivElement>(null);
<Wrapper ref={ref}>...</Wrapper>;
// sau render: ref.current là thẻ div thật
ref.current?.contains(e.target);
```

2. **Giữ một giá trị qua các render** mà giao diện không cần biết, ví dụ id của toast đang hiện trong `useAppToast`:

```tsx
const toastId = useRef<Id | null>(null);
toastId.current = toast(content, {...}); // đổi .current, không render lại
```

Luôn đọc/ghi qua `.current`.

**Gặp ở đâu.** Bước 6 `useAppToast` (đọc); bước 11 `UserMenu`.

### 2.6. Custom hook

**Nó là gì.** Một **hàm thường** có tên bắt đầu bằng `use`, bên trong gọi các hook khác. Mục đích: **gom logic** ra khỏi component để component chỉ còn JSX, và để tái sử dụng logic ở nhiều nơi.

Không có gì ma thuật. Đây là hook:

```ts
export const useSignInHooks = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors } } = useForm(...);
  const { mutate: login, isPending } = useLoginMutation({...});
  const onSubmit = handleSubmit((values) => login({ body: values }));
  return { t, control, errors, isPending, onSubmit }; // trả ra đúng những gì trang cần
};
```

Và component chỉ việc nhận:

```tsx
export const SignIn = () => {
  const { t, control, errors, isPending, onSubmit } = useSignInHooks();
  return <Form onSubmit={onSubmit}>...</Form>;
};
```

Codebase gom **toàn bộ logic của một trang** vào một hook đặt tên `useXxxHooks`. Bạn sẽ thấy mẫu này ở cả 5 trang auth.

**Hai quy tắc của hook** (React bắt buộc):

1. Chỉ gọi hook ở **cấp cao nhất** của component hoặc của hook khác. Không gọi trong `if`, `for`, callback.
2. Chỉ gọi hook từ component hoặc custom hook. Không gọi trong hàm thường.

Vì sao? React nhận diện từng hook bằng **thứ tự gọi**. Gọi trong `if` làm thứ tự đổi giữa các render và React lẫn lộn state của hook này với hook kia.

Hệ quả quan trọng cho bước 11: `src/api/axiosInstance.ts` là file TS thuần, không phải component, nên **không thể** gọi `useNavigate()` trong đó. Cách giải: file đó phát một `CustomEvent` lên `window`, còn hook `useAuthLogoutListener` (chạy trong component) lắng nghe và gọi `navigate`.

**Gặp ở đâu.** Bước 8–13 toàn bộ `modules/auth/hooks`; bước 11 `useSignOut`; bước 3 `useReduxUser`.

### 2.7. Controlled input

**Nó là gì.** Input mà **React nắm giá trị**: bạn truyền `value` từ state và cập nhật state trong `onChange`. Input không tự giữ gì cả.

```tsx
<input value={otp} onChange={(e) => setOtp(e.target.value)} />
```

Nếu truyền `value` mà quên `onChange`, input bị "đóng băng": gõ gì cũng không đổi vì state không đổi. Nếu `value` là `undefined` rồi sau đó thành string, React cảnh báo "uncontrolled to controlled". Đó là lý do bước 9 có `value={field.value ?? ''}` cho hai field optional.

**Gặp ở đâu.** Bước 9 `Register`, bước 10 `VerifyOtp`. Với react-hook-form, `Controller` đưa `value`/`onChange` cho bạn qua object `field`.

### 2.8. `forwardRef`

**Nó là gì.** Bình thường `ref` không phải prop, nên `<AppInput ref={...} />` sẽ **không** đi tới `<input>` bên trong. `forwardRef` cho component "chuyển tiếp" ref đó xuống một phần tử con.

```tsx
export const AppInput = forwardRef<HTMLInputElement, IProps>(
  ({ label, errors, ...rest }, ref) => (
    <Wrapper>
      <StyledInput ref={ref} {...rest} /> {/* ref đi tới đây */}
    </Wrapper>
  )
);
```

Vì sao cần? `react-hook-form` muốn **focus vào ô lỗi đầu tiên** khi bạn bấm submit. Muốn focus thì phải có ref tới `<input>` thật. `AppInput` của base đã làm sẵn; bạn chỉ cần biết vì sao nó ở đó.

`...rest` (rest props) gom mọi prop còn lại thành một object; `{...rest}` (spread) trải chúng ra thành attribute. Nhờ vậy `AppInput` nhận được `type`, `placeholder`, `inputMode`… mà không phải khai báo từng cái.

**Gặp ở đâu.** Bước 6 `AppInput` (đọc).

### 2.9. Render có điều kiện và render danh sách

```tsx
{
  user ? <UserMenu /> : <SignInLink to="/sign-in">Đăng nhập</SignInLink>;
}
{
  errors.role && <ErrorText>{errMsg(errors.role)}</ErrorText>;
}
if (!user) return <Navigate to="/sign-in" replace />; // return sớm
```

`a && <X />`: nếu `a` sai thì cả biểu thức là `a` (false/undefined) và React không vẽ gì. Cẩn thận với số `0`: `0 && <X />` vẽ ra chữ "0".

Danh sách dùng `map` và **bắt buộc có `key` duy nhất** để React biết phần tử nào là phần tử nào khi danh sách đổi:

```tsx
{
  ROLES.map((role) => (
    <RoleCard key={role.value} $active={field.value === role.value}>
      ...
    </RoleCard>
  ));
}
```

**Gặp ở đâu.** Bước 7 `AppRoute`, bước 9 `Register`, bước 11 `AppLayout`.

### 2.10. `lazy` + `Suspense` (tách code)

**Nó là gì.** Mặc định Vite gom hết trang vào một file JS lớn. `lazy(() => import('./Page'))` bảo: "chỉ tải file của trang này khi người dùng thực sự vào". `<Suspense fallback={<AppLoader />}>` hiển thị gì trong lúc đang tải.

`React.lazy` chỉ hiểu `export default`. Codebase dùng named export (`export const SignIn`), nên có helper `lazyImport` trong `src/utils` để chuyển đổi. Bạn chỉ cần gọi:

```tsx
export const { SignIn } = lazyImport(() => import('@/modules/auth'), 'SignIn');
```

**Gặp ở đâu.** Bước 7 `router/elements`, `RootLayout` (đọc).

### 2.11. Provider và Context

**Nó là gì.** Cách đưa một giá trị xuống **mọi component con** mà không phải truyền props qua từng tầng. Thư viện thường cung cấp một component `XxxProvider` bọc ở ngoài, và hook `useXxx` để lấy giá trị ở bất kỳ đâu bên trong.

```tsx
<Provider store={store}>          {/* Redux: cho useSelector/useDispatch hoạt động */}
  <ThemeProvider theme={lightTheme}>   {/* styled-components: cho theme.colors */}
    <QueryClientProvider client={queryClient}>   {/* React Query: cho useQuery/useMutation */}
      ...
```

Hệ quả thực tế: gọi hook **ngoài** provider tương ứng sẽ lỗi. `useQuery` ngoài `QueryClientProvider` → "No QueryClient set". `useNavigate` ngoài `RouterProvider` → "may be used only in the context of a Router". Khi gặp hai lỗi này, câu hỏi luôn là "component của tôi đang nằm ở đâu trong cây?".

**Gặp ở đâu.** `src/index.tsx`, `RootLayout` (đọc); bước 12 lý do `AuthBootstrap` phải nằm trong `QueryClientProvider`.

---

## 3. React Router

### 3.1. SPA và vì sao cần router

Ứng dụng React là **một trang HTML duy nhất** (Single Page App). Khi bạn "chuyển trang" sang `/profile`, trình duyệt không tải lại gì cả; React Router chỉ đổi URL trên thanh địa chỉ và đổi component đang hiển thị. Vì thế **không dùng `<a href>`** để chuyển trang nội bộ (nó tải lại toàn bộ app, mất state), mà dùng `<Link to>`.

### 3.2. Cây route và `Outlet`

Route khai báo dạng object lồng nhau. Route cha render layout, và đặt `<Outlet />` ở chỗ muốn route con xuất hiện:

```tsx
{
  element: <AuthLayout />,               // cha: khung card hồng, LanguageSwitcher
  children: [
    { path: '/sign-in', element: <SignIn /> },   // con: hiện tại vị trí <Outlet /> trong AuthLayout
    { path: '/sign-up', element: <Register /> },
  ],
}
```

Route cha **không có `path`** (pathless) chỉ để bọc layout, không thêm gì vào URL. `{ index: true }` là route con khớp đúng URL của cha (với cha pathless dưới root là `/`).

**Gặp ở đâu.** Bước 7 toàn bộ.

### 3.3. `Navigate`, `useNavigate`, `replace`

- `<Navigate to="/sign-in" replace />`: component, render ra là chuyển hướng ngay. Dùng trong guard.
- `const navigate = useNavigate(); navigate('/profile')`: chuyển hướng bằng code, dùng sau khi login xong.
- `replace: true`: **thay** entry hiện tại trong history thay vì thêm mới. Sau login mà không `replace`, bấm Back sẽ quay lại trang login rồi bị đẩy đi tiếp, gây vòng lặp khó chịu.

**Gặp ở đâu.** Bước 7 `AppRoute`, `AuthLayout`; bước 8 `useSignInHooks`.

### 3.4. Truyền dữ liệu giữa trang: `state` vs query string

Hai cách:

```ts
// 1) query string: hiện trên URL, sống qua F5, copy link được
navigate('/reset-password?token=abc');
const [searchParams] = useSearchParams();
searchParams.get('token'); // 'abc'

// 2) state: KHÔNG hiện trên URL, mất khi F5
navigate('/verify-otp', { state: { hash, email } });
const { state } = useLocation(); // { hash, email }
```

Guide dùng `state` cho `hash` đăng ký (nhạy cảm, không muốn lên URL/lịch sử) và query string cho `token` reset (bắt buộc, vì đến từ link trong email). Mục 5.2 và bước 13 của guide bàn kỹ trade-off.

**Gặp ở đâu.** Bước 9–10, bước 13.

---

## 4. Form: react-hook-form + zod

### 4.1. Vì sao cần thư viện form

Với `useState` thuần, form 7 field cần 7 state, 7 `onChange`, tự viết validate, tự theo dõi "ô nào đã chạm vào", tự focus ô lỗi. react-hook-form (RHF) làm hết. Với form 1 ô (`VerifyOtp`), `useState` gọn hơn, nên guide dùng cả hai để bạn so sánh.

### 4.2. `useForm`

```ts
const {
  control, // "điều khiển từ xa" đưa cho Controller
  handleSubmit, // bọc hàm submit của bạn: validate trước, hợp lệ mới gọi
  reset, // xoá form về defaultValues
  formState: { errors, isValid },
} = useForm<ISignInFormValues>({
  mode: 'onTouched',
  defaultValues: { email: '', password: '' },
  resolver: zodResolver(signInValidationSchema),
});
```

- `defaultValues`: giá trị đầu. Nên có đủ mọi field để input luôn controlled.
- `mode: 'onTouched'`: field chỉ bị validate **sau lần blur đầu tiên**, rồi từ đó validate mỗi lần gõ. Người dùng không bị đỏ lòe ngay khi vừa click vào ô.
- `resolver`: cắm bộ validate ngoài vào. Guide dùng zod.
- `errors`: object `{ email?: { message: 'emailRequired' }, ... }`. Field không lỗi thì không có key.

### 4.3. `Controller`

RHF muốn nối vào input **của riêng bạn** (`AppInput`). `Controller` là cầu nối:

```tsx
<Controller
  name="email"
  control={control}
  render={({ field }) => (
    <AppInput {...field} label="Email" errors={errMsg(errors.email)} />
  )}
/>
```

`field` = `{ value, onChange, onBlur, name, ref }`. Spread `{...field}` vào `AppInput` là đủ để RHF nắm được ô đó. Muốn can thiệp (ví dụ trim khi blur), viết lại prop sau spread:

```tsx
onBlur={(e) => {
  field.onBlur();                        // vẫn phải báo RHF "đã chạm"
  field.onChange(e.target.value.trim()); // rồi ghi giá trị đã trim
}}
```

### 4.4. `handleSubmit`

```tsx
const onSubmit = handleSubmit((values) => login({ body: values }));
<Form onSubmit={onSubmit} noValidate>
```

`handleSubmit(fn)` trả về một hàm mới. Gắn hàm đó vào `onSubmit` của `<form>`. Khi submit: nó tự `preventDefault`, chạy validate toàn form, focus ô lỗi đầu; **chỉ khi hợp lệ** mới gọi `fn(values)`. `noValidate` tắt validate mặc định của trình duyệt (popup "Please fill out this field") để không đá nhau với RHF.

### 4.5. zod là gì

Thư viện mô tả "dữ liệu hợp lệ trông thế nào" bằng code, rồi kiểm tra dữ liệu thật theo mô tả đó.

```ts
const emailSchema = z
  .string() // phải là string
  .min(1, 'emailRequired') // ít nhất 1 ký tự; nếu vi phạm → message này
  .regex(EMAIL_REGEX, 'emailInvalid'); // khớp regex; nếu vi phạm → message này

emailSchema.safeParse(''); // { success: false, error: { issues: [{ message: 'emailRequired' }] } }
emailSchema.safeParse('a@b.com'); // { success: true, data: 'a@b.com' }
```

Mấu chốt trong codebase: **message không phải câu tiếng Việt, mà là key i18n**. zod trả `'emailRequired'`, UI gọi `t('emailRequired')` để ra "Email là bắt buộc" hoặc "Email is required" tuỳ ngôn ngữ. Vì vậy có helper nhỏ trong mỗi trang:

```ts
const errMsg = (e?: FieldError) => (e?.message ? t(e.message) : undefined);
```

Rule liên quan hai field (mật khẩu và xác nhận) đặt ở cấp object bằng `.refine`, và `path` chỉ ra lỗi thuộc field nào:

```ts
z.object({...}).refine((v) => v.password === v.confirmPassword, {
  error: 'passwordMismatch',
  path: ['confirmPassword'],
});
```

**Gặp ở đâu.** Bước 5 toàn bộ; bước 8–9, 13 dùng.

---

## 5. Gọi API: Promise, axios, React Query

### 5.1. Promise và `async/await`

Gọi API mất thời gian. JS không đứng chờ; nó trả về một **Promise** ("lời hứa sẽ có kết quả sau"). Hai cách đợi:

```ts
// 1) .then / .catch
authApi
  .signIn(body)
  .then((res) => console.log(res))
  .catch((err) => console.error(err));

// 2) async/await (dễ đọc hơn, cùng ý nghĩa)
try {
  const res = await authApi.signIn(body);
} catch (err) {
  // lỗi mạng hoặc HTTP 4xx/5xx rơi vào đây
} finally {
  // luôn chạy, dù thành công hay lỗi
}
```

`finally` là lý do `useSignOut` dọn Redux **dù API logout thất bại**: mất mạng thì phía FE vẫn phải đăng xuất.

**Gặp ở đâu.** Bước 2 (interceptor dùng `async`), bước 11 `useSignOut`.

### 5.2. axios và interceptor

axios là thư viện gọi HTTP. `axios.create({...})` tạo một **instance** có cấu hình riêng (`baseURL`, `withCredentials`, `timeout`); codebase gọi nó `apiClient`.

**Interceptor** là hàm "chặn" mọi request trước khi gửi, hoặc mọi response trước khi về nơi gọi. Base có hai:

```ts
// request: thêm header vào MỌI request
apiClient.interceptors.request.use((req) => {
  req.headers.set('Accept-Language', i18n.language);
  return req;
});

// response: thành công thì bóc res.data; lỗi 401 thì thử refresh rồi gọi lại
apiClient.interceptors.response.use(
  (res) => res.data,
  async (error) => {
    /* ... */
  }
);
```

`(res) => res.data` gọi là **unwrap**: axios trả `{ status, headers, data }`, base bóc lấy `data` luôn, nên ở nơi gọi `res` chính là `{ code, success, message, data }` của backend. Đây là lý do `axiosService` phải ép kiểu kết quả về `IAppResponse<T>`.

**Gặp ở đâu.** Bước 2. Mục 5.1 của guide giải thích hàng đợi refresh.

### 5.3. Vì sao cần React Query

Gọi API bằng `useEffect` + `useState` thì bạn phải tự quản `loading`, `error`, `data`, huỷ request khi component gỡ, cache, gọi lại… React Query (TanStack Query) làm việc đó và chia hai loại:

| Loại         | Dùng cho                        | Hook          | Bạn dùng gì                          |
| ------------ | ------------------------------- | ------------- | ------------------------------------ |
| **Query**    | GET, đọc dữ liệu, có cache      | `useQuery`    | `data`, `isFetching`, `isError`      |
| **Mutation** | POST/PUT/DELETE, thay đổi gì đó | `useMutation` | `mutate()`, `isPending`, `onSuccess` |

```ts
const { mutate: login, isPending } = useMutation({
  mutationFn: (v) => authApi.signIn(v.body), // gọi API thế nào
  onSuccess: (res) => {
    /* làm gì khi 2xx */
  },
  onError: (err) => {
    /* làm gì khi lỗi */
  },
});

login({ body: values }); // kích hoạt; isPending = true tới khi xong
```

`isPending` nối thẳng vào `loading` của `AppButton` để hiện spinner và chặn bấm hai lần.

`queryKey` (chỉ có ở query) là "tên" của cache: `['QK_GET_USER_PROFILE']`. `queryClient.invalidateQueries({ queryKey })` đánh dấu cache đó cũ để fetch lại; `queryClient.clear()` xoá toàn bộ cache (dùng khi đổi user).

`enabled: false` bảo query **đừng tự chạy**. `AuthBootstrap` dùng `enabled: !!user` để khách không bị gọi `GET /api/users`.

**Gặp ở đâu.** Bước 4 định nghĩa hook; bước 8–13 dùng.

### 5.4. Redux vs React Query: cái nào giữ gì?

Cả hai đều "giữ dữ liệu", dễ lẫn. Quy tắc của codebase:

- **React Query** giữ **server state**: dữ liệu mà nguồn sự thật nằm ở backend (danh sách truyện, profile). Nó biết dữ liệu cũ hay mới, tự fetch lại.
- **Redux** giữ **client state**: thứ FE cần nhớ để hoạt động, ở đây là "ai đang đăng nhập" (persist qua F5 để guard chạy được ngay khi mở app).

`user` xuất hiện ở cả hai (query profile và Redux) là có chủ đích: query để lấy mới, Redux để guard đọc đồng bộ và persist. `AuthBootstrap` là cầu nối chép từ query sang Redux.

---

## 6. Redux Toolkit + redux-persist

### 6.1. Bốn từ khoá

- **Store**: một object JS chứa toàn bộ client state, duy nhất trong app.
- **Slice**: một "lát" của store cho một chủ đề (`user`). Redux Toolkit sinh reducer + actions từ một `createSlice`.
- **Action**: một object mô tả "điều gì đã xảy ra" (`{ type: 'user/setUserInfoToRedux', payload: {...} }`). Bạn không tự viết nó; hàm `setUserInfoToRedux(user)` tạo ra nó.
- **Dispatch**: gửi action vào store. Store chạy reducer để tính state mới, rồi mọi component đang `useSelector` phần đó render lại.

```ts
const userSlice = createSlice({
  name: 'user',
  initialState: { user: undefined },
  reducers: {
    setUserInfoToRedux: (state, action) => {
      state.user = action.payload; // trông như mutate, nhưng Immer bên dưới tạo object mới
    },
    resetUserInfoFromRedux: (state) => {
      state.user = undefined;
    },
  },
});
```

Base bọc tất cả vào một hook để component không phải biết `dispatch`/`useSelector`:

```ts
const { user, setUserInfo, resetUserInfo } = useReduxUser();
```

### 6.2. redux-persist và `PersistGate`

Redux nằm trong bộ nhớ, F5 là mất. redux-persist tự ghi slice `user` vào `localStorage` (key `persist:user`) mỗi khi đổi, và **rehydrate** (đọc ngược lại) khi app mở. Việc đọc là bất đồng bộ, nên `<PersistGate loading={<AppLoader />}>` giữ màn loader cho tới khi đọc xong. Không có nó, `AppRoute` thấy `user` rỗng trong tích tắc đầu và đá bạn về `/sign-in` oan. Mục 5.5 của guide nói kỹ.

**Gặp ở đâu.** Bước 3 (đọc), bước 7–12 dùng `useReduxUser`.

---

## 7. Khái niệm về xác thực

### 7.1. Cookie, HttpOnly, SameSite

Cookie là mẩu dữ liệu server gửi về qua header `Set-Cookie`; trình duyệt lưu và **tự động gửi kèm** ở mọi request tới đúng domain đó sau này. Backend Pink Story đặt token đăng nhập vào cookie.

- `HttpOnly`: JS **không đọc được** cookie này (`document.cookie` không thấy). Chống trộm token bằng script độc. Hệ quả: FE không thể "nhìn cookie để biết đã login", nên mới cần Redux giữ `user` làm cờ.
- `SameSite=Strict`: chỉ gửi cookie khi request xuất phát từ cùng site. `localhost:4001` và `localhost:3000` được coi là cùng site (khác port vẫn cùng site), nhưng `127.0.0.1` thì không. Đó là lỗi "cookie có mà vẫn 401" trong mục 7 của guide.
- `Path=/api/auth/refresh`: cookie chỉ được gửi khi URL bắt đầu bằng path đó.

### 7.2. CORS và `withCredentials`

Trình duyệt mặc định **cấm** trang ở origin A (`localhost:4001`) gọi API ở origin B (`localhost:3000`). Backend phải nói rõ "tôi cho phép origin A" qua header `Access-Control-Allow-Origin`. Khi có cookie đi kèm, thêm hai điều kiện: backend trả `credentials: true` và **không được dùng `*`**, còn FE phải đặt `withCredentials: true` trong axios. Thiếu một trong hai là cookie không đi.

### 7.3. Access token, refresh token, 401

- **Access token**: chứng minh "tôi là ai" cho từng request, sống ngắn (phút).
- **Refresh token**: dùng để xin access token mới khi cái cũ hết hạn, sống dài (ngày). Chỉ gửi tới đúng endpoint refresh nhờ `Path`.
- **HTTP 401**: server bảo "không xác thực được". Interceptor bắt mã này, gọi refresh, rồi gọi lại request cũ. Refresh cũng 401 nghĩa là phiên đã hết thật, lúc đó đăng xuất.

Lưu ý: 401 khi **login sai mật khẩu** không phải "hết hạn", nên interceptor loại trừ mọi URL bắt đầu `/api/auth/` khỏi luồng refresh.

### 7.4. OTP và `hash`

OTP là mã ngắn gửi qua email. Cách thường gặp là server lưu "đơn đăng ký chờ" vào DB. Pink Story không lưu: nó mã hoá toàn bộ đơn + OTP + hạn thành một chuỗi `hash`, trả cho FE giữ, rồi FE gửi lại kèm OTP người dùng nhập. Server giải mã và so. Đây là **stateless OTP**; mục 5.2 của guide giải thích hệ quả cho FE.

**Gặp ở đâu.** Mục 2.7, 3, 5 của guide; bước 2, 9–12.

---

## 8. styled-components

**Nó là gì.** Viết CSS ngay trong file component, mỗi khối CSS sinh ra một component:

```tsx
const Title = styled.h1`
  font-size: 26px;
  color: ${Colors.pink_70}; /* nhúng biến JS */
`;

<Title>Chào mừng</Title>; // render ra <h1 class="sc-abc123">Chào mừng</h1>
```

Dấu `` ` `` là template literal của JS; `styled.h1`` ` ``gọi là tagged template. Bạn không cần hiểu cơ chế, chỉ cần nhớ CSS nằm giữa hai dấu backtick và`${}` để nhúng giá trị.

**Style theo prop:**

```tsx
const RoleCard = styled.label<{ $active: boolean }>`
  border-color: ${({ $active }) => ($active ? Colors.pink_60 : Colors.pink_30)};
`;
<RoleCard $active={field.value === 'reader'}>...</RoleCard>;
```

Prop bắt đầu bằng `$` là **transient prop**: styled-components dùng nó để tính CSS rồi **không** đẩy xuống DOM. Không có `$`, React cảnh báo "unknown attribute `active` on <label>".

**`as` để đổi tag:** `<ForgotLink as={Link} to="/forgot-password">` render `ForgotLink` (vốn là `styled.a`) thành component `Link` của router nhưng giữ CSS.

**Gặp ở đâu.** Bước 6 (đọc `AppInput`), bước 8 `StyledSignIn.ts`, bước 11.

---

## 9. i18next

**Nó là gì.** Thư viện đa ngôn ngữ. Text không viết cứng trong JSX mà là **key**; file JSON theo từng ngôn ngữ ánh xạ key → câu.

```tsx
const { t } = useTranslation();
t('welcomeBack'); // "Chào mừng trở lại" hoặc "Welcome back"
t('verifyOtpSubtitle', { email }); // JSON: "Nhập mã chúng tôi đã gửi tới {{email}}"
```

Base gộp mọi file JSON (`common.json`, `auth.json`, `validation.json`) vào một object bằng spread trong `src/translations/{en,vi}/index.ts`. Thêm file mới = thêm một dòng import và một dòng spread.

Hai nguồn text trong app, và ai dịch:

- Text giao diện, message lỗi validate: **FE** dịch qua `t(key)`.
- Message nghiệp vụ từ server ("Email đã tồn tại"): **backend** dịch theo header `Accept-Language` mà interceptor gửi. FE hiện thẳng.

**Gặp ở đâu.** Bước 5 (key validate), bước 8 (`auth.json`), mục 5.7 của guide.

---

## 10. Công cụ: Vite, alias, barrel, test

### 10.1. `import`/`export`

```ts
export const SignIn = () => {...};      // named export: import { SignIn } from './SignIn'
export default userSlice.reducer;       // default export: import anything from './slice'
export * from './SignIn';               // re-export tất cả named export của file kia
```

Codebase gần như chỉ dùng **named export**, trừ reducer của slice.

### 10.2. Barrel file `index.ts`

File `index.ts` trong thư mục chỉ chứa các dòng `export * from './xxx'`. Nhờ đó bên ngoài viết `import { SignIn, Register } from '@/modules/auth'` thay vì trỏ vào từng file. Guide gọi việc thêm dòng vào đây là "nối vào barrel". Quên nối là nguyên nhân số một của lỗi "không tìm thấy export".

### 10.3. Alias `@/`

`@/` = `src/`. Cấu hình ở `vite.config.ts` (`resolve.alias`) và `tsconfig.app.json` (`paths`). Nhờ nó không phải viết `../../../constants`. Lưu ý alias chỉ hoạt động trong code được Vite build; trong Console trình duyệt phải dùng đường dẫn thật `/src/api/index.ts` (guide đã viết đúng cách này ở các checkpoint).

### 10.4. Vite và `.env`

Vite là dev server + bundler. Biến môi trường phải bắt đầu `VITE_` mới lộ ra code qua `import.meta.env`. Base validate chúng bằng zod ngay lúc khởi động (`src/constants/env.ts`): sai là app throw ngay với thông báo rõ, thay vì lỗi mập mờ sau. Sửa `.env` xong phải **restart `yarn dev`**.

### 10.5. Các lệnh bạn sẽ chạy

| Lệnh             | Làm gì                                                     |
| ---------------- | ---------------------------------------------------------- |
| `nvm use`        | Chuyển Node về bản trong `.nvmrc` (22). Chạy trước mọi thứ |
| `yarn dev`       | Chạy dev server ở port trong `.env`                        |
| `yarn typecheck` | Kiểm tra kiểu TS toàn dự án, không tạo file                |
| `yarn lint`      | ESLint                                                     |
| `yarn test:run`  | Chạy toàn bộ test một lần                                  |
| `yarn test`      | Chạy test ở chế độ theo dõi file                           |

Khi commit, husky tự chạy lint + prettier trên file đã stage và `yarn typecheck`. Commit message phải theo Conventional Commits (`feat: ...`, `fix: ...`), nếu không commitlint từ chối.

### 10.6. Test với Vitest (đọc được là đủ)

```ts
describe('useAppToast', () => {
  // nhóm test
  it('ignores 401 errors silently', () => {
    // một test
    const { result } = renderHook(() => useAppToast());
    act(() => {
      result.current.showServerErrorMsg({ response: { status: 401 } });
    });
    expect(toastMock).not.toHaveBeenCalled(); // khẳng định
  });
});
```

`vi.mock('module', () => ({...}))` thay một module thật bằng bản giả để test không gọi mạng. `renderHook` chạy một hook ngoài component. `act` bọc các thao tác làm React cập nhật. Guide chỉ yêu cầu bạn **sửa** test có sẵn (bước 2, 6); viết mới là bài tập.

---

## 11. Bước nào cần đọc mục nào

| Bước trong guide            | Đọc trước                           |
| --------------------------- | ----------------------------------- |
| 1. Enum, ROUTES, interfaces | 1.1 – 1.5                           |
| 2. HTTP layer               | 1.5, 1.7, 5.1, 5.2, 7.1 – 7.3, 10.2 |
| 3. Redux (đọc)              | 6.1, 6.2, 2.6                       |
| 4. React Query hooks        | 5.3, 5.4, 1.5                       |
| 5. Validation zod           | 4.5, 1.3, 9                         |
| 6. UI primitives + toast    | 2.8, 2.5, 8                         |
| 7. Router, guard, layout    | 3.1 – 3.3, 2.9, 2.10, 2.11, 1.4     |
| 8. SignIn                   | 2.6, 4.1 – 4.4, 2.7, 9, 10.2        |
| 9. Register                 | 2.9, 4.3, 2.7                       |
| 10. VerifyOtp               | 2.3, 3.4, 7.4                       |
| 11. Sign out                | 2.4, 2.5, 5.1, 2.6 (quy tắc hook)   |
| 12. AuthBootstrap           | 2.4, 5.3, 5.4, 2.11                 |
| 13. Forgot / Reset          | 3.4, 2.3                            |
| 14. Kiểm thử thủ công       | 7.1 – 7.3, 10.5                     |

Nếu đọc xong một mục mà vẫn mơ hồ, đừng đọc tiếp lý thuyết. Làm bước tương ứng trong guide, để nó lỗi, rồi quay lại đọc mục đó lần hai. Lần hai gần như luôn hiểu.
