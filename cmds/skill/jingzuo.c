// jingzuo.c
// Dec.11 1997 by Venus

void wakeup(object me, object where);
void del_jingzuoed(object me);

int main(object me, string arg)
{
//      mapping fam;
        object where = environment(me);

        seteuid(getuid());

        //return notify_fail("对不起，本MUD暂时未开放静坐指令。\n");

        if (me->query("family/family_name") != "峨嵋派")
                return notify_fail("只有峨嵋派弟子才会才能静坐！\n");

        if (where->query("no_fight") && me->query("doing") != "scheme")
                return notify_fail("这里太纷杂，你没法安心静坐。\n");

        if (me->query("eff_jing") < 50)
                return notify_fail("你受伤太重，无法定心静坐。\n");

        if (me->is_busy())
                return notify_fail("你正忙着呢！\n");

        if (me->is_fighting())
                return notify_fail("战斗中想静坐？你不要命啦！\n");

        if (time() - me->query("jingzuo_time") < 120)
                return notify_fail("你刚才静坐过，现在头脑一片空白。\n");

        if (me->query_skill("mahayana", 1) < 40)
                return notify_fail("你的大乘般涅磐功还太浅薄了，没法静心静坐。\n");

        write("你往床上盘膝一坐，开始静坐。\n");
        write("不一会儿，你神游天外，物我两忘。\n");
        me->set_temp("block_msg/all", 1);
        message_vision("$N一躬身，坐了下来，闭目端念，静心打坐。\n",me);

        me->set("no_get", 1);
        me->set("no_get_from", 1);
        me->disable_player(" <静坐中>");
        me->start_call_out(bind((: call_other, __FILE__, "wakeup", me, where :), me),
                           random(45) + 1 , me, where);

        return 1;
}

void wakeup(object me, object where)
{
        int skillslvl, addp, addc, exppot, intpot;

        skillslvl = (int) me->query_skill("mahayana", 1);
        exppot = (int) (me->query("combat_exp") / 100000);
        intpot = (int) (me->query_int() / 10);

        if (skillslvl > 100) skillslvl = (skillslvl - 100) / 2 + 100;
        if (exppot > 150) exppot = (exppot - 150) / 4 + 100; else
        if (exppot > 50)  exppot = (exppot - 50) / 2 + 50;

        addp = (int) (random(skillslvl) / 5 + intpot);
        addc = (int) (random(skillslvl) / 3 + exppot);
        me->receive_damage("jing", 15);
        me->receive_wound("jing", 3);
        if (objectp(where) && where->query("no_fight"))
                me->receive_wound("jing", 5);
        me->improve_potential(addp);
        me->add("combat_exp", addc);
        me->enable_player();
        message_vision("$N静坐完毕，缓缓睁眼，长长吐了一口气。\n",me);
        me->set_temp("block_msg/all", 0);
        me->set("jingzuo_time", time());
        write("你静坐完毕，感觉到好累。\n");

        me->delete("no_get");
        me->delete("no_get_from");
        me->write_prompt();
        return;
}

int help(object me)
{
        write(@HELP
指令格式 : jingzuo

这个指令是峨嵋派弟子用以静坐修道的命令.

HELP );
        return 1;
}