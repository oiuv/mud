inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#include <ansi.h>
#include "xuedao.h"

mixed ask_skill1();

void create()
{
        set_name("胜谛", ({ "sheng di", "sheng", "di" }));
        set("long", @LONG
这是一个身形魁梧的西藏僧人，神色冷漠。武
功是同门中最高的一人。
LONG);
        set("gender", "男性");
        set("age", 35);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 22);
        set("int", 21);
        set("con", 24);
        set("dex", 22);
        set("max_qi", 5000);
        set("max_jing", 2500);
        set("neili", 2800);
        set("max_neili", 2800);
        set("jiali", 30);
        set("combat_exp", 250000);

        set_skill("force", 160);
        set_skill("mizong-neigong", 160);
        set_skill("parry", 160);
        set_skill("blade", 140);
        set_skill("xueshan-dao", 140);
        set_skill("sword", 160);
        set_skill("mingwang-jian", 160);
        set_skill("dodge", 160);
        set_skill("shenkong-xing", 160);
        set_skill("hand", 140);
        set_skill("dashou-yin", 140);
        set_skill("cuff", 140);
        set_skill("yujiamu-quan", 140);
        set_skill("lamaism", 160);
        set_skill("literate", 140);
        set_skill("martial-cognize", 160);

        map_skill("force", "mizong-neigong");
        map_skill("dodge", "shenkong-xing");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");
        map_skill("parry", "mingwang-jian");
        map_skill("sword", "mingwang-jian");
        map_skill("blade", "xueshan-dao");

        prepare_skill("cuff", "yujiamu-quan");
        prepare_skill("hand", "dashou-yin");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "sword.ruo" :),
                (: perform_action, "sword.xiang" :),
                (: perform_action, "hand.yin" :),
                (: perform_action, "cuff.jiang" :),
                (: exert_function, "recover" :),
        }) );

        create_family("血刀门", 5, "弟子");
        set("class", "bonze");

        set("inquiry", ([
                "冰河开封" : (: ask_skill1 :),
        ]));

	set("coagents", ({
		([ "startroom" : "/d/xuedao/shandong3",
		   "id" : "xuedao laozu" ]),
	}));

        setup();
        carry_object("/d/xueshan/obj/y-jiasha")->wear();
        carry_object("/clone/weapon/changjian")->wield();

        add_money("silver", 10);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if (ob->query("class") != "bonze")
        {
                ob->set_temp("pending/join_bonze", 1);
                command("say 你不是出家人，我们血刀门是不会收留的。"
                        "如果你要出家，请找善勇师弟。");
                return;
        }

        if (ob->query("shen") > 0)
        {
                command("say 我正想找你们侠义道的晦气。\n");
                this_object()->kill_ob(ob);
                return;
        }

        if ((int)ob->query_skill("lamaism", 1) < 50)
        {
                command("say 入我血刀门，修习密宗佛法是首要的。\n");
                return;
        }

        if ((int)ob->query_skill("force") < 70)
        {
                command("say 你这个笨蛋！怎么不先把内功练好！\n");
                return;
        }

        command("recruit " + ob->query("id"));
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/xueshan-dao/kai"))
                return "我不是都已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我血刀门的，再罗嗦我宰了你！";

        if (me->query_skill("xueshan-dao", 1) < 1)
                return "你连雪山刀法都没学，还罗嗦什么？";

        if (me->query("gongxian") < 50)
                return "老祖说了，咋们的绝技不传无功之人。";

        if (me->query("shen") > -3000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 100)
                return "你的内功修为实在太差，快去多练练再来。";

        if (me->query("max_neili") < 600)
                return "你的内力差成这样，居然还好意思来找我？";

        if (me->query_skill("xueshan-dao", 1) < 80)
                return "等你把雪山刀法练熟了再来找我吧。";

        message_vision(HIY "$n" HIY "微微一笑，在$N" HIY "耳边轻声嘀咕了几句，然后"
                       "顺手拔出腰\n间的刚刀凌空劈斩了几下，霎时只见刀光一展而过，"
                       "招式煞\n是惊奇。$N" HIY "看后若有所悟的点了点头。\n" NOR, me,
                       this_object());

        command("nod");
        command("say 招数便是如此，你看懂了多少？");
        tell_object(me, HIC "你学会了「冰河开封」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("xueshan-dao"))
                me->improve_skill("xueshan-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/xueshan-dao/kai", 1);
        me->add("gongxian", -50);

        return 1;
}