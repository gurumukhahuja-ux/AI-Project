import React, { useState } from 'react';
import styled from 'styled-components';
import { X } from 'lucide-react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { toggleState, userData } from '../../userStore/userData';
import { motion } from 'motion/react';
import { apis } from '../../types';
import axios from 'axios';

const SubscriptionForm = ({ id }) => {
  const [subscripTgl, setSubscripTgl] = useRecoilState(toggleState)
  const currentUserData = useRecoilValue(userData);
  const user = currentUserData.user;
  const userId = user?.id || user?._id;
  const [errorMessage, setErrorMessage] = useState("");
  console.log("SubscriptionForm: Using userId:", userId);


  function buyAgent(e) {
    e.preventDefault();
    setErrorMessage(""); // Clear previous errors

    if (!userId) {
      console.error("User ID missing or not logged in");
      setErrorMessage("Please login to subscribe");
      return;
    }
    axios.post(`${apis.buyAgent}/${id}`, { userId })
      .then((res) => {
        setSubscripTgl({
          ...subscripTgl,
          subscripPgTgl: false,
          notify: true,
          lastSubscription: Date.now() // Force marketplace refresh
        });
        console.log(res);
      })
      .catch((err) => {
        console.error("Subscription error:", err);

        // Show specific error message in UI
        const errorMsg = err.response?.data?.error || err.message || "Failed to subscribe";
        setErrorMessage(errorMsg);

        // Keep modal open if there's an error so user can see the message
        // Auto-close after 3 seconds
        setTimeout(() => {
          setSubscripTgl({
            ...subscripTgl,
            subscripPgTgl: false,
            notify: true,
            lastSubscription: Date.now() // Force refresh to show updated state
          });
        }, 3000);
      });
  }


  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/20 backdrop-blur-sm'>
      <StyledWrapper  >
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}>
          <form className="plan-chooser ">
            <div className='flex justify-end items-center' > <X onClick={() => { setSubscripTgl({ ...subscripTgl, subscripPgTgl: false }) }} /></div>
            <div className="header">
              <span className="title">Choose your plan</span>
              <p className="desc">Amet minim mollit non deserunt ullamco est sit .</p>
            </div>
            <div className="plan-option">
              <input defaultValue="free" id="free" name="plan" type="radio" />
              <label htmlFor="free">
                <div className="plan-info">
                  <span className="plan-cost">₹0</span>
                  <span className="plan-name">Try Free</span>
                </div>
              </label>
            </div>
            <div className="plan-option">
              <input defaultValue="monthly" id="monthly" name="plan" type="radio" />
              <label htmlFor="monthly">
                <div className="plan-info">
                  <span className="plan-cost">₹49/month</span>
                  <span className="plan-name">Monthly plan</span>
                </div>
              </label>
            </div>
            <div className="plan-option">
              <input defaultValue="annual" id="annual" name="plan" type="radio" />
              <label htmlFor="annual">
                <div className="plan-info">
                  <span className="plan-cost">₹19/month</span>
                  <span className="plan-name">₹228 billed in a year</span>
                </div>
                <span className="reduction"> Save 20% </span>
              </label>
            </div>

            {/* Error Message Display */}
            {errorMessage && (
              <div className="error-message">
                {errorMessage}
              </div>
            )}

            <button
              type="button"
              onClick={buyAgent}
              className="choose-btn"
              title="Start subscription"
            >
              Start
            </button>

          </form>
        </motion.div>

      </StyledWrapper>
    </div>

  );
}

const StyledWrapper = styled.div`
  .plan-chooser {
    background-color: rgba(255, 255, 255, 1);
    max-width: 320px;
    border-radius: 10px;
    padding: 20px;
    color: #000;
    box-shadow: 0px 87px 78px -39px rgba(0,0,0,0.4);
  }

  .header {
    text-align: center;
    margin-top: 0.75rem;
  }

  .plan-chooser .title {
    font-size: 1.875rem;
    font-weight: 700;
    line-height: 1.25rem;
    color: rgba(0, 0, 0, 1);
  }

  .plan-chooser .desc {
    margin-top: 0.4rem;
    font-size: 1rem;
    line-height: 1.5rem;
    color: rgba(75, 85, 99, 1);
  }

  .plan-option {
    margin-top: 1rem;
    margin-bottom: 15px;
  }

  .plan-option label {
    cursor: pointer;
    overflow: hidden;
    border: 2px solid rgba(229, 231, 235, 1);
    border-radius: 0.375rem;
    background-color: rgba(249, 250, 251, 1);
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem .4rem;
    margin: 10px 0;
    transform: all .15s ease;
  }

  .plan-option label .plan-info {
    display: flex;
    flex-direction: column;
    margin-left: 10px;
  }

  .plan-cost {
    font-size: 1.25rem;
    line-height: 1.75rem;
    font-weight: 600;
    color: rgba(0, 0, 0, 1);
  }

  .plan-name {
    font-size: 0.875rem;
    line-height: 1.25rem;
    color: rgba(75, 85, 99, 1);
  }

  .reduction {
    display: inline-block;
    border-radius: 9999px;
    border: 1px solid rgba(22, 163, 74, 1);
    background-color: rgba(220, 252, 231, 1);
    padding: 0.2rem .4rem;
    font-size: 0.675rem;
    line-height: 1.25rem;
    font-weight: 600;
    color: rgba(22, 163, 74, 1);
  }

  .plan-option input:checked + label {
    border-color: rgba(37, 99, 235, 1);
  }

  .choose-btn {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 0.375rem;
    background-color: rgba(37, 99, 235, 1);
    padding: 1rem 3rem;
    font-weight: 600;
    color: #fff;
    transform: all .15s ease;
  }

  .choose-btn:hover {
    opacity: .9;
  }

  .plan-option input {
    display: none;
  }

  .error-message {
    margin-top: 1rem;
    margin-bottom: 1rem;
    padding: 0.75rem 1rem;
    border-radius: 0.375rem;
    background-color: rgba(254, 226, 226, 1);
    border: 1px solid rgba(239, 68, 68, 1);
    color: rgba(185, 28, 28, 1);
    font-size: 0.875rem;
    font-weight: 600;
    text-align: center;
    animation: slideDown 0.3s ease-out;
  }

  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }`;

export default SubscriptionForm;
