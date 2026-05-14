import React, { useState, useEffect } from 'react';
import { useGetPaymentStatisticsQuery, useGetPaymentDetailsQuery, useGetSalesCountByProductQuery } from '@/services/payment/paymentApi';
import { PaymentBarChart } from '../../charts/PaymentBarChart';
import { toast } from 'react-hot-toast';
import Modal from '../../components/shared/modal/Modal';
import StatusPay from '../../components/shared/tools/StatusPay';
import SkeletonItem from '../../components/shared/skeleton/SkeletonItem';

// Import utilities
import { tailwindConfig } from '../../utils/Utils';

// Status Statistics Cards Component
const StatusStatisticsCards = ({ statusStats }) => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 ">
    <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-4 border border-green-200 dark:border-green-800">
      <div className="text-green-800 dark:text-green-200 text-md mb-1 ">پرداخت‌های موفق</div>
      <div className="text-base font-bold text-green-900 dark:text-green-100 ">
        {statusStats?.paid || 0} <span className="text-md ">عدد</span>
      </div>
    </div>
    
    <div className="bg-yellow-50 dark:bg-yellow-900/30 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
      <div className="text-yellow-800 dark:text-yellow-200 text-md mb-1 ">پرداخت‌های در انتظار</div>
      <div className="text-base font-bold text-yellow-900 dark:text-yellow-100 ">
        {statusStats?.pending || 0} <span className="text-md ">عدد</span>
      </div>
    </div>
    
    <div className="bg-red-50 dark:bg-red-900/30 rounded-lg p-4 border border-red-200 dark:border-red-800">
      <div className="text-red-800 dark:text-red-200 text-md mb-1 ">پرداخت‌های ناموفق</div>
      <div className="text-base font-bold text-red-900 dark:text-red-100 ">
        {statusStats?.failed || 0} <span className="text-md ">عدد</span>
      </div>
    </div>
    
    <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
      <div className="text-gray-800 dark:text-gray-200 text-md mb-1 ">پرداخت‌های منقضی‌شده</div>
      <div className="text-base font-bold text-gray-900 dark:text-gray-100 ">
        {statusStats?.expired || 0} <span className="text-md ">عدد</span>
      </div>
    </div>
  </div>
);

// Highest and Lowest Payment Cards Component
const PaymentAmountCards = ({ highestPayment, lowestPayment, onPaymentClick, formatCurrency }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 ">
    <div 
      className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-4 border border-blue-200 dark:border-blue-800 cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors"
      onClick={() => onPaymentClick(highestPayment?._id)}
    >
      <div className="text-blue-800 dark:text-blue-200 text-md mb-1 ">بیشترین مبلغ پرداخت موفق (تومان)</div>
      <div className="text-base font-bold text-blue-900 dark:text-blue-100 mb-1 ">
        {formatCurrency(highestPayment?.totalAmount || 0)}
      </div>
      {highestPayment?.customer && (
        <div className="text-blue-700 dark:text-blue-300 text-md ">
          {highestPayment?.customer?.name || highestPayment?.customer?.phone || "بدون نام"}
        </div>
      )}
    </div>
    
    <div 
      className="bg-purple-50 dark:bg-purple-900/30 rounded-lg p-4 border border-purple-200 dark:border-purple-800 cursor-pointer hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
      onClick={() => onPaymentClick(lowestPayment?._id)}
    >
      <div className="text-purple-800 dark:text-purple-200 text-md mb-1 ">کمترین مبلغ پرداخت موفق (تومان)</div>
      <div className="text-base font-bold text-purple-900 dark:text-purple-100 mb-1 ">
        {formatCurrency(lowestPayment?.totalAmount || 0)}
      </div>
      {lowestPayment?.customer && (
        <div className="text-purple-700 dark:text-purple-300 text-md ">
          {lowestPayment?.customer?.name || lowestPayment?.customer?.phone || "بدون نام"}
        </div>
      )}
    </div>
  </div>
);

// Status Statistics Chart Component
const StatusStatisticsChart = ({ statusChartData }) => (
  <div className="">
    <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-4 ">آمار پرداخت‌ها بر اساس وضعیت</h3>
    <div>
      <PaymentBarChart data={statusChartData} width={400} height={256} valueType="count" />
    </div>
  </div>
);

// Payment Details Modal Component
const PaymentDetailsModal = ({ 
  isOpen, 
  onClose, 
  paymentDetails, 
  isLoading, 
  error, 
  formatCurrency,
  paymentStatusMap
}) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    className="w-full max-w-2xl p-6 bg-white dark:bg-gray-900 rounded-xl shadow-lg"
  >
    {isLoading ? (
      <div className="py-8">
        <SkeletonItem repeat={5} />
      </div>
    ) : error ? (
      <div className="text-center py-8">
        <div className="inline-block h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
          <svg className="h-12 w-12 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-500 dark:text-red-400">خطا در دریافت جزئیات: {error?.data?.description || "خطای نامشخص"}</p>
        <div className="mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:text-gray-100 rounded-md"
          >
            بستن
          </button>
        </div>
      </div>
    ) : paymentDetails?.data && (
      <div className="text-right space-y-6">
        <h2 className="text-2xl font-bold text-teal-600 dark:text-teal-300">
          جزئیات پرداخت
        </h2>
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-200 px-3 py-1 rounded-lg text-sm">
              شناسه: {paymentDetails.data._id}
            </span>
            <span className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-3 py-1 rounded-lg text-sm">
              تاریخ: {new Date(paymentDetails.data.createdAt).toLocaleDateString("fa-IR")}
            </span>
            <span className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-3 py-1 rounded-lg text-sm">
              زمان: {new Date(paymentDetails.data.createdAt).toLocaleTimeString("fa-IR")}
            </span>
          </div>
          
          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-2">
              وضعیت پرداخت
            </h3>
            <span className="bg-purple-50 text-purple-700 dark:bg-purple-900 dark:text-purple-200 px-3 py-1 rounded-lg text-sm flex items-center gap-2 w-fit">
              <StatusPay paymentStatus={paymentDetails.data.paymentStatus || "pending"} />
              {paymentStatusMap[paymentDetails.data.paymentStatus] || "در انتظار پرداخت"}
            </span>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-2">
              اطلاعات کاربر
            </h3>
            <div className="flex flex-col gap-2">
              <div className="bg-indigo-50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 px-3 py-2 rounded-lg">
                <div className="font-medium">
                  {paymentDetails.data.customer?.name || `شناسه کاربر: ${paymentDetails.data.customer?._id || "نامشخص"}`}
                </div>
                {paymentDetails.data.customer?.phone && (
                  <div className="text-sm mt-1">تلفن: {paymentDetails.data.customer.phone}</div>
                )}
                {paymentDetails.data.customer?.email && (
                  <div className="text-sm">ایمیل: {paymentDetails.data.customer.email}</div>
                )}
              </div>
            </div>
          </div>

          {paymentDetails.data.address && (
            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-2">
                آدرس
              </h3>
              <div className="bg-gray-50 text-gray-700 dark:bg-gray-800 dark:text-gray-200 px-3 py-2 rounded-lg">
                <div>{paymentDetails.data.address.address}</div>
                <div className="text-sm mt-1">
                  {paymentDetails.data.address.city}, {paymentDetails.data.address.province}
                </div>
                {paymentDetails.data.address.postalCode && (
                  <div className="text-sm">کد پستی: {paymentDetails.data.address.postalCode}</div>
                )}
                {paymentDetails.data.address.plateNumber && (
                  <div className="text-sm">پلاک: {paymentDetails.data.address.plateNumber}</div>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-2">
                مبلغ کل
              </h3>
              <span className="bg-green-50 text-green-700 dark:bg-green-900 dark:text-green-200 px-3 py-2 rounded-lg text-sm block">
                {formatCurrency(paymentDetails.data.totalAmountWithoutDiscount || paymentDetails.data.totalAmount)} تومان
              </span>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-2">
                مبلغ با تخفیف
              </h3>
              <span className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-3 py-2 rounded-lg text-sm block">
                {formatCurrency(paymentDetails.data.totalAmountWithDiscount)} تومان
              </span>
            </div>
            
            <div>
              <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-2">
                میزان تخفیف
              </h3>
              <span className="bg-yellow-50 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-200 px-3 py-2 rounded-lg text-sm block">
                {formatCurrency((paymentDetails.data.totalAmountWithoutDiscount || paymentDetails.data.totalAmount) - paymentDetails.data.totalAmountWithDiscount)} تومان
              </span>
            </div>
          </div>

          <div>
            <h3 className="text-base font-medium text-gray-800 dark:text-gray-100 mb-2">
              محصولات
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {paymentDetails.data.products && paymentDetails.data.products.length > 0 ? (
                paymentDetails.data.products.map((item, index) => (
                  <div 
                    key={index} 
                    className="flex flex-wrap gap-3 items-center bg-gray-50 dark:bg-gray-800 rounded-lg px-3 py-2"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-800 dark:text-gray-100">
                        {item.product?.title || "بدون عنوان"}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {item.variation?.unit?.value || ""} {item.variation?.unit?.translations?.translation?.fields?.title || ""}
                      </div>
                    </div>
                    <div className="bg-blue-50 text-blue-700 dark:bg-blue-900 dark:text-blue-200 px-2 py-1 rounded text-sm">
                      تعداد: {item.quantity}
                    </div>
                    <div className="bg-teal-50 text-teal-700 dark:bg-teal-900 dark:text-teal-200 px-2 py-1 rounded text-sm">
                      قیمت: {formatCurrency(item.variation?.price * item.quantity)} تومان
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-gray-500 dark:text-gray-400 text-center py-4">
                  بدون محصول
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 dark:text-gray-100 rounded-md"
          >
            بستن
          </button>
        </div>
      </div>
    )}
  </Modal>
);

// Loading and Error Components
const LoadingComponent = () => (
  <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
    <div className="text-center py-8">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mb-4"></div>
      <p className="text-gray-600 dark:text-gray-400">در حال بارگذاری آمار...</p>
    </div>
  </div>
);

const ErrorComponent = ({ error }) => (
  <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
    <div className="text-center py-8">
      <div className="inline-block h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30 mb-4">
        <svg className="h-12 w-12 text-red-500 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-red-500 dark:text-red-400">خطا در دریافت آمار: {error?.data?.description || "خطای نامشخص"}</p>
    </div>
  </div>
);

function PaymentStatistics() {
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const { data: statsData, isLoading, error } = useGetPaymentStatisticsQuery();
  const { data: salesCountData, isLoading: isSalesLoading, error: salesError } = useGetSalesCountByProductQuery();
  
  // Fetch detailed payment data when a payment is selected
  const { data: paymentDetails, isLoading: isPaymentLoading, error: paymentError } = useGetPaymentDetailsQuery(
    selectedPaymentId,
    { skip: !selectedPaymentId }
  );

  // Handle loading and error states for statistics
  useEffect(() => {
    if (isLoading) {
      toast.loading("در حال دریافت آمار...", { id: "get-stats" });
    }
    if (statsData && statsData.acknowledgement) {
      toast.dismiss("get-stats");
    }
    if (error) {
      toast.error(error?.data?.description || "خطا در دریافت آمار", { id: "get-stats" });
    }
  }, [isLoading, statsData, error]);

  // Handle loading and error states for sales count data
  useEffect(() => {
    if (isSalesLoading) {
      toast.loading("در حال دریافت آمار فروش...", { id: "get-sales" });
    }
    if (salesCountData && salesCountData.acknowledgement) {
      toast.dismiss("get-sales");
    }
    if (salesError) {
      toast.error(salesError?.data?.description || "خطا در دریافت آمار فروش", { id: "get-sales" });
    }
  }, [isSalesLoading, salesCountData, salesError]);

  // Handle loading and error states for payment details
  useEffect(() => {
    if (isPaymentLoading) {
      toast.loading("در حال دریافت جزئیات پرداخت...", { id: "get-payment-details" });
    }
    if (paymentDetails && paymentDetails.acknowledgement) {
      toast.dismiss("get-payment-details");
    }
    if (paymentError) {
      toast.error(paymentError?.data?.description || "خطا در دریافت جزئیات پرداخت", { id: "get-payment-details" });
    }
  }, [isPaymentLoading, paymentDetails, paymentError]);

  // Prepare data for status statistics chart
  const statusChartData = {
    labels: ['موفق', 'در انتظار', 'ناموفق', 'منقضی'],
    datasets: [
      {
        label: 'تعداد پرداخت‌ها',
        data: [
          statsData?.data?.statusStats?.paid || 0,
          statsData?.data?.statusStats?.pending || 0,
          statsData?.data?.statusStats?.failed || 0,
          statsData?.data?.statusStats?.expired || 0
        ],
        backgroundColor: [
          tailwindConfig().theme.colors.green[500],
          tailwindConfig().theme.colors.yellow[500],
          tailwindConfig().theme.colors.red[500],
          tailwindConfig().theme.colors.gray[500]
        ],
        hoverBackgroundColor: [
          tailwindConfig().theme.colors.green[600],
          tailwindConfig().theme.colors.yellow[600],
          tailwindConfig().theme.colors.red[600],
          tailwindConfig().theme.colors.gray[600]
        ],
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Prepare data for monthly statistics chart (count of payments)
  const monthlyCountChartData = {
    labels: statsData?.data?.monthlyStats?.map(item => `${item.month}/${item.year.toString().slice(2)}`) || [],
    datasets: [
      {
        label: 'تعداد پرداخت‌های موفق',
        data: statsData?.data?.monthlyStats?.map(item => item.count) || [],
        backgroundColor: tailwindConfig().theme.colors.blue[500],
        hoverBackgroundColor: tailwindConfig().theme.colors.blue[600],
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Prepare data for monthly amount statistics chart (total amounts)
  const monthlyAmountChartData = {
    labels: statsData?.data?.monthlyStats?.map(item => `${item.month}/${item.year.toString().slice(2)}`) || [],
    datasets: [
      {
        label: 'مجموع مبالغ پرداختی (تومان)',
        data: statsData?.data?.monthlyStats?.map(item => item.totalAmount || 0) || [],
        backgroundColor: tailwindConfig().theme.colors.green[500],
        hoverBackgroundColor: tailwindConfig().theme.colors.green[600],
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Prepare data for sales count by product chart
  const salesCountByProductData = {
    labels: salesCountData?.data?.map(item => item.productName) || [],
    datasets: [
      {
        label: 'تعداد فروش',
        data: salesCountData?.data?.map(item => item.count) || [],
        backgroundColor: tailwindConfig().theme.colors.purple[500],
        hoverBackgroundColor: tailwindConfig().theme.colors.purple[600],
        barPercentage: 0.7,
        categoryPercentage: 0.8,
      },
    ],
  };

  // Format currency in Iranian Rials
  const formatCurrency = (amount) => {
    // Convert from Rials to Tomans (divide by 10) and format
    const tomans = Math.floor(amount / 10);
    return tomans.toLocaleString("fa-IR");
  };

  // Format currency for chart display (values are already in Tomans)
  const formatChartCurrency = (value) => {
    return Intl.NumberFormat('fa-IR', {
      maximumSignificantDigits: 3,
      notation: 'compact',
    }).format(value);
  };

  // Close modal
  const closeModal = () => {
    setSelectedPaymentId(null);
  };

  // Handle click on highest/lowest payment cards
  const handlePaymentClick = (paymentId) => {
    if (paymentId) {
      setSelectedPaymentId(paymentId);
    }
  };

  // Payment status map
  const paymentStatusMap = {
    pending: "در انتظار پرداخت",
    paid: "پرداخت شده",
    failed: "ناموفق",
    expired: "منقضی شده",
    refunded: "بازپرداخت شده",
    canceled: "لغو شده"
  };

  if (isLoading || isSalesLoading) {
    return <LoadingComponent />;
  }

  if (error || salesError) {
    return <ErrorComponent error={error || salesError} />;
  }

  return (
    <div className="col-span-full bg-white dark:bg-gray-800 shadow-sm rounded-xl p-6">
      <header className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">آمار پرداخت‌ها</h2>
      </header>

      {/* Status Statistics Cards */}
      <StatusStatisticsCards statusStats={statsData?.data?.statusStats} />

      {/* Highest and Lowest Payment */}
      <PaymentAmountCards 
        highestPayment={statsData?.data?.highestPayment}
        lowestPayment={statsData?.data?.lowestPayment}
        onPaymentClick={handlePaymentClick}
        formatCurrency={formatCurrency}
      />

      {/* All Charts in a Single Row */}
      <div className="overflow-x-auto overflow-y-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 min-w-max">
          {/* Status Statistics Chart */}
          <div className="min-w-[280px]">
            <StatusStatisticsChart statusChartData={statusChartData} />
          </div>

          {/* Monthly Statistics Chart (Count) */}
          <div className="min-w-[280px]">
            {monthlyCountChartData.labels.length > 0 && (
              <div className="h-full">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-4">آمار خریدهای موفق بر اساس ماه (تعداد)</h3>
                <div>
                  <PaymentBarChart data={monthlyCountChartData} width={400} height={256} valueType="count" />
                </div>
              </div>
            )}
          </div>

          {/* Monthly Statistics Chart (Amount) */}
          <div className="min-w-[280px]">
            {monthlyAmountChartData.labels.length > 0 && (
              <div className="h-full">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-4">آمار خریدهای موفق بر اساس ماه (مبالغ)</h3>
                <div>
                  <PaymentBarChart data={monthlyAmountChartData} width={400} height={256} valueType="currency" />
                </div>
              </div>
            )}
          </div>

          {/* Sales Count by Product Chart */}
          <div className="min-w-[280px]">
            {salesCountByProductData.labels.length > 0 && (
              <div className="h-full">
                <h3 className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-4">آمار فروش بر اساس محصول (تعداد)</h3>
                <div>
                  <PaymentBarChart data={salesCountByProductData} width={400} height={256} valueType="count" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Payment Details Modal */}
      <PaymentDetailsModal
        isOpen={!!selectedPaymentId}
        onClose={closeModal}
        paymentDetails={paymentDetails}
        isLoading={isPaymentLoading}
        error={paymentError}
        formatCurrency={formatCurrency}
        paymentStatusMap={paymentStatusMap}
      />
    </div>
  );
}

export default PaymentStatistics;