// ultra.h 宗师评价玩家的公共代码

int calc_level(object me, string skill);
void check_ultra(object me);

// check level
// level is calculate as:
// level = (skill effect level) + (action["force"] - 200) / 5
mapping opinions_rank = ([
        520 : "宗师",
        490 : "登峰造极",
        460 : "超凡脱俗",
        430 : "臻至化境",
        400 : "炉火纯青",
        360 : "已有大成",
        320 : "非同凡响",
        280 : "出类拔萃",
        240 : "身手不凡",
        200 : "已有小成",
]);

// generate opinion
void check_opinion(object me)
{
//      string msg;
        string rank;
        int *ks;
        int lvl;
        int next_lvl;
        int opinion;
        int i;

        delete_temp("opinion");
        if (! me || environment(me) != environment())
        {
                command("sigh");
                return;
        }

        // rank: 原有的评价称号
        // ks:   不同评价需要的等级按照升序排列
        // lvl:  原有评价所在的等级
        // next_lvl: 在原有的评价下下一等级需要的lvl
        // opinion : 此次的评价等级，如果为-1就没有变化
        rank = me->query("opinion/" MY_OPINION);
        ks  = sort_array(keys(opinions_rank), 1);
        if (! stringp(rank))
        {
                // 以前没有评价，设置最小评价需要的等级
                next_lvl = ks[0];
        } else
        {
                // 以前有评价，看这一次如果提升的话需要
                // 到多少级
                for (i = 0; i < sizeof(ks) - 1; i++)
                        if (opinions_rank[ks[i]] == rank)
                        {
                                next_lvl = ks[i + 1];
                                break;
                        }
                if (i >= sizeof(ks))
                {
                        // 无法找到原先的等级，设置最小评价
                        next_lvl = ks[0];
                }
        }
        opinion = -1;
        for (i = 0; i < sizeof(my_opinions); i++)
        {
                lvl = calc_level(me, my_opinions[i]);
                if (lvl >= next_lvl && lvl > opinion)
                        // 记录：第i项武学有更好的评价
                        opinion = lvl;
        }

        if (opinion == -1)
        {
                if (next_lvl == ks[0])
                {
                        message_vision(CYN "\n$N" CYN "淡淡一笑，对$n"
                                       CYN "道：“你的" OPINION_TYPE
                                       + NOR + CYN "不行啊！好好努力"
                                       "吧！”\n" NOR, this_object(),
                                       me);
                        return;
                }
                message_vision(CYN "\n$N" CYN "对$n" CYN "摇摇头道："
                               "“不怎么样，我发现你的" OPINION_TYPE
                               + NOR + CYN "比上次没什么太大的进步。"
                               "”\n" NOR, this_object(), me);
                return;
        }

        for (i = sizeof(ks) - 1; i > 0; i--)
                if (opinion >= ks[i]) break;

        me->set("opinion/" MY_OPINION, opinions_rank[ks[i]]);
        if (i == sizeof(ks) -1)
        {
                // 到了终极
                message_vision(CYN "\n$N" CYN "对$n" CYN "笑道：“恭"
                               "喜！" + RANK_D->query_respect(me) +
                               "的" OPINION_TYPE + NOR + CYN "已然到"
                               "了宗师境界！武道无穷，阁下自重！”\n"
                               NOR, this_object(), me);
                me->set("opinions/master", 1);
                check_ultra(me);
                return;
        }

        message_vision(CYN "\n$N" CYN "沉思片刻，对$n" CYN "道：“就"
                       "目前来看，你的" OPINION_TYPE + NOR + CYN "已"
                       "经可以算得上是" + opinions_rank[ks[i]] + NOR
                       + CYN "了。”\n" NOR, this_object(), me);
}

void check_ultra(object me)
{
        object *ultra;

        if (me->query("opinion/unarmed") != "宗师" ||
            me->query("opinion/weapon") != "宗师"  ||
            me->query("opinion/force") != "宗师"  ||
            me->query("opinion/dodge") != "宗师" )
                return;

        me->set("opinion/ultra", 1);
        ultra = NPC_D->query_ultra_master();
        ultra -= ({ this_object() });
        command("chat 真是长江后浪推前浪，想不到今日又有" + me->query("name") +
                "跻身武林大宗师的行列！");
        ultra->do_congration(me);
        CHANNEL_D->do_channel(find_object(MASTER_OB), "rumor",
                              "听说" + me->query("name") + "成为武学大宗师。");
}