## 说明

    数据备份守护进程

## 继承

    inherit F_DBASE;

## 属性

    nosave int state;
    nosave int *tlist = ({ 0, 550, 559, 600 });
    nosave int *hlist = ({ 45, 1, 1, 1 });


## 方法

### is_backuping

    int is_backuping();

### 描述

    检查是否在备份中……

### query_backup_time

    int query_backup_time();

### 描述

    获取备份开始时间。

### backup_data

    void backup_data();

### 描述

    使用 `/cmds/wiz/cp` 指令备份数据。

### remove_backup

    void remove_backup(mixed lt);

### 描述

    使用 `/cmds/wiz/rm` 指令删除过期备份数据。

## 私有方法

### change_state

    private void change_state(int new_state);

### 描述

    更新备份状态（SLEEPING/READY/BACKUPING）

### check_all_player

    private void check_all_player();

### 描述

    使用 `/cmds/arch/examine` 指令检查所有玩家数据。

### is_recent_time

    private int is_recent_time(int y, int m, int d, int cy, int cm, int cd);

### 描述

    检查指定年月日 y-m-d 和当前年月日 cy-cm-cd 之间间隔是否小于15天。

### assure_not_exist

    private int assure_not_exist(string bkdir);

### 描述

    删除备份文件或目录并检查是否删除成功。

### sys_info

    private void sys_info(string msg);

### 描述

    备份系统发布备份通知并记录日志。
