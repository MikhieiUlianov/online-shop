import Product, { ProductType } from "../models/product.js";
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";

export const getAddProduct = (req: Request, res: Response) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
    hasError: false,
    errorMessage: null,
    validationResult: [],
  });
};

export const postAddProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const title = req.body.title;
  const imageUrl = req.body.image;
  const price = req.body.price;
  const description = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Add Product",
      path: "/admin/add-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationResult: errors.array(),
      product: {
        title,
        imageUrl,
        price,
        description,
      },
    });
  }

  const product = new Product({
    title: title,
    price: price,
    description: description,
    imageUrl: imageUrl,
    userId: req.user,
  });
  product
    .save()
    .then(() => {
      console.log("Created Product");
      res.redirect("/admin/products");
    })
    .catch(() => {
      /*   res.redirect("/500"); */
      /*    return res.status(500).render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
        hasError: true,
        errorMessage: "Database operation failed.",
        validationResult: [],
        product: {
          title,
          imageUrl,
          price,
          description,
        },
      }); */
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};

export const getEditProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product: ProductType) => {
      if (!product) {
        return res.redirect("/");
      }
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
        hasError: false,
        errorMessage: null,
        validationResult: [],
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

export const postEditProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render("admin/edit-product", {
      pageTitle: "Edit Product",
      path: "/admin/edit-product",
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationResult: errors.array(),
      product: {
        title: updatedTitle,
        imageUrl: updatedImageUrl,
        price: updatedPrice,
        description: updatedDesc,
        _id: prodId,
      },
    });
  }

  Product.findById(prodId)
    .then((product: ProductType) => {
      if (product.userId.toString() !== req.user?._id.toString())
        return res.redirect("/");

      product.title = updatedTitle;
      product.price = updatedPrice;
      product.description = updatedDesc;
      product.imageUrl = updatedImageUrl;

      return product.save().then(() => {
        console.log("UPDATED PRODUCT!");
        res.redirect("/admin/products");
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

export const getProducts = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Product.find({ userId: req.user?._id })
    // .select('title price -_id')
    // .populate('userId', 'name')
    .then((products: ProductType[]) => {
      console.log(products);
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
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

export const postDeleteProduct = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const prodId = req.body.productId;

  Product.deleteOne({ _id: prodId, userId: req.user?._id })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err: unknown) => {
      const error: Error & { httpStatusCode?: number } = new Error(
        "Something went wrong."
      );
      error.httpStatusCode = 500;
      return next(error);
    });
};
