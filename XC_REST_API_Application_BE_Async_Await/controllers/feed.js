const fs = require('fs');
const path = require('path');

const { validationResult } = require('express-validator');

const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = async (req, res, next) => {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    try {
        // const totalItems = await Post
        //     .find()
        //     .countDocuments().exec(); // Mongoose doesn't return real promises, appending .exec() though would.

        const totalItems = await Post
            .find()
            .countDocuments().exec();

        const posts = await Post
            .find()
            .populate('creator')
            .skip((currentPage - 1) * perPage)
            .limit(perPage);

        res.status(200).json({ message: 'Posts fetched successfully.', posts: posts, totalItems: totalItems });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}

exports.createPost = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    if (!req.file) {
        const error = new Error('No image provided.');
        error.statusCode = 422;
        throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;

    const post = new Post({
        title: title,
        content: content,
        imageUrl: imageUrl,
        creator: req.userId,
    });

    try {
        await post.save();

        const user = await User.findById(req.userId);

        user.posts.push(post);
        await user.save();

        res
            .status(201)
            .json({
                message: 'Post created successfully.',
                post: post,
                creator: { _id: user._id, name: user.name }
            });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}

exports.getPost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId).populate('creator');

        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error; // If you throw an error in a then block then it will be passed through as the err in the catch block
        }

        res.status(200).json({ message: 'Post fetched.', post: post });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}

exports.updatePost = async (req, res, next) => {
    const postId = req.params.postId;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed, entered data is incorrect.');
        error.statusCode = 422;
        throw error;
    }
    const title = req.body.title;
    const content = req.body.content;
    let imageUrl = req.body.image;
    if (req.file) {
        imageUrl = req.file.path;
    }
    if (!imageUrl) {
        const error = new Error('No file picked.');
        error.statusCode = 422;
        throw error;
    }

    try {
        const post = await Post.findById(postId);

        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error; // If you throw an error in a then block then it will be passed through as the err in the catch block
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error; // If you throw an error in a then block then it will be passed through as the err in the catch block
        }
        if (imageUrl !== post.imageUrl) {
            clearImage(post.imageUrl);
        }
        post.title = title;
        post.imageUrl = imageUrl;
        post.content = content;

        const result = await post.save();
        res.status(200).json({ message: 'Post updated', post: result });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}

exports.deletePost = async (req, res, next) => {
    const postId = req.params.postId;

    try {
        const post = await Post.findById(postId)

        if (!post) {
            const error = new Error('Could not find post');
            error.statusCode = 404;
            throw error; // If you throw an error in a then block then it will be passed through as the err in the catch block
        }
        if (post.creator.toString() !== req.userId) {
            const error = new Error('Not Authorized');
            error.statusCode = 403;
            throw error; // If you throw an error in a then block then it will be passed through as the err in the catch block
        }
        // Check logged in user
        clearImage(post.imageUrl);
        await Post.findByIdAndDelete(postId);

        const user = await User.findById(req.userId);

        user.posts.pull(postId);
        await user.save();

        res.status(200).json({ message: 'Deleted post.' });
    } catch (error) {
        if (!error.statusCode) {
            error.statusCode = 500;
        }

        next(error);
    }
}

const clearImage = filePath => {
    filePath = path.join(__dirname, '..', filePath);
    fs.unlink(filePath, err => console.log(err));
};