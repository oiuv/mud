#include <ansi.h>
#include "kunlun.h"

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("詹春", ({"zhan chun", "zhan", "chun"}));
	set("long", "她是何太冲最喜欢的弟子，长得倒也颇为俏丽。\n");
	set("gender", "女性");
	set("age", 24);
	set("attitude", "friendly");
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 25);
        set("max_qi", 800);
        set("max_jing", 600);
        set("neili", 1200);
        set("max_neili", 1200);
        set("jiali", 30);
        set("combat_exp", 350000);

        set_skill("force", 80);
        set_skill("kunlun-xinfa", 80);
        set_skill("dodge", 80);
        set_skill("chuanyun-bu", 80);
        set_skill("hand", 80);
        set_skill("sanyin-shou", 80);
        set_skill("cuff", 80);
        set_skill("zhentian-quan", 80);
        set_skill("parry", 80);
        set_skill("sword", 80);
        set_skill("xunlei-jian", 80);
        set_skill("throwing", 80);
        set_skill("kunlun-qifa", 80);
        set_skill("literate", 100);
        set_skill("martial-cognize", 60);

        map_skill("force", "kunlun-xinfa");
        map_skill("dodge", "chuanyun-bu");
        map_skill("parry", "xunlei-jian");
        map_skill("sword", "xunlei-jian");
        map_skill("cuff", "zhentian-quan");
        map_skill("hand", "sanyin-shou");
        map_skill("throwing", "kunlun-qifa");

        prepare_skill("strike", "kunlun-zhang");
        prepare_skill("cuff", "zhentian-quan");

	create_family("昆仑派", 5, "弟子");

        set("chat_chance_combat", 100);
        set("chat_msg_combat", ({
                (: perform_action, "cuff.shi" :),
                (: perform_action, "sword.xun" :),
                (: exert_function, "recover" :),
                (: exert_function, "powerup" :),

        }) );

	setup();
        carry_object("/d/kunlun/obj/sword")->wield();
        carry_object("/d/kunlun/obj/pao3")->wear();
}

void attempt_apprentice(object me)
{
        if (! permit_recruit(me))
                return;

        if (me->query("gender") != "女性")
        {
                command("say 师傅不准我收男弟子，你去找我师兄去吧。");
                return;
        }

        command("say 既然" + RANK_D->query_respect(me) + "慕昆仑派之名，千"
                "里而来，我昆仑派自当广纳天下英才，我就收下你吧。");
        command("recruit " + me->query("id"));
}
