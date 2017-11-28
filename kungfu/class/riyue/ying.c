#include <ansi.h>
#include "riyue.h"

#define YUCHANG    "/clone/lonely/yuchang"

inherit NPC;
inherit F_MASTER;

void create()
{
        object ob;
        set_name("任盈盈", ({ "ren yingying", "ren", "yingying", "ying"}));
        set("nickname", HIW "圣姑" NOR );
        set("title", "日月神教");
        set("long", @LONG
这就是日月神教教主任我行之女，教中被人称
作「圣姑」的任盈盈。只见她青衫小袖，明艳
不可方物，却是颦眉微皱，似乎不高兴。
LONG);
	set("gender", "女性" );
        set("class", "scholar");
        set("age", 19);
        set("attitude", "friendly");
        set("shen_type", -1);
        set("str", 36);
        set("int", 36);
        set("con", 36);
        set("dex", 36);
        
        set("max_qi", 3200);
        set("max_jing", 2000);
        set("neili", 3500);
        set("max_neili", 3500);
        set("jiali", 100);
        set("combat_exp", 1000000);
        set("score", 10000);

        set_skill("force", 160);
        set_skill("riyue-xinfa", 160);
        set_skill("tianhuan-shenjue", 80);
        set_skill("dodge", 160);
        set_skill("juechen-shenfa", 160);
        set_skill("dagger", 160);
        set_skill("jifeng-cixuefa", 160);
        set_skill("parry", 160);
        set_skill("strike", 140);
        set_skill("qingmang-zhang", 140);
        set_skill("throwing", 140);
        set_skill("heixue-shenzhen", 140);
        set_skill("martial-cognize", 150);
        set_skill("literate", 220);
        set_skill("tanqin-jifa", 240);
        set_skill("guangling-san", 220);
        set_skill("qingxin-pushan", 240);
        set_skill("xiaoao-jianghu", 220);

        map_skill("tanqin-jifa", "qingxin-pushan");
        map_skill("dodge", "juechen-shenfa");
        map_skill("force", "riyue-xinfa");
        map_skill("strike", "qingmang-zhang");
        map_skill("dagger", "jifeng-cixuefa");
        map_skill("parry", "jifeng-cixuefa");
        map_skill("throwing", "heixue-shenzhen");

        prepare_skill("strike", "qingmang-zhang");

        set("no_teach", ([
                "tianhuan-shenjue" : "这门内功我都没学好，怎么教你呀。",
        ]));

        create_family("日月神教", 14, "圣姑");

        set("inquiry", ([
                "天蝎藏针" : "这招你去让桑三娘教你吧。",
                "令狐冲"   : "……他…他现在……唉……",
                "鱼肠剑"   : "这是我的随身物品，你打听这个干嘛？",
        ]));

	set("chat_chance_combat", 120);
	set("chat_msg_combat", ({
		(: perform_action, "dagger.cang" :),
                (: perform_action, "throwing.luo" :),
		(: exert_function, "recover" :),
		(: exert_function, "powerup" :),
	}) );
        setup();

        if (clonep())
        {
                ob = find_object(YUCHANG);
                if (! ob) ob = load_object(YUCHANG);
                if (! environment(ob))
                {
                        ob->move(this_object());
                        ob->wield();
                } else
                {
                        ob = new("/d/heimuya/npc/obj/bishou");
                        ob->move(this_object());
                        ob->wield();
                }
        }
        carry_object("/d/city/npc/cloth/belt")->wear();
        carry_object("/d/city/npc/cloth/moon-dress")->wear();
        set_temp("handing", carry_object("/d/kunlun/obj/jwqin"));
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((int)ob->query("shen") > 0)
        {
                command("heng");
                command("say 我日月神教从来不和正派人士结交，你还是走吧。");
                return;
        }

        if ((string)ob->query("gender") != "女性")
        {
                command("say 你还是去找教内的其他人吧。");
                return;
        }

        command("sigh");
        command("say 那你以后就跟着我吧。");
        command("recruit " + ob->query("id"));
        return;
}

void init()
{
        object ob;
        if (interactive(ob = this_player())
           && ! is_fighting()
           && random(10) < 3)
        {
                remove_call_out("greeting");
                call_out("greeting", 1, ob);
        }    
}

void greeting(object ob)
{ 
        if (! ob || environment(ob) != environment())
                return;
        command("play qingxin-pushan");
        return;
}
