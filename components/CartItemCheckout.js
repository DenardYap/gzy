import React from "react";

const CartItemCheckout = ({ item }) => {
  return (
    <div className="flex flex-col text-2xl text-slate-600">
      <div className="flex flex-row justify-between text-xl font-medium ">
        <h3>{item.imageTitle}</h3>
        <h4>
          Subtotal: RM
          {(parseInt(item.price) * parseInt(item.amount)).toFixed(2)}
        </h4>
      </div>
      <div className="flex flex-row justify-between text-base  text-gray-400 font-light pb-2">
        <h3>Quantity: {item.amount}</h3>
        <h4>RM{parseFloat(item.price).toFixed(2)} per item</h4>
      </div>
    </div>
  );
};

export default CartItemCheckout;
