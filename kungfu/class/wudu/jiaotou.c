#include <ansi.h>
#include "wudu.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
        set_name("沙千里", ({ "sha qianli", "sha", "qianli" }));
        set("nickname", HIR "黑龙" NOR);
        set("long",@LONG
他就是五毒教的护法弟子沙千里，身材魁梧，方
面大耳。在教中转管招募教众，教授弟子们的入
门功夫。
LONG);
        set("title","五毒教护法弟子");
        set("gender", "男性");
        set("age", 32);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 20);
        set("int", 20);
        set("con", 20);
        set("dex", 20);
        set("max_qi", 3000);
        set("max_jing", 3000);
        set("neili", 1000);
        set("max_neili", 1000);
        set("jiali", 40);
        set("combat_exp", 200000);
        set("score", 5000);

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

        set("coagents", ({
                ([ "startroom" : "/d/wudu/dating",
                   "id"        : "qi yunao" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "身形一晃，挡在$n" CYN
                                "跟前，厉声说道：非本教弟子，不得进"
                                "入本教禁地。" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？快给我放下来！"
                                NOR,
        ]));

        create_family("五毒教", 13, "护法弟子");

        setup();

        carry_object("/d/wudu/npc/obj/ganggou")->wield();
        carry_object("/d/city/obj/cloth")->wear();

        add_money("silver",30);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > -1000)
        {
                command("say 我教弟子贵在随心所欲，不收伪君子");
                return;
        }
        command("recruit " + ob->query("id"));
        ob->set("title", "五毒教教众");
        return;
}
