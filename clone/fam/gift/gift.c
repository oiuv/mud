#include <ansi.h>
inherit COMBINED_ITEM;

string query_autoload()
{
    return query_amount() + "";
}

void create()
{
    set_name(HIY "仙丹" NOR, ({"gift"}));
    if (clonep())
        set_default_object(__FILE__);
    else
    {
        set("long", HIY "这是一颗增加容貌的仙丹。\n" NOR);
        set("base_unit", "颗");
        set("base_value", 10000);
        set("base_weight", 50);
        set("only_do_effect", 1);

        // 增加天赋的种类
        set("gift_type", "per");

        // 天赋种类的名称
        set("gift_name", "容貌");

        // 成功的几率
        set("gift_point", 100);

        // 成功的描述
        set("gift_msg", HIC "突然间你的皮肤透过一道光泽。\n" NOR);
    }
    setup();
}

int do_effect(object me)
{
    int point;

    point = query("gift_point");

    if (is_sub(query("gift_type"), me->query("env/no_gift")))
    {
        return notify_fail("你设置了不服用" + query("gift_name") + "(" + query("gift_type") + ")类仙丹，如需服用请取消限制。\n");
    }

    // 真命天子提升成功几率
    if (me->query("special_skills/emperor"))
        point += 25;

    // 九天玄女提升成功几率
    if (me->query("special_skill/queen"))
        point += 20;

    // 天煞孤星提升成功几率
    if (me->query("special_skills/lonely"))
        point += 15;

    // 福星高照提升成功几率
    if (me->query("special_skill/lucky"))
        point += 10;

    message_vision(WHT "$N" WHT "一仰脖，吞下了一" + query("base_unit") + name() + WHT "。\n" NOR, me);

    // 记录吃丹的总量
    me->add("gift/" + query("gift_type") + "/all", 1);
    me->add("gift/gift_all", 1);

    // if (me->query("gift/" + query("gift_type") + "/all") > 10)
    // {
    //     tell_object(me, "你觉得这药好象没什么效果。\n");
    // }
    // 开放转世后，限制最多吃十颗仙丹，多吃无效
    if (me->query("gift/gift_all") > 10)
    {
        tell_object(me, "已经超过10颗啦，是药三分毒，再吃小心拉肚子。\n");
        // me->add("gift/gift_all", -1);
    }
    else if (random(100) >= point)
    {
        tell_object(me, HIR "不过你觉得这药好像没起到什么作用。\n" NOR);

        // 记录失败的记号
        me->add("gift/" + query("gift_type") + "/fail", 1);
    }
    else
    {
        tell_object(me, query("gift_msg"));
        tell_object(me, HIC "你的" + query("gift_name") + HIC "永久增加一点。\n" NOR);

        // 记录成功的记号
        me->add("gift/" + query("gift_type") + "/succeed", 1);

        // 增加相应的天赋属性
        me->add(query("gift_type"), 1);
    }

    add_amount(-1);
    if (query_amount() < 1)
        destruct(this_object());

    return 1;
}

void autoload(string param)
{
    int amt;

    if (sscanf(param, "%d", amt) == 1)
        set_amount(amt);
}

void setup()
{
    set_amount(1);
    ::setup();
}
