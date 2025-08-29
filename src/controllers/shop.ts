import { Request, Response } from "express";
import Product, { ProductType } from "../models/product";
import { UserType } from "../models/user";
import { OrderType } from "../models/order";
const Order = require("../models/order");

export const getProducts = (req: Request, res: Response) => {
  Product.find()
    .then((products: ProductType[]) => {
      console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch((err: unknown) => {
      console.log(err);
    });
};

export const getProduct = (req: Request, res: Response) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product: ProductType) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch((err: unknown) => console.log(err));
};

export const getIndex = (req: Request, res: Response) => {
  Product.find()
    .then((products: ProductType[]) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch((err: unknown) => {
      console.log(err);
    });
};

export const getCart = (req: Request, res: Response) => {
  req.user
    ?.populate("cart.items.productId")
    .then((user: UserType) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch((err: unknown) => console.log(err));
};

export const postCart = (req: Request, res: Response) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product: ProductType) => {
      return req.user?.addToCart(product);
    })
    .then((result: UserType) => {
      console.log(result);
      res.redirect("/cart");
    });
};

export const postCartDeleteProduct = (req: Request, res: Response) => {
  const prodId = req.body.productId;
  req.user
    ?.removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err: unknown) => console.log(err));
};

export const postOrder = (req: Request, res: Response) => {
  req.user
    ?.populate<{
      cart: { items: { productId: ProductType; quantity: number }[] };
    }>("cart.items.productId")
    .then((user) => {
      const products = user.cart.items.map((i) => {
        return {
          quantity: i.quantity,
          product: {
            title: i.productId.title,
            price: i.productId.price,
            description: i.productId.description,
            imageUrl: i.productId.imageUrl,
            _id: i.productId._id,
          },
        };
      });
      const order = new Order({
        user: {
          name: req.user?.name,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then(() => {
      return req.user?.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err: unknown) => console.log(err));
};

export const getOrders = (req: Request, res: Response) => {
  Order.find({ "user.userId": req.user?._id })
    .then((orders: OrderType[]) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
        isAuthenticated: req.isLoggedIn,
      });
    })
    .catch((err: unknown) => console.log(err));
};
