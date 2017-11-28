#include <ansi.h>
#include "lingjiu.h"

inherit NPC;
inherit F_MASTER;

void create()
{
        set_name("程青霜", ({ "cheng qingshuang", "cheng"}));
        set("long", @LONG
程青霜乃是缥缈峰灵鹫宫中九天九部中钧天部
的副首领。只见她三十开外，长得颇有姿色。
LONG);
        set("title", "缥缈缝灵鹫宫");
        set("nickname", HIY "钧天部副首领" NOR);
	set("gender", "女性");
        set("age", 37);
	set("attitude", "peaceful");
	set("str", 30);
	set("int", 30);
	set("con", 30);
	set("dex", 30);

	set("qi", 2400);
	set("max_qi", 2400);
	set("jing", 1000);
	set("max_jing", 1000);
	set("neili", 2800);
	set("max_neili", 2800);
	set("jiali", 80);

	set("combat_exp", 800000);
	set("score", 3000);
	set_skill("force", 120);
	set_skill("lingjiu-xinfa", 120);
	set_skill("dodge", 120);
	set_skill("yueying-wubu", 120);
	set_skill("parry", 120);
	set_skill("strike", 120);
	set_skill("piaomiao-zhang", 120);
	set_skill("sword", 140);
 	set_skill("tianyu-qijian", 140);
        set_skill("literate", 150);
        set_skill("martial-cognize", 100);

	map_skill("force", "lingjiu-xinfa");
	map_skill("strike","piaomiao-zhang");
	map_skill("dodge", "yueying-wubu");
	map_skill("parry", "liuyang-zhang");
	map_skill("sword", "tianyu-qijian");

	prepare_skill("strike", "piaomiao-zhang");

	create_family("灵鹫宫", 3, "副首领");

        set("chat_chance_combat", 120);
        set("chat_msg_combat", ({
                (: perform_action, "sword.ju" :),
                (: perform_action, "sword.shan" :),
                (: perform_action, "sword.huan" :),
        }));

	setup();

	carry_object("/d/lingjiu/obj/qingyi")->wear();
        carry_object("/d/lingjiu/obj/doupeng")->wear();
	carry_object("/clone/weapon/changjian")->wield();
	add_money("silver", 15);
}

void attempt_apprentice(object ob)
{
        if (! permit_recruit(ob))
                return;

        if ((string)ob->query("gender") == "男性")
        {
                command("hmm");
                command("say 走开，灵鹫宫素来不收男徒。");
                return;
        }

        if ((string)ob->query("gender") != "女性")
        {
                command("sneer");
                command("say 灵鹫宫又不是皇宫，你一个太监跑来做甚？");
                return;
        }

        if ((int)ob->query_skill("lingjiu-xinfa", 1) < 25) 
        {
                command("say 你把本门的心法炼好了再来找我。");
                return;
        }

        command("nod2");
        command("say 那你以后就跟着我吧。");
        command("recruit " + ob->query("id"));

        if ((string)ob->query("class") != "dancer")
                ob->set("class", "dancer");
}
