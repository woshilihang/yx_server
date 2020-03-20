const ReplyModal = require('../model/reply');

const { getJWTPayload } = require('../utils/index');

class ReplyController {
  constructor() { }

  publishReply = async ctx => {
    const { reply_is_ordinary, reply_content, reply_to_id } = ctx.request.body;

    const authorization = ctx.request.header.authorization;

    if (authorization) {
      let { openid = '' } = getJWTPayload(authorization);
      console.log('获取到的用户 openid --', openid);
      if (!openid) ctx.body = {
        code: 4001,
        message: '用户未登录，请前往登录',
        data: {}
      }

      // 判断是否为一级评论，二级评论另做处理
      if (reply_is_ordinary) {
        const saveParams = {
          reply_is_ordinary,
          reply_content,
          reply_to_id,
          reply_uid: openid
        };
        console.log('params --- ', saveParams);
        const NewReplyInfoModal = new ReplyModal(saveParams);

        try {
          const _save = await NewReplyInfoModal.save();
          console.log('[mongoSave]', _save)
          //成功返回code=200，并返回成sessionKey
          ctx.body = {
            code: 200,
            message: '留言发布成功',
            data: {
              reply_id: _save._id,
              reply_is_ordinary,
              reply_to_id,
            }
          }
        } catch (err) {
          console.log('[mongoSaveError]', err);
          ctx.body = {
            code: 500,
            message: '留言发布失败',
            data: {}
          }
        }
      } else {
        // 二级评论，插入到一级评论reply_childs下作为子评论
        // await ReplyModal.findOneAndUpdate({
        //   reply_to_id
        // }, {
        //   reply_childs:
        // }).exec().then(reply => {
        //   console.log('更新mreply的数据记过')
        // })
        console.log('reply_to_id --', reply_to_id)
        await this.findOneReply({
          _id: reply_to_id
        }).then(async reply => {
          console.log(reply, 'reply');
          if(!reply) {
            ctx.body = {
              code: 200,
              message: '没有该条以及评论',
              data: {}
            }
            return ;
          }

          const _reply_child = reply.toObject().reply_childs;
          console.log(_reply_child, '_reply_child');
          const new_reply_child = [
            ..._reply_child,
            {
              reply_is_ordinary,
              reply_content,
              reply_to_id,
              reply_uid: openid
            }
          ];
          await ReplyModal.updateOne({
            _id: reply_to_id
          }, {
            reply_childs: new_reply_child
          }).exec().then(updateReply => {
            console.log('更新之后的数据', updateReply);
            ctx.body = {
              code: 200,
              message: '二级留言成功',
              data: {}
            }
          })
        });

      }


    }
  }

  findOneReply = async (params) => {
    return await ReplyModal.findOne({
      ...params
    }).exec().then(reply => {
      return reply;
    });
  }

}

module.exports = new ReplyController();
