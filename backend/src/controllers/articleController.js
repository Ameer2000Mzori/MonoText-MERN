import { Article } from '../modules/article.js'
import { User } from '../modules/users.js'
import { Rate } from '../modules/rate.js'
import 'dotenv/config'

export const homePage = (req, res) => {
  res.send('this message is from backend')
}

// get articles
export const getArticle = (req, res) => {
  Article.find()
    .populate('author')
    .populate('rates')
    .sort({
      createdAt: -1,
    })
    .then((result) => {
      res.status(200).json(result)
    })
    .catch((err) => console.log(err))
}

// create article
export const createArticle = async (req, res) => {
  const { title, text } = req.body
  console.log(req.user)

  try {
    // Find the user by ID
    const user = await User.findById(req.user.id)

    // Create a new article
    const newArticle = new Article({
      author: user.id,
      title,
      text,
    })

    // Save the new article
    await newArticle.save()

    // Push the newly created article to the user's articles array
    user.articles.push(newArticle)

    // Save the updated user
    await user.save()

    res.status(200).json({
      message: 'Article created successfully',
      article: newArticle,
    })
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'An error occurred' })
  }
}

// rate article

export const rateArticle = async (req, res) => {
  const { value, article_id } = req.body
  try {
    const article = await Article.findById(article_id)
    const rate = await Rate.findOne({ article: article_id, user: req.user.id })
    if (rate) {
      if (rate.value === value) {
        rate.value = 0
      } else {
        rate.value = value
      }
      await rate.save()
      res.status(200).json({
        message: 'rate updated successfully',
        rate: rate,
      })
    } else {
      const newRate = new Rate({
        user: req.user.id,
        article: article.id,
        value,
      })

      await newRate.save()

      // Push the newly created rate to the article
      article.rates.push(newRate)

      // Save the updated article
      await article.save()

      res.status(200).json({
        message: 'rate created successfully',
        rate: newRate,
      })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'An error occurred' })
  }
}

//  article update
export const updateArticle = async (req, res) => {
  const { text, title, article_id } = req.body

  try {
    const article = await Article.findById(article_id)

    if (article.author.toString() === req.user.id) {
      const updateData = {
        title: title ?? article.title,
        text: text ?? article.text,
      }
      await Article.updateOne({ _id: article_id }, updateData)

      await article.save()
      res.status(401).json({
        message: 'Article updated successfully',
        article: article,
      })
    } else {
      res
        .status(500)
        .json({ error: 'you are not allowed to update this article' })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'An error occurred' })
  }
}

// delete article
export const deleteArticle = async (req, res) => {
  const { article_id } = req.body

  try {
    const article = await Article.findById(article_id)
    console.log(article.author)
    console.log(req.user.id)

    if (article.author.toString() === req.user.id) {
      await Article.findOneAndDelete({ _id: article_id })
    } else {
      res.status(404).json({ error: 'you are not allowed to delete' })
    }
  } catch (err) {
    console.log(err)
    res.status(500).json({ error: 'An error occurred' })
  }
}
