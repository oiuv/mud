#include <ansi.h>
#include "riyue.h"

inherit NPC;
inherit F_MASTER;

mixed ask_skill1();

void create()
{
        set_name("秦伟邦", ({ "qin weibang", "qin", "weibang"}));
        set("title", "日月神教青旗旗主");
        set("long", @LONG
这是日月神教青旗旗主秦伟邦，三十多岁年纪
便已被提拔为旗主，可谓功劳不小。
LONG);
	set("gender", "男性" );
        set("class", "scholar");
        set("age", 32);
        set("attitude", "peaceful");
        set("shen_type", -1);
        set("str", 36);
        set("int", 36);
        set("con", 36);
        set("dex", 36);
        
        set("max_qi", 3400);
        set("max_jing", 2200);
        set("neili", 3600);
        set("max_neili", 3600);
        set("jiali", 120);
        set("combat_exp", 1500000);
        set("score", 10000);

        set_skill("force", 160);
        set_skill("riyue-xinfa", 160);
        set_skill("dodge", 150);
        set_skill("feiyan-zoubi", 150);
        set_skill("blade", 160);
        set_skill("danding-dao", 160);
        set_skill("parry", 150);
        set_skill("cuff", 150);
        set_skill("zhenyu-quan", 150);
        set_skill("claw", 150);
        set_skill("poyue-zhao", 150);
        set_skill("martial-cognize", 150);
        set_skill("literate", 160);

        map_skill("dodge", "feiyan-zoubi");
        map_skill("force", "riyue-xinfa");
        map_skill("blade", "danding-dao");
        map_skill("parry", "danding-dao");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

        create_family("日月神教", 14, "旗主");

        set("inquiry", ([
                "环环相扣" : (: ask_skill1 :),
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "blade.kou" :),
                (: perform_action, "cuff.tong" :),
                (: perform_action, "claw.duan" :),
		(: exert_function, "recover" :),
	}) );
        setup();

        carry_object("/d/heimuya/npc/obj/jinpao")->wear();
        carry_object("clone/weapon/gangdao")->wield();
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > 0)
        {
                command("heng");
                command("say 我日月神教从来不和正派人士结交，快给我滚开。");
                return;
        }

        if ((string)ob->query("gender") == "女性")
        {
                command("sneer");
                command("say 教内规矩甚严，我职位未到，不敢私收女徒。");
                return;
        }

        command("nod2");
        command("say 那你就跟着我吧，入教之后的各种规矩可要多注意。");
        command("recruit " + ob->query("id"));
        return;
}

mixed ask_skill1()
{
        object me;

        me = this_player();

        if (me->query("can_perform/danding-dao/kou"))
                return "这招我已经教过你了，自己下去练吧。";

        if (me->query("family/family_name") != query("family/family_name"))
                return "你又不是我日月神教的，跑来捣什么乱？";

        if (me->query_skill("danding-dao", 1) < 1)
                return "你连丹碇刀法都没学，还谈什么绝招可言？";

        if (me->query("gongxian") < 80)
                return "你在教内甚无作为，这招我暂时还不能传你。";

        if (me->query("shen") > -8000)
                return "你这样心慈手软，就算学会这招又有什么用？";

        if (me->query_skill("force") < 100)
                return "你的内功火候尚需提高，练好了再来找我吧。";

        if (me->query_skill("danding-dao", 1) < 80)
                return "你的丹碇刀法还练得不到家，自己下去练练再来吧！";

        message_sort(HIY "\n$n" HIY "点了点头，将$N" HIY "招至身边，在耳"
                     "旁低声细说良久，$N" HIY "听后不禁会心地一笑，看来大"
                     "有所悟。\n\n" NOR, me, this_object());

        command("nod");
        command("say 这招很简单，稍加练习便行。");
        tell_object(me, HIC "你学会了「环环相扣」。\n" NOR);
        if (me->can_improve_skill("blade"))
                me->improve_skill("blade", 1500000);
        if (me->can_improve_skill("danding-dao"))
                me->improve_skill("danding-dao", 1500000);
        me->improve_skill("martial-cognize", 1500000);
        me->set("can_perform/danding-dao/kou", 1);
        me->add("gongxian", -100);

        return 1;
}
