#include <ansi.h>
#include "kunlun.h"

inherit NPC;
inherit F_MASTER;
inherit F_GUARDER;

void create()
{
	set_name("西华子", ({"xi huazi", "xi", "huazi"}));
	set("long", "他是昆仑派第五代弟子，满腮虬髯，性子十分暴躁。\n");
	set("gender", "男性");
	set("age", 38);
	set("attitude", "heroism");
	set("str", 25);
	set("int", 25);
	set("con", 25);
	set("dex", 25);
        set("max_qi", 2000);
        set("max_jing", 1500);
        set("neili", 3000);
        set("max_neili", 3000);
        set("jiali", 100);
        set("combat_exp", 1000000);

        set_skill("force", 150);
        set_skill("kunlun-xinfa", 150);
        set_skill("dodge", 120);
        set_skill("chuanyun-bu", 120);
        set_skill("hand", 120);
        set_skill("sanyin-shou", 120);
        set_skill("cuff", 120);
        set_skill("zhentian-quan", 120);
        set_skill("parry", 120);
        set_skill("sword", 150);
        set_skill("xunlei-jian", 150);
        set_skill("throwing", 120);
        set_skill("kunlun-qifa", 120);
        set_skill("literate", 140);
        set_skill("liangyi-shengong", 120);
        set_skill("zhengliangyi-jian", 120);
        set_skill("martial-cognize", 100);

        set("no_teach", ([
                "liangyi-shengong"  : "两仪神功需得掌门人亲自传授。",
                "zhengliangyi-jian"  : "正两仪剑法乃本门神功，需要掌门人亲自传授。",
        ]));

        map_skill("force", "liangyi-shengong");
        map_skill("dodge", "chuanyun-bu");
        map_skill("parry", "xunlei-jian");
        map_skill("sword", "zhengliangyi-jian");
        map_skill("cuff", "zhentian-quan");
        map_skill("hand", "sanyin-shou");
        map_skill("throwing", "kunlun-qifa");

        prepare_skill("strike", "kunlun-zhang");
        prepare_skill("cuff", "zhentian-quan");

        set("coagents", ({
                ([ "startroom" : "/d/kunlun/tieqinju",
                   "id"        : "he taichong" ]),
        }));

        set("guarder", ([
                "refuse_other": CYN "$N" CYN "对$n" CYN "怒喝道："
                                "他奶奶的，你是什么人？昆仑派岂是"
                                "让你随便走动地方？" NOR,
                "refuse_carry": CYN "$N" CYN "对$n" CYN "喝道：你"
                                "背上背的是什么人？给我放下来！" NOR,
        ]));

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
                command("say 师傅不准我收女弟子，你去找我几个师妹吧。");
                return;
        }

        if ((int)me->query("combat_exp") < 10000)
        {
                command("say 你的江湖经验实在太浅，还是锻炼锻炼再说吧。");
                return;
        }

        if ((int)me->query_skill("kunlun-xinfa", 1) < 30)
        {
                command("say 你对本门的内功心法所知尚浅，练习高了再来找我吧。");
                return;
        }

        command("say 既然" + RANK_D->query_respect(me) + "这么努力，我就收下你吧。");
        command("recruit " + me->query("id"));
}
