## 说明

    自制武器相关功能守护进程。

## 继承

    无

## 属性

    string *imbue_list;
    string *imbue_list2;

## 方法

    void killer_reward(object me, object victim, object item);
    int receive_summon(object me, object item);
    int hide_anywhere(object me, object item);
    int receive_miss(object me, object item);
    int do_stab(object me, object item);
    mixed do_get_item(object item);
    mixed do_touch(object me, object item);
    int do_san(object me, object item);
    int do_imbue(object me, object item, object imbue);
    int do_enchase(object me, object item, object tessera);
    mixed weapon10lv_hit_ob(object me, object victim, object weapon, int damage_bonus);
    mixed weapon_hit_ob(object me, object victim, object weapon, int damage_bonus);
    void continue_attack(object me, object victim, object weapon, int times);
    void reduce_consistence(object item);
    void equip_setup(object item);
