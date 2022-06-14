## 说明

    拍卖系统守护进程

## 继承

    inherit F_DBASE;

## 属性

    无

## 方法

### add_auction

    public void add_auction(object me, object ob, int money);

### 描述

    为指定玩家 `me` 拍卖物品 `ob`，起步价为 `money`。

### cancel_auction

    public void cancel_auction(object me);

### 描述

    取消玩家 `me` 拍卖物品。

### check_auction_info

    public string check_auction_info();

### 描述

    检查当前正在拍卖的物品，返回拍卖列表。

### join_auction

    public void join_auction(object me, string name, int money);

### 描述

    参与竞价，玩家 `me` 以 `money` 竞拍玩家 `name` 的拍卖品。

## 私有方法

### check_auction

    private string check_auction(object ob);

### 描述

    检查物品 `ob` 是否可以拍卖。

### message_auction

    private void message_auction(string msg);

### 描述

    拍卖系统从交易频道发布拍卖消息 `msg`。
