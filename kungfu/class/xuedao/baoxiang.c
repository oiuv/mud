inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

#include <ansi.h>
#include "xuedao.h"

mixed ask_skill1();

void create()
{
        set_name("宝象", ({ "bao xiang", "bao", "xiang" }));
        set("long", @LONG
一个极高极瘦的僧人，俩眼凶芒四射。此人在
血刀老祖门下，最是心狠手辣。
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
        set_skill("xuedao-dafa", 80);
        set_skill("parry", 160);
        set_skill("blade", 160);
        set_skill("xueshan-dao", 160);
        set_skill("honglian-dao", 160);
        set_skill("dodge", 160);
        set_skill("shenkong-xing", 160);
        set_skill("hand", 160);
        set_skill("dashou-yin", 160);
        set_skill("cuff", 160);
        set_skill("yujiamu-quan", 160);
        set_skill("lamaism", 160);
        set_skill("literate", 140);
        set_skill("martial-cognize", 160);

        map_skill("force", "mizong-neigong");
        map_skill("dodge", "shenkong-xing");
        map_skill("hand", "dashou-yin");
        map_skill("cuff", "yujiamu-quan");
        map_skill("parry", "honglian-dao");
        map_skill("blade", "honglian-dao");

        prepare_skill("cuff", "yujiamu-quan");
        prepare_skill("hand", "dashou-yin");

        set("no_teach", ([
                "xuedao-dafa" : "血刀大法必须由老祖亲传。",
        ]));

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "blade.huo" :),
                (: perform_action, "hand.yin" :),
                (: perform_action, "cuff.jiang" :),
                (: exert_function, "recover" :),
        }) );

        create_family("血刀门", 5, "弟子");
        set("class", "bonze");

        set("inquiry", ([
                "流星火雨" : (: ask_skill1 :),
        ]));

	set("coagents", ({
		([ "startroom" : "/d/xuedao/shandong3",
		   "id" : "xuedao laozu" ]),
	}));

        setup();
        carry_object("/d/xueshan/obj/y-jiasha")->wear();
        carry_object("/clone/weapon/gangdao")->wield();

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

        if ((int)ob->query_skill("lamaism", 1) < 40)
        {
                command("say 入我血刀门，修习密宗佛法是首要的。\n");
                return;
        }

        if ((int)ob->query_skill("force") < 75)
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

        if (me->query("can_perform/honglian-dao/huo"))
                return "我不是都已经教过你了吗？";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我血刀门的，再罗嗦我宰了你！";

        if (me->query_skill("honglian-dao", 1) < 1)
                return "你连红莲刀法都没学，还罗嗦什么？";

        if (me->query("gongxian") < 80)
                return "老祖说了，咋们的绝技不传无功之人。";

        if (me->query("shen") > -8000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 120)
                return "你的内功修为实在太差，快去多练练再来。";

        if (me->query("max_neili") < 800)
                return "你的内力差成这样，居然还好意思来找我？";

        if (me->query_skill("honglian-dao", 1) < 80)
                return "等你把红莲刀法练熟了再来找我吧。";

        message_vision(HIY "$n" HIY "狞笑数声，伸手将$N" HIY "招到身前，低声在$N" HIY
                       "耳旁嘀咕了半\n天。然后又拔出腰刀翻转数下，斜撩而出。似乎是"
                       "一种颇为\n独特的刀诀。\n" NOR, me, this_object());

        command("bored");
        command("say 好了，好了。你自己去练吧。");
        tell_object(me, HIC "你学会了「流星火雨」。\n" NOR);

        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("honglian-dao"))
                me->improve_skill("honglian-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/honglian-dao/huo", 1);
        me->add("gongxian", -80);

        return 1;
}