#include <ansi.h>
#include "riyue.h"

#define GUANGLING     "/clone/item/xiaoao/guanglingsan"

inherit NPC;
inherit F_GUARDER;
inherit F_COAGENT;

void create()
{
        object ob;
	set_name("曲洋", ({ "qu yang", "qu", "yang"}));
        set("title", "日月神教前辈长老");
	set("gender", "男性" );
	set("age", 45);
	set("long", "他就是日月神教十大长老之一，琴技天下无双。\n" );
	set("attitude", "friendly");

        set("max_qi", 5400);
        set("max_jing", 4000);
        set("neili", 7000);
        set("max_neili", 7000);
        set("jiali", 250);
        set("combat_exp", 3000000);
        set("score", 50000);

        set_skill("force", 240);
        set_skill("tianhuan-shenjue", 240);
        set_skill("riyue-xinfa", 220);
        set_skill("dodge", 220);
        set_skill("juechen-shenfa", 220);
        set_skill("cuff", 220);
        set_skill("zhenyu-quan", 220);
        set_skill("claw", 220);
        set_skill("poyue-zhao", 220);
        set_skill("parry", 220);
        set_skill("hammer", 240);
        set_skill("pangu-qishi", 240);
        set_skill("club", 220);
        set_skill("jinyuan-gun", 220);
        set_skill("martial-cognize", 220);
        set_skill("literate", 180);
	set_skill("chuixiao-jifa", 320);
	set_skill("xiaoao-jianghu", 320);

	map_skill("chuixiao-jifa", "xiaoao-jianghu");
        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "tianhuan-shenjue");
        map_skill("hammer", "pangu-qishi");
        map_skill("club", "jinyuan-gun");
        map_skill("parry", "pangu-qishi");
        map_skill("cuff", "zhenyu-quan");
        map_skill("claw", "poyue-zhao");

        prepare_skill("claw", "poyue-zhao");
        prepare_skill("cuff", "zhenyu-quan");

	create_family("日月神教", 12, "长老");

        set("coagents", ({
                ([ "startroom" : "/d/henshan/furongfeng",
                   "id"        : "liu zhengfeng" ]),
        }));

        set_temp("apply/damage", 200);
        set_temp("apply/unarmed_damage", 100);
        set_temp("apply/armor", 200);

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.tong" :),
                (: perform_action, "claw.duan" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),
        }));

	setup();

        if (clonep())
        {
                ob = find_object(GUANGLING);
                if (! ob) ob = load_object(GUANGLING);
                if (! environment(ob)) ob->move(this_object());
        }
        carry_object("/d/heimuya/npc/obj/jinpao")->wear();
        set_temp("handing", carry_object("/d/henshan/npc/obj/zhuxiao"));
}

void init()
{
        string startroom;
        object ob;

        if (interactive(ob = this_player())
           && ! is_fighting())
        {
                if (! ob || environment(ob) != environment())
                        return;

                if (stringp(startroom = query("startroom"))
                   && find_object(startroom) == environment())
                        command("play xiaoao-jianghu");
                else
                        say(CYN + this_object()->name() +
                            CYN "深深地叹了口气。\n" NOR);
        }
        return;
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        command("say 老夫年岁已大，不再收徒，你去找其他长老好了。");
}
