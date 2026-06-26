# Export: Filter Definitions + Category Filters

این پوشه کدهای مربوط به دو بخش زیر را برای انتقال به پروژه دیگر نگه می‌دارد:

- `filterDefinitions`: تعریف فیلترهای عمومی مثل برند، رنگ، بازه قیمت و ...
- `categoryFilters`: اتصال فیلترهای تعریف‌شده به دسته‌بندی‌ها

## Frontend files

فایل‌های داشبورد در مسیر زیر کپی شده‌اند:

```text
dashboard/src/pages/filterDefinitions/
dashboard/src/pages/categoryFilters/
dashboard/src/services/category/filterDefinitionApi.js
dashboard/src/services/category/categoryFilterApi.js
```

وابستگی‌های مستقیم UI و API هم در همین ساختار آمده‌اند، مثل:

```text
dashboard/src/components/shared/
dashboard/src/components/ui/Popup.jsx
dashboard/src/components/icons/Pencil.jsx
dashboard/src/pages/categories/components/renderTreeOptions.jsx
dashboard/src/services/bazisara.js
dashboard/src/services/category/categoryApi.js
```

### Routes to add in dashboard

در `dashboard/src/App.jsx` این importها لازم هستند:

```jsx
import CategoryFilters from "./pages/categoryFilters/index";
import CategoryFilterForm from "./pages/categoryFilters/CategoryFilterForm";
import FilterDefinitions from "./pages/filterDefinitions";
```

و این routeها:

```jsx
<Route path="/filter-definitions" element={<FilterDefinitions />} />
<Route path="/category-filters" element={<CategoryFilters />} />
<Route path="/category-filters/add" element={<CategoryFilterForm />} />
<Route path="/category-filters/edit/:id" element={<CategoryFilterForm mode="edit" />} />
```

در سایدبار فعلی هم این لینک‌ها استفاده شده‌اند:

```jsx
{ title: "تعریف فیلترها", path: "/filter-definitions" }
{ title: "فیلترهای دسته‌بندی", path: "/category-filters" }
```

## Backend files

فایل‌های بک‌اند در مسیر زیر کپی شده‌اند:

```text
server/models/filterDefinition.model.js
server/models/categoryFilter.model.js
server/controllers/filterDefinition.controller.js
server/controllers/categoryFilter.controller.js
server/services/filterDefinition.service.js
server/services/categoryFilter.service.js
server/routes/filterDefinition.route.js
server/routes/categoryFilter.route.js
server/scripts/seedFilterDefinitions.js
server/scripts/seedCategoryFilters.js
```

وابستگی‌های مستقیم بک‌اند هم آمده‌اند:

```text
server/models/baseSchema.model.js
server/utils/pagination.util.js
```

### Routes to add in server

در `server/app.js` این دو خط لازم هستند:

```js
app.use("/api/filter-definitions", require("./routes/filterDefinition.route"));
app.use("/api/category-filters", require("./routes/categoryFilter.route"));
```

## Important dependencies

این کدها هنوز به این بخش‌های پروژه مقصد وابسته‌اند:

- مدل `Category` در بک‌اند، چون فیلتر دسته‌بندی به دسته‌بندی وصل می‌شود.
- middlewareهای ادمین در routeهای بک‌اند:
  `verifyAdmin.middleware`, `authorize.middleware`, `adminProfileLevel.middleware`
- تنظیم Redux Toolkit Query در `bazisaraApi`
- route/API مربوط به درخت دسته‌بندی: `useGetCategoryTreeQuery`

اگر پروژه مقصد این بخش‌ها را با اسم یا ساختار دیگری دارد، فقط importها و routeها را مطابق آن پروژه تغییر بده.
