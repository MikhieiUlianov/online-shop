import { Request, Response, NextFunction } from "express";
import Product, { ProductType } from "../models/product.js";
import { UserType } from "../models/user.js";
import { OrderType } from "../models/order.js";
import Order from "../models/order.js";

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.find()
    .then((products: ProductType[]) => {
      console.log(products);
      res.render("shop/product-list", {
        prods: products,
        pageTitle: "All Products",
        path: "/products",
      });
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const getProduct = (req: Request, res: Response, next: NextFunction) => {
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product: ProductType) => {
      res.render("shop/product-detail", {
        product: product,
        pageTitle: product.title,
        path: "/products",
      });
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const getIndex = (req: Request, res: Response, next: NextFunction) => {
  Product.find()
    .then((products: ProductType[]) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
      });
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const getCart = (req: Request, res: Response, next: NextFunction) => {
  req.user
    ?.populate("cart.items.productId")
    .then((user: UserType) => {
      const products = user.cart.items;
      res.render("shop/cart", {
        path: "/cart",
        pageTitle: "Your Cart",
        products: products,
      });
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const postCart = (req: Request, res: Response, next: NextFunction) => {
  const prodId = req.body.productId;
  Product.findById(prodId)
    .then((product: ProductType) => {
      return req.session.user?.addToCart(product);
    })
    .then((result: UserType) => {
      console.log(result);
      res.redirect("/cart");
    });
};

export const postCartDeleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.body.productId;
  req.user
    ?.removeFromCart(prodId)
    .then((result) => {
      res.redirect("/cart");
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const postOrder = (req: Request, res: Response, next: NextFunction) => {
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
          email: req.user?.email,
          userId: req.user,
        },
        products: products,
      });
      return order.save();
    })
    .then(() => {
      return req.session.user?.clearCart();
    })
    .then(() => {
      res.redirect("/orders");
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const getOrders = (req: Request, res: Response, next: NextFunction) => {
  Order.find({ "user.userId": req.session.user?._id })
    .then((orders: OrderType[]) => {
      res.render("shop/orders", {
        path: "/orders",
        pageTitle: "Your Orders",
        orders: orders,
      });
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};
