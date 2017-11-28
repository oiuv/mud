// kongyiji.c 孔已己

#include <ansi.h>

inherit NPC;

string get_yueyin();

void create()
{
        set_name("孔已己", ({ "kong yiji", "kong", "yiji" }));
        set("long", "只见他戴着一副黑边眼睛，身穿一件灰布\n"
                    "长马褂，背有点驼。双手不时的敲打桌上\n"
                    "的铁算盘，摇头晃耳的样子象是在算什么\n"
                    "帐。镖局里大小账务都是经他手来管理的。");
        set("title", "镇远镖局账房先生");
        set("nickname", YEL "精打细算" NOR);
        set("gender", "男性");
        set("age", 60);
        set("shen_type", 1);
        set("class", "scholar");
        set("attitude", "peaceful");
        set("str", 20);
        set("int", 20);
        set("dex", 20);
        set("con", 20);
        set("per", 20);

        set("combat_exp", 1000);
        set_skill("literate", 150);
        set_skill("dodge", 10);
        set_skill("unarmed", 10);

        set("inquiry", ([
                "yueyin": (: get_yueyin :),
                "月银": (: get_yueyin :),
        ]) );

        setup();
        carry_object("/clone/misc/cloth")->wear();
}

string get_yueyin()
{
        object me = this_player();
        int paytimes;

        if ((string)me->query("family/family_name") != "八卦门")
        {
                return ("你看样子不是镇远镖局的吧，这怎么能领取月银呢？");
        }

        if (me->query("combat_exp") < 60000)
        {
                return ("你还是先在镖局学着做点事再说吧。");
        }

        paytimes = (int)(me->query("mud_age") / 7200);

        if (me->query("paytimes") < paytimes)
        {
                if (! (int)me->query("money_get"))
                        me->set("money_get", 500);

                if ((int)me->query("money_get") > (int)me->query("combat_exp"))
                        return ("你先去为镖局做点事后再来领取月银！");
           else {
                        add_money("silver", 50);
                        command("give 50 silver to " + me->query("id"));
                        me->add("money_get", 500);
                        me->add("paytimes", 1);
                        return ("这是你本月的月银，收好吧。");
                }
        }
        me->save();
        return ("一个月的时间还没道，怎么又来领月银，是不是欺负我年纪大了！");
}
