## 说明

    用户登录IP屏蔽处理进程

## 继承

    无

## 属性

string *Sites;

## 方法

### load_sites

    void load_sites();

### 描述

    取得被禁IP数组列表

### is_banned

    int is_banned(string site);

### 描述

    判断指定IP是否被禁

### print

    void print();

### 描述

    打印被禁IP列表

### add_site

    void add_site(string site);

### 描述

    增加禁止IP

### remove_site

    void remove_site(string site);

### 描述

    从被禁IP中移除指定IP
