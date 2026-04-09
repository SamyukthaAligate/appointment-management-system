const fs = require('fs');

let content = fs.readFileSync('src/App.js', 'utf8');

// Fix imports ordering
content = content.replace(
`const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastContext";`,

`import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { ToastProvider } from "./components/ToastContext";

const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const Dashboard = lazy(() => import("./pages/Dashboard"));`
);

// Add /login route explicitly 
content = content.replace(
`<Route path="/" element={<Login />} />`,
`<Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />`
);

// Add wildcard 404 fallback to login so bad URLs dont blank screen
content = content.replace(
`</Routes>`,
`  <Route path="*" element={<Login />} />
            </Routes>`
);

fs.writeFileSync('src/App.js', content);
console.log("App.js Patched successfully!");
