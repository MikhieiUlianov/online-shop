import path from "path";
import fs from "fs";

import { Request, Response, NextFunction } from "express";
import pdfkit from "pdfkit";

import Product, { ProductType } from "../models/product.js";
import { UserType } from "../models/user.js";
import { OrderType } from "../models/order.js";
import Order from "../models/order.js";

const ITEMS_PER_PAGE = 2;

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const page = Number(req.query.page) || 1;
  let totalItems: number;

  Product.find()
    .countDocuments()
    .then((numProducts: number) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products: ProductType[]) => {
      res.render("shop/products-list", {
        prods: products,
        pageTitle: "Products",
        path: "/products",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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
  const page = Number(req.query.page) || 1;
  let totalItems: number;

  Product.find()
    .countDocuments()
    .then((numProducts: number) => {
      totalItems = numProducts;
      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then((products: ProductType[]) => {
      res.render("shop/index", {
        prods: products,
        pageTitle: "Shop",
        path: "/",
        currentPage: page,
        hasNextPage: ITEMS_PER_PAGE * page < totalItems,
        hasPreviousPage: page > 1,
        nextPage: page + 1,
        prevPage: page - 1,
        lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE),
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

export const getInvoice = (req: Request, res: Response, next: NextFunction) => {
  const orderId = req.params.orderId;

  Order.findById(orderId)
    .then((order) => {
      if (!order) return next(new Error("No order found."));
      if (order.user.userId.toString() !== req.user?._id.toString())
        return next(new Error("Unauthorized"));

      const invoiceName = "invoice-" + orderId + ".pdf";
      const invoicePath = path.join("data", "invoices", invoiceName);
      const pdfDoc = new pdfkit();
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text("Invoice", {
        underline: true,
      });

      pdfDoc.text("-------------------");

      let totalPrice = 0;
      order.products.forEach((prod) => {
        totalPrice += prod.quantity * prod.product.price;
        pdfDoc
          .fontSize(14)
          .text(
            prod.product.title +
              "-" +
              prod.quantity +
              " x " +
              "$" +
              prod.product.title
          );
      });
      pdfDoc.text("-------------------");
      pdfDoc.fontSize(20).text(`Total: $ ${totalPrice}`);

      pdfDoc.end();
      /*       const file = fs.createReadStream(invoicePath);
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        'inline; filename="' + invoiceName + '"'
      );
      file.pipe(res); */
    })
    .catch((err) => next(err));
};
