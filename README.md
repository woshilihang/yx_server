# Koa

路由
请求


create database database_name;

use database_name;

create table network3 ( id char(10) not null primary key, name char(16) not null, sex char(6) not null, age int not null, address char(36) not null);

describe network3;

插入数据
insert into network3 values('3114006441', 'xpleaf', 'male', 35, 'beijing');

查询数据
select 列名称 from 数据库表名 [查询条件];

查询 特定列的数据
select id, name, from network3;

根据特定条件查询表中的数据
select 列名称 from 数据库表名 where 查询条件;

修改数据表中的数据
update network3 set address='haha' where name='xpleaf';
update network3 set age = age+1;

删除数据表中的数据
delete from network3 where name='Pei';

修改数据库表结构change
alter table 数据库表名 change 列名称 新数据类型 [其它];
alter table network3 change address addr char(30) not null;

删除数据库表列drop
alter table 数据库表名 drop 列名称;
alter table network3 drop addr;

重命名数据库表rename
alter table network3 rename New_network3;

删除数据库表
drop table New_network3;

删除数据库
drop database students;

项目目录结构

├── config/ 
│ ├── index.js            # 项目参数设置
├── controllers/          # 处理路由映射函数中心
├── controllers/          # 小程序示例项目
├── middleware/           # 中间件目录
├── model/                # mongo模型目录
├── routes/               # koa路由目录
├── .babelrc              # babel配置
├── app.js                # 项目启动模块
├── index.js              # 项目启动入口
├── pm2.config.json       # pm2配置目录
└──  package.json         # 项目信息


mongoose.Types.ObjectId();


（1）用户信息模块  用户注册登录、个人信息维护

（2）二手交易模块  闲置信息发布、二手物品查询、闲置信息展示、物品分享

（3）失物招领模块 失物招领信息发布、展示

（4）个人信息模块 微信登录、我发布商品列表、我的失物招领列表、喜欢的商品收藏功能

前端
项目的基本结构
组件的划分
路由的处理

小程序登录态鉴权导图

API后端接口鉴权，资源分块拦截导图

API的设计原则

数据库设计导图

参数校验以及错误日志处理

用户登录 ---
各大功能点导图


涉及功能大致分为：发布文章/话题，文章详情，文章列表，话题分类，收藏，点赞，关注，我的提问，搜索，最新，最热，解答达人等等。