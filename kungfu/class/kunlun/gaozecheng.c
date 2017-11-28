#include <ansi.h>
#include "kunlun.h"

inherit NPC;
inherit F_MASTER;

void create()
{
	set_name("高则成", ({"gao zecheng", "gao", "zecheng"}));
	set("long", "他穿青色长袍，背上斜插长剑，二十八九岁年纪。\n"
                    "脸罩寒霜，一副要惹事生非的模样。\n");
	set("gender", "男性");
	set("age", 28);
	set("attitude", "heroism");
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 25);
        set("max_qi", 1000);
        set("max_jing", 800);
        set("neili", 2000);
        set("max_neili", 2000);
        set("jiali", 50);
        set("combat_exp", 500000);

        set_skill("force", 100);
        set_skill("kunlun-xinfa", 100);
        set_skill("dodge", 80);
        set_skill("chuanyun-bu", 80);
        set_skill("hand", 80);
        set_skill("sanyin-shou", 80);
        set_skill("cuff", 80);
        set_skill("zhentian-quan", 80);
        set_skill("parry", 80);
        set_skill("sword", 100);
        set_skill("xunlei-jian", 100);
        set_skill("throwing", 50);
        set_skill("kunlun-qifa", 50);
        set_skill("literate", 100);
        set_skill("martial-cognize", 80);

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

        if (me->query("gender") == "女性")
        {
                command("say 师傅不准我收女弟子，你去找我师姊吧。");
                return;
        }

        command("say 既然" + RANK_D->query_respect(me) + "慕昆仑派之名，千"
                "里而来，我昆仑派自当广纳天下英才，我就收下你吧。");
        command("recruit " + me->query("id"));
}
