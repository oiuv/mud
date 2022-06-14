## 说明

    玩家任务奖励守护进程

## 继承

    inherit F_DBASE;
    inherit F_CLEAN_UP;

## 属性

    无

## 方法

    public void delay_bonus(object who, mapping b);
    public void delay_work_bonus(object who, mapping b);
    public void delay_freequest_bonus(object who);
    public void delay_gift_bonus(object who, mapping b);
    varargs public void bonus(object who, mapping b, int flag);
    varargs public void work_bonus(object who, mapping b, int flag);
    varargs public void freequest_bonus(object who);
    varargs public void gift_bonus(object who, mapping b);
