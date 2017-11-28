int do_rideyd()
{
        string hname;
        object ob = this_player();

        if (ob->query("family/family_name") != "八卦门")
        {
                message_vision(CYN "马童一把拉住$n" CYN "，大声喊道：“快来"
                               "人啊，有个" + RANK_D->query_rude(ob) + CYN
                               "要偷马！”\n" NOR, this_object(), ob);
                return 1;
        }
        if (ob->query_temp("is_riding"))
        {
               return notify_fail("你已经有坐骑了，自己直接rideto不就行了？\n");
        }
        switch (random(3))
        {
                case 1:
                        hname = MAG "紫骝马" NOR;
                        break;
                case 2:
                        hname = RED "枣红马" NOR;
                        break;
                default:
                        hname = HIY "黄骠马" NOR;
                        break;
        }
        message_vision(CYN "马童笑嘻嘻地牵来一匹" NOR + hname + CYN "，对$N"
                       CYN "道：“快上马吧。”。\n" NOR "$N翻身跃上马背，动"
                       "作很是潇洒利索。\n", ob );
        message_vision(HIC "\n只见$N" HIC "骑着" NOR + hname + HIC "穿过镖局"
                       "扬长而去，踏起一路尘埃。\n" NOR, ob);

        ob->move("/d/beijing/front_yard");
        tell_room(environment(ob), ob->query("name") + "骑着" + hname + "一"
                       "路招摇疾驰而过。\n", ({ob}));

        ob->move("/d/beijing/gate");
        tell_room(environment(ob), ob->query("name") + "骑着" + hname + "一"
                       "路招摇疾驰而过。\n", ({ob}));

        ob->move("/d/beijing/di_anmen");
        tell_room(environment(ob), ob->query("name") + "骑着" + hname + "一"
                       "路招摇疾驰而过。\n", ({ob}));

        ob->move("/d/huanghe/yongdeng");
        tell_room(environment(ob), ob->query("name") + "骑着" + hname + "一"
                       "路招摇疾驰而过。\n", ({ob}));

        ob->move("/d/huanghe/kedian");
        tell_room(environment(ob), ob->query("name") + "骑着" + hname + "一"
                       "路招摇疾驰而过。\n", ({ob}));

        ob->move("/d/huanghe/majiu");
        tell_room(environment(ob), ob->query("name") + "骑着" + hname + "一"
                       "路招摇疾驰而过。\n", ({ob}));

        message_vision("\n$N身形一转，跃下马来，姿态十分优美。闲人也给$N一大"
                       "哄！\n", ob);
        return 1;
}
