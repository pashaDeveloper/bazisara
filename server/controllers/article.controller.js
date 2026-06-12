const articleService = require("../services/article.service");

exports.createArticle = async (req, res) => {
  await articleService.createArticle(req, res);
};

exports.getArticles = async (req, res) => {
  await articleService.getArticles(req, res);
};

exports.getArticle = async (req, res) => {
  await articleService.getArticle(req, res);
};

exports.generateArticleSlug = async (req, res) => {
  await articleService.generateArticleSlug(req, res);
};

exports.updateArticle = async (req, res) => {
  await articleService.updateArticle(req, res);
};

exports.deleteArticle = async (req, res) => {
  await articleService.deleteArticle(req, res);
};
