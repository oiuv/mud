#include <ansi.h>
#include "wudu.h"

inherit NPC;
inherit F_MASTER;
inherit F_DEALER;

mixed ask_me();

void create()
{
        set_name("游方道人", ({ "dao ren", "dao", "daoren" }) );
        set("gender", "男性" );
        set("age", 34);
        set("long", "一个白净矮胖的道士，见谁都笑眯眯的，正悠\n"
                    "闲的品着一杯香茶。\n");
        set("max_qi", 1800);
        set("max_jing", 1000);
        set("max_neili", 2000);
        set("neili", 2000);
        set("jiali", 50);
        set("combat_exp", 200000);
        set("attitude", "friendly");

        set_skill("force", 80);
        set_skill("wudu-xinfa", 80);
        set_skill("dodge", 80);
        set_skill("jinshe-youshenbu", 80);
        set_skill("strike", 80);
        set_skill("tianchan-zhang", 80);
        set_skill("claw", 80);
        set_skill("wusheng-zhao", 80);
        set_skill("parry", 80);
        set_skill("literate", 50);
        set_skill("poison", 80);
        set_skill("wudu-qishu", 80 );
        set_skill("martial-cognize", 60);

        map_skill("force", "wudu-xinfa");
        map_skill("dodge", "jinshe-youshenbu");
        map_skill("strike", "tianchan-zhang");
        map_skill("claw", "wusheng-zhao");
        map_skill("parry", "wusheng-zhao");
        map_skill("poison", "wudu-qishu");

        prepare_skill("strike", "tianchan-zhang");
        prepare_skill("claw", "wusheng-zhao");

        set("inquiry", ([
                "五毒教"  : (: ask_me :),
                "回去"    : (: ask_me :),
                "回教"    : (: ask_me :),
                "回五毒教": (: ask_me :),
        ]) );

        create_family("五毒教", 13, "护法弟子");

        set("vendor_goods", ([
               "/d/wudu/obj/jiedudan" : 300000,
        ]));

        setup();
        set("startroom", "/d/wudu/neijin");
        carry_object("/clone/misc/cloth")->wear();
        add_money("silver", 30);
}

void init()
{
        object ob;

        ::init();
        if (interactive(ob = this_player()) && ! is_fighting())
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }
        add_action("do_list", "list");
        add_action("do_buy", "buy");
}

void greeting(object ob)
{
        if (! ob || environment(ob) != environment() ) return;
        switch(random(3))
	{
	case 0:
        	say(CYN "游方道人嘿嘿一阵奸笑道：这位" + RANK_D->query_respect(ob) +
                    CYN "，也是来住店的吗？\n" NOR);
                break;
        case 1:
                say(CYN "游方道人点了点手道：这位" + RANK_D->query_respect(ob) +
                    CYN "请过这里坐，这是要去那啊？\n" NOR);
                break;
        case 2:
                say(CYN "游方道人面现惊讶之色道：这位" + RANK_D->query_respect(ob) +
                    CYN "眉现黑气，近日会有大难。\n游方道人继续说道：贫道有一些随身"
                    "丹丸可以卖给你，或许可救你一命。\n" NOR);
                break;
        }
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > 0)
        {
                command("say 我教弟子贵在随心所欲，不收伪君子。");
                return;
        }
        command("recruit " + ob->query("id"));
        ob->set("title", "五毒教教众");
        return;
}

mixed ask_me()
{
        object ob, me;
        me = this_player();

        if ((string)me->query("family/family_name") != "五毒教")
                return "你大爷的，你罗里八嗦到底想说啥子？";

        if (find_object(query("startroom")) != environment())
                return "我这里还有事，你就自己走回去吧。";

        command("say 这位"+ RANK_D->query_respect(me) + "来的正好，这里"
                "正有马车要回山办事，就让他们送你一程吧。\n");

        message_vision(HIC "游方道人一招手，一辆马车驶过来停在门前。\n$N"
                       HIC "急忙钻进车中，只听一阵清脆的鞭响，马车绝尘而"
                       "去。\n\n" NOR, me);

        ob = load_object("/d/wudu/damen");
        ob = find_object("/d/wudu/damen");

        message("vision", HIC "\n远处一辆马车急驶而来，车门一开" +
                          me->query("name") + HIC "从里面钻了出来"
                          "。\n\n" NOR, environment(me), ({me}));

        me->move("/d/wudu/damen");
        tell_object(me, CYN "\n车把势说道：这位" + RANK_D->query_respect(me) +
                        CYN "已经到了，请下车吧。\n\n" NOR);
        return 1;

}
