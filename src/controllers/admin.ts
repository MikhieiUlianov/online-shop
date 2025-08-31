import Product, { ProductType } from "../models/product.js";
import { Request, Response } from "express";

export const getAddProduct = (req: Request, res: Response) => {
  res.render("admin/edit-product", {
    pageTitle: "Add Product",
    path: "/admin/add-product",
    editing: false,
  });
};

export const postAddProduct = (req: Request, res: Response) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
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
    .catch((err: unknown) => {
      console.log(err);
    });
};

export const getEditProduct = (req: Request, res: Response) => {
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
      });
    })
    .catch((err: unknown) => console.log(err));
};

export const postEditProduct = (req: Request, res: Response) => {
  const prodId = req.body.productId;
  const updatedTitle = req.body.title;
  const updatedPrice = req.body.price;
  const updatedImageUrl = req.body.imageUrl;
  const updatedDesc = req.body.description;

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
    .catch((err: unknown) => console.log(err));
};

export const getProducts = (req: Request, res: Response) => {
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
    .catch((err: unknown) => console.log(err));
};

export const postDeleteProduct = (req: Request, res: Response) => {
  const prodId = req.body.productId;

  Product.deleteOne({ _id: prodId, userId: req.user?._id })
    .then(() => {
      console.log("DESTROYED PRODUCT");
      res.redirect("/admin/products");
    })
    .catch((err: unknown) => console.log(err));
};
