// comment_id: 'aaa',
// isMsgComment: true,
// comment_to_id: abc, // 如果是文章评论，则为文章id，否则为评论的id
// comment_uid: '123', // 评论人的用户id
// comment: '王家卫的电影风格',
// uid: 'ccc', // 评论人的id
const Mongoose = require('mongoose');



const Scheam = Mongoose.Schema;

/**
 * 一级评论单独一个数据文档
 * 为了减少数据查询，增加查询效率，将二级平路放在一级评论内容数据之下
 * 
 * reply_childs: [
 *  reply_is_ordinary: false,
 * reply_to_id
 * ]
 */
const ReplyModal = new Scheam({

  reply_is_ordinary: { // 默认是一级评论，既直接对文章详情进行评论
    type: Boolean,
    default: true
  },
  reply_to_id: { // 一级评论则为文章id,否则为二级评论的reply_id
    type: String,
    default: '', // 
    required: true,
  },
  reply_uid: { // 评论人的uid
    type: String,
    required: true
  },
  reply_content: {
    type: String,
    default: '',
  },
  createAt: {
    type: Date,
    default: Date.now()
  },
  reply_childs: {
    type: Array,
    default: []
  },
  updateAt: {
    type: Date,
    default: Date.now()
  },
});

module.exports = Mongoose.model('Reply', ReplyModal);