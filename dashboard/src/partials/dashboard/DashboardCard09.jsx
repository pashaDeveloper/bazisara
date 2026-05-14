import React from 'react';
import Tooltip from '../../components/Tooltip';
import BarChart from '../../charts/BarChart02';

// وارد کردن ابزارهای کمکی
import { tailwindConfig } from '../../utils/Utils';

function DashboardCard09() {

  const chartData = {
    labels: [
      '12-01-2022', '01-01-2023', '02-01-2023',
      '03-01-2023', '04-01-2023', '05-01-2023',
    ],
    datasets: [
      // میله‌های آبی روشن
      {
        label: 'دسته 1',
        data: [
          6200, 9200, 6600, 8800, 5200, 9200,
        ],
        backgroundColor: tailwindConfig().theme.colors.violet[500],
        hoverBackgroundColor: tailwindConfig().theme.colors.violet[600],
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
      // میله‌های آبی
      {
        label: 'دسته 2',
        data: [
          -4000, -2600, -5350, -4000, -7500, -2000,
        ],
        backgroundColor: tailwindConfig().theme.colors.violet[200],
        hoverBackgroundColor: tailwindConfig().theme.colors.violet[300],
        barPercentage: 0.7,
        categoryPercentage: 0.7,
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="flex flex-col col-span-full sm:col-span-6 bg-white dark:bg-gray-800 shadow-sm rounded-xl">
      <header className="px-5 py-4 border-b border-gray-100 dark:border-gray-700/60 flex items-center">
        <h2 className=" text-gray-800 dark:text-gray-100">فروش در مقابل بازپرداخت</h2>
       
      </header>
      <div className="px-5 py-3">
        <div className="flex items-start">
          <div className="text-3xl  text-gray-800 dark:text-gray-100 mr-2">
            +6,796 ریال
            </div>
          <div className="text-sm font-medium text-red-700 px-1.5 bg-red-500/20 rounded-full">-34%</div>
        </div>
      </div>
      {/* نمودار ساخته شده با Chart.js 3 */}
      <div className="grow">
        {/* تغییر ویژگی ارتفاع برای تنظیم ارتفاع نمودار */}
        <BarChart data={chartData} width={595} height={248} />
      </div>
    </div>
  );
}

export default DashboardCard09;
