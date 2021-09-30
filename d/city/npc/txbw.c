
#include <ansi.h>

inherit NPC;
inherit F_DEALER;

mixed  show_all();
mixed  ask_txbw();

void create()
{
        set_name(WHT "使者" NOR, ({"shi zhe", "shi"}));
        set("long", "天下布武负责人。\n");
        set("title", YEL "天下布武" NOR );
        set("gender", "男性");
        set("age", 45);

        set("inquiry", ([
                "天下布武" : (: show_all :),
                "学技能"     : (: show_all :),
        ]));

        setup();
}

void init()
{
        add_action("do_txbw", "txbw");
}

mixed show_all()
{
        object me = this_player();

        tell_object(me, "你可以在这里学习天下武林各门派的入门武功，但需要支付小小的费用，直接扣存款(5000 gold)。\n"
                        "格式：txbw <技能名称>, 举例：txbw shaolin-shenfa\n\n"
                            "轻功(dodge)  ：少林身法(shaolin-shenfa), 衡山身法(henshan-shenfa)\n"
                            "爪法(claw)   ：小擒拿手(xiao-qinna),     虎抓绝户手(huzhua-shou)\n"
                            "手法(hand)   ：青云手(qingyun-shou),     三阴手(sanyin-shou),       密宗大手印(dashou-yin)\n"
                            "拳法(cuff)   ：八卦拳法(bagua-quan),     嵩山拳法(songshan-quan),   七星拳法(qixing-quan)\n"
                            "指法(finger) ：沧浪指法(canglang-zhi),   终南指法(zhongnan-zhi),    天罡指穴法(tiangang-zhi)\n"
                            "掌法(strike) ：绝情掌(jueqing-zhang),    华山掌法(huashan-zhangfa), 霹雳奔雷掌(benlei-zhang)\n"
                            "拳脚(unarmed)：破碑腿(pobei-tui),        美女拳法(meinv-quan)\n"
                            "鞭法(whip)   ：缠魂索(chanhun-suo),      蝎尾鞭(xiewei-bian)\n"
                            "棍法(club)   ：采燕功(caiyan-gong),      金猿棍法(jinyuan-gun)\n"
                            "杖法(staff)  ：银瑚杖法(yinhu-zhang),    灵蛇杖法(lingshe-zhangfa)\n"
                            "刀法(blade)  ：铁血刀法(tiexue-dao),     闯王刀法(chuangwang-dao)\n"
                            "锤法(hammer) ：风雷盘法(fenglei-panfa),  无上大力杵(dali-chu)\n"
                            "短兵(dagger) ：鹤形笔法(hexing-bifa),    清凉打穴法(qingliang-daxuefa)\n\n");

        return 1;
}

int do_txbw(string arg)
{
    int i, n;
    string skill;
    object me = this_player();

    string *skill_list = ({
                "shaolin-shenfa",
                "henshan-shenfa",
                "xiao-qinna",
                "huzhua-shou",
                "qingyun-shou",
                "sanyin-shou",
                "dashou-yin",
                "bagua-quan",
                "songshan-quan",
                "qixing-quan",
                "canglang-zhi",
                "zhongnan-zhi",
                "tiangang-zhi",
                "jueqing-zhang",
                "huashan-zhangfa",
                "benlei-zhang",
                "pobei-tui",
                "meinv-quan",
                "chanhun-suo",
                "xiewei-bian",
                "caiyan-gong",
                "jinyuan-gun",
                "yinhu-zhang",
                "lingshe-zhangfa",
                "tiexue-dao",
                "chuangwang-dao",
                "fenglei-panfa",
                "dali-chu",
                "hexing-bifa",
                "qingliang-daxuefa",
        });

    if (! arg)
        {
                write("格式：txbw <技能名称>, 举例：txbw shaolin-shenfa\n");
                return 1;
        }

    if (sscanf(arg, "%s", skill) != 1)
        {
                write("格式：txbw <技能名称>, 举例：txbw shaolin-shenfa\n");
                return 1;
        }

    if ((int)me->query("combat_exp") < 800000)
        {
                write("你的实战经验不足，还是要多努力练功。\n");
                return 1;
        }

    if ((int)me->query("balance") < 5000 * 100 * 100)//5000gold
        {
                write("你的存款不足。\n");
                return 1;
        }

    for(i = 0; i < sizeof(skill_list); i++)
    {
        if (skill == skill_list[i])
        {
            if (me->query_skill(skill_list[i], 1) > 0)
            {
                write("这个技能你已经掌握，不要再浪费金钱了！\n");
                return 1;
            }
            else
            {
                me->improve_skill(skill_list[i], 1500000);
                me->add("balance", -5000 * 100 * 100);
                n = 0;
                return 1;
            }
        }
        n = 1;
    }

    if (n > 0)
        {
                write("看清楚了，这里没有你要学的技能！\n");
                return 1;
        }
}
