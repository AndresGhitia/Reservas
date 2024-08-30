import React, { useContext } from 'react';
import './Cart.css';
import { StoreContext } from '../../context/StoreContext';

const Cart = () => {
    const { cartItems, rubro_card, removeFromCart } = useContext(StoreContext);

    return (
        <div className='cart'>
            <div className="cart-items">
                <div className="cart-items-title">
                    <p>Items</p>
                    <p>Title</p>
                    <p>Price</p>
                    <p>Quantity</p>
                    <p>Total</p>
                    <p>Remove</p>
                </div>
                <br />
                <hr />
                {rubro_card.map((item, index) => {
                    if (cartItems[item.id] > 0) {
                        return (
                            <div className='cart-items-title cart-items-item' key={item.id}>
                                <p>{item.name}</p>
                                {/* <p>{item.price}</p>
                                <p>{cartItems[item.id]}</p>
                                <p>{item.price * cartItems[item.id]}</p>
                                <button onClick={() => removeFromCart(item.id)}>Remove</button> */}
                            </div>
                        );
                    }
                    return null;
                })}
            </div>
        </div>
    );
};

export default Cart;
