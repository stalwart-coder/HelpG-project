import { useState } from 'react';
import { PRICE_BREAKDOWN } from '../../data/bookingData';

// Import booking flow screens
import PostTask from '../customer/PostTask';
import ServiceDetail from '../customer/ServiceDetail';
import BookingReview from './BookingReview';
import PaymentMethod from './PaymentMethod';
import BookingSuccess from './BookingSuccess';

// ── Booking Flow ─────────────────────────────────────────────────────────────
//
//  service-detail (category)
//    └─ "Book" clicked ──► post (category pre-filled)
//         └─ submitted ────► booking-review
//                            └─ confirm ──► payment
//                                           └─ success ──► booking-success
//                                                          └─ "Home" ──► exits flow
//
export default function BookingFlow({ initialCategory, onExit }) {
  const [screen, setScreen] = useState(initialCategory ? 'service-detail' : 'post');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);
  const [taskData, setTaskData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState(null);

  // Navigation helpers
  const goServiceDetail = (categoryId) => {
    setSelectedCategory(categoryId);
    setScreen('service-detail');
  };

  const goPost = (categoryId) => {
    setSelectedCategory(categoryId || null);
    setScreen('post');
  };

  const goBookingReview = (data) => {
    setTaskData(data);
    setScreen('booking-review');
  };

  const goPayment = () => {
    setScreen('payment');
  };

  const goSuccess = (method) => {
    setPaymentMethod(method);
    setScreen('booking-success');
  };

  const goHome = () => {
    onExit?.();
  };

  switch (screen) {
    case 'service-detail':
      return (
        <ServiceDetail
          category={selectedCategory}
          onBack={() => onExit?.()}
          onBook={(catId, tier) => {
            // Navigate to post with selected category
            setSelectedCategory(catId || selectedCategory);
            setScreen('post');
          }}
        />
      );

    case 'post':
      return (
        <PostTask
          presetCategory={selectedCategory}
          onBack={() => {
            if (selectedCategory) {
              goServiceDetail(selectedCategory);
            } else {
              onExit?.();
            }
          }}
          onSubmitted={(data) => goBookingReview(data || { category: selectedCategory })}
        />
      );

    case 'booking-review':
      return (
        <BookingReview
          taskData={taskData}
          onBack={() => goPost(selectedCategory)}
          onConfirm={() => goPayment()}
        />
      );

    case 'payment':
      return (
        <PaymentMethod
          totalAmount={(() => {
            const cat = taskData?.category || selectedCategory;
            return (cat && PRICE_BREAKDOWN[cat]?.total) || 385;
          })()}
          onBack={() => goBookingReview(taskData)}
          onSuccess={() => goSuccess('wallet')}
        />
      );

    case 'booking-success':
      return (
        <BookingSuccess
          taskData={taskData}
          paymentMethod={paymentMethod}
          onGoHome={goHome}
        />
      );

    default:
      return (
        <PostTask
          presetCategory={selectedCategory}
          onBack={() => onExit?.()}
          onSubmitted={(data) => goBookingReview(data || { category: selectedCategory })}
        />
      );
  }
}

