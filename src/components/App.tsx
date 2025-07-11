@@ .. @@
 import VerificationDashboard from './components/VerificationDashboard';
 import OperationalFlow from './components/OperationalFlow';
+import LogisticsOperationalFlow from './components/LogisticsOperationalFlow';
+import OperatorOperationalFlow from './components/OperatorOperationalFlow';
+import CustomerOperationalFlow from './components/CustomerOperationalFlow';

 function App() {
@@ .. @@
       case 'verification':
         return <VerificationDashboard />;
       case 'operational-flow':
-        return <OperationalFlow />;
+        switch (userRole) {
+          case 'logistics':
+            return <LogisticsOperationalFlow />;
+          case 'operator':
+            return <OperatorOperationalFlow />;
+          case 'customer':
+            return <CustomerOperationalFlow />;
+          default:
+            return <OperationalFlow />;
+        }
       default:
         return <Dashboard userRole={userRole!} />;
     }